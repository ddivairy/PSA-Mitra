export async function sendGmailMessage(to: string, subject: string, body: string) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GMAIL_FROM } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GMAIL_FROM) {
    throw new Error('Konfigurasi Gmail belum lengkap.');
  }
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || typeof token.access_token !== 'string') {
    throw new Error('Gagal memperoleh token Gmail.');
  }
  const rawMessage = [
    `To: ${to}`,
    `From: ${GMAIL_FROM}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\r\n');
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: Buffer.from(rawMessage).toString('base64url') }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Gmail menolak pengiriman.');
  return typeof result.id === 'string' ? result.id : null;
}
