import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
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
    const body = (await req.json()) as ContactPayload;
    if (!body?.name || !body?.email || !body?.message) {
      return new Response(JSON.stringify({ error: 'name, email and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL');
    if (!fromEmail) throw new Error('GMAIL_FROM_EMAIL not configured');

    const accessToken = await getAccessToken();

    const subject = body.subject?.trim() || `New contact form message from ${body.name}`;
    const html = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${body.name}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      ${body.phone ? `<p><strong>Phone:</strong> ${body.phone}</p>` : ''}
      ${body.subject ? `<p><strong>Subject:</strong> ${body.subject}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${body.message}</p>
    `;

    const rfc2822 = [
      `From: ${fromEmail}`,
      `To: ${fromEmail}`,
      `Reply-To: ${body.name} <${body.email}>`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
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

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-contact-email error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});