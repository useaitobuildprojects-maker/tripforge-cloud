import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface ReplyPayload {
  message_id: string;
  to: string;
  subject: string;
  body: string;
}

function b64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id: Deno.env.get('GMAIL_CLIENT_ID') ?? '',
    client_secret: Deno.env.get('GMAIL_CLIENT_SECRET') ?? '',
    refresh_token: Deno.env.get('GMAIL_REFRESH_TOKEN') ?? '',
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as ReplyPayload;
    if (!body?.message_id || !body?.to || !body?.subject || !body?.body) {
      return new Response(JSON.stringify({ error: 'message_id, to, subject and body are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the caller can access this message (RLS scoped client)
    const { data: msg, error: msgErr } = await supabase
      .from('contact_messages')
      .select('id, agency_id, email')
      .eq('id', body.message_id)
      .maybeSingle();
    if (msgErr || !msg) {
      return new Response(JSON.stringify({ error: 'Message not found or access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL');
    if (!fromEmail) throw new Error('GMAIL_FROM_EMAIL not configured');

    const accessToken = await getAccessToken();

    const escaped = body.body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap">${escaped}</div>`;

    const rfc2822 = [
      `From: ${fromEmail}`,
      `To: ${body.to}`,
      `Reply-To: ${fromEmail}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(body.subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
    ].join('\r\n');

    const raw = b64url(rfc2822);

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!sendRes.ok) {
      const txt = await sendRes.text();
      throw new Error(`gmail send failed: ${txt}`);
    }

    // Mark as replied (RLS scoped — only succeeds for agency members / super admin)
    await supabase
      .from('contact_messages')
      .update({ status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', body.message_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-contact-reply error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});