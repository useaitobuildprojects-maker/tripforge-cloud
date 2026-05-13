import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface BookingPayload {
  customer_name: string;
  customer_email: string;
  reference: string;
  agency_name: string;
  vehicle?: string;
  pickup_date: string;
  return_date: string;
  pickup_location?: string;
  return_location?: string;
  amount?: number;
  currency?: string;
  service_type?: string;
  notes?: string;
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
  const { access_token } = await res.json();
  return access_token as string;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      dateStyle: 'medium', timeStyle: 'short',
    });
  } catch { return iso; }
}

function buildHtml(b: BookingPayload): string {
  const money = b.amount != null
    ? `${(b.currency || 'EUR')} ${Number(b.amount).toFixed(2)}`
    : null;
  const rows: Array<[string, string | null | undefined]> = [
    ['Reference', b.reference],
    ['Service', b.service_type],
    ['Vehicle', b.vehicle],
    ['Pickup', `${fmtDate(b.pickup_date)}${b.pickup_location ? ` — ${b.pickup_location}` : ''}`],
    ['Return', `${fmtDate(b.return_date)}${b.return_location ? ` — ${b.return_location}` : ''}`],
    ['Total', money],
  ];
  const tbody = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr>
      <td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">${k}</td>
      <td style="padding:8px 12px;color:#0f172a;font-size:13px;border-bottom:1px solid #e2e8f0;font-weight:500;">${v}</td>
    </tr>`)
    .join('');

  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="padding:28px 28px 8px;">
          <h1 style="margin:0 0 6px;color:#0f172a;font-size:22px;">Booking received</h1>
          <p style="margin:0;color:#475569;font-size:14px;line-height:1.5;">
            Thank you, ${b.customer_name.split(' ')[0]}. ${b.agency_name} has received your reservation request and will be in touch shortly to confirm.
          </p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tbody>${tbody}</tbody>
        </table>
        ${b.notes ? `<div style="padding:16px 28px;color:#475569;font-size:13px;white-space:pre-wrap;border-top:1px solid #e2e8f0;">${b.notes}</div>` : ''}
        <div style="padding:20px 28px;background:#f8fafc;color:#64748b;font-size:12px;">
          If anything looks wrong, just reply to this email.
        </div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:18px;">${b.agency_name}</p>
    </div>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as BookingPayload;
    if (!body?.customer_email || !body?.customer_name || !body?.reference) {
      return new Response(
        JSON.stringify({ error: 'customer_email, customer_name, reference are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const fromEmail = Deno.env.get('GMAIL_FROM_EMAIL');
    if (!fromEmail) throw new Error('GMAIL_FROM_EMAIL not configured');

    const accessToken = await getAccessToken();
    const subject = `Booking confirmation • ${body.agency_name} (${body.reference})`;
    const html = buildHtml(body);

    const rfc2822 = [
      `From: ${body.agency_name} <${fromEmail}>`,
      `To: ${body.customer_name} <${body.customer_email}>`,
      `Reply-To: ${fromEmail}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
    ].join('\r\n');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: b64url(rfc2822) }),
    });

    if (!sendRes.ok) throw new Error(`gmail send failed: ${await sendRes.text()}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-booking-confirmation error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});