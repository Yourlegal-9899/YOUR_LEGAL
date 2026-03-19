const normalizeToken = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/^Zoho-enczapikey\s*/i, '');
};

const sendZeptoMail = async ({ to, subject, html, text }) => {
  const token = normalizeToken(process.env.ZEPTOMAIL_TOKEN);
  const apiBase = String(process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.com').trim().replace(/\/+$/, '');
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'YourLegal';

  if (!token || !fromAddress) {
    throw new Error('ZeptoMail is not configured. Set ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_ADDRESS.');
  }

  const payload = {
    from: {
      address: fromAddress,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: to,
        },
      },
    ],
    subject,
    htmlbody: html || '',
    textbody: text || '',
  };

  const response = await fetch(`${apiBase}/v1.1/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.message || data?.error?.message || 'ZeptoMail request failed.';
    const code = data?.code || data?.error?.code;
    const status = response.status;
    const meta = [status, code].filter(Boolean).join('/');
    throw new Error(`ZeptoMail ${meta ? `(${meta})` : ''}: ${message}`);
  }

  return true;
};

module.exports = { sendZeptoMail };
