const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
const ZOHO_API_BASE_URL = process.env.ZOHO_API_BASE_URL || 'https://www.zohoapis.com';
const ZOHO_REQUIRED_ENV = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'];
const DEFAULT_LEAD_FIELDS = [
  'id',
  'Full_Name',
  'First_Name',
  'Last_Name',
  'Email',
  'Phone',
  'Mobile',
  'Company',
  'Lead_Source',
  'Lead_Status',
  'Created_Time',
  'Modified_Time',
].join(',');

let cachedAccessToken = null;
let tokenExpiresAt = 0;

const hasZohoEnv = () => ZOHO_REQUIRED_ENV.every((key) => Boolean(process.env[key]));

const requireZohoEnv = () => {
  const missing = ZOHO_REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Missing Zoho environment variables: ${missing.join(', ')}`);
    error.statusCode = 500;
    throw error;
  }
};

const requestAccessToken = async () => {
  requireZohoEnv();

  const body = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.access_token) {
    const error = new Error(data?.error || data?.message || 'Unable to refresh Zoho access token');
    error.statusCode = 502;
    error.details = data;
    throw error;
  }

  cachedAccessToken = data.access_token;
  const expiresInSeconds = Number(data.expires_in) || 3600;
  tokenExpiresAt = Date.now() + Math.max(expiresInSeconds - 60, 0) * 1000;

  return cachedAccessToken;
};

const getAccessToken = async () => {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  return requestAccessToken();
};

const formatLead = (lead) => ({
  id: lead?.id,
  Full_Name: lead?.Full_Name || '',
  First_Name: lead?.First_Name || '',
  Last_Name: lead?.Last_Name || '',
  Email: lead?.Email || '',
  Phone: lead?.Phone || '',
  Mobile: lead?.Mobile || '',
  Company: lead?.Company || '',
  Lead_Source: lead?.Lead_Source || '',
  Lead_Status: lead?.Lead_Status || '',
  Created_Time: lead?.Created_Time || '',
  Modified_Time: lead?.Modified_Time || '',
});

const fetchLeadById = async (leadId, fields = DEFAULT_LEAD_FIELDS) => {
  if (!leadId) return null;
  let accessToken = await getAccessToken();

  const fetchFromZoho = async (token) =>
    fetch(
      `${ZOHO_API_BASE_URL}/crm/v2/Leads/${encodeURIComponent(leadId)}?fields=${encodeURIComponent(fields)}`,
      {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
      }
    );

  let response = await fetchFromZoho(accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    accessToken = await requestAccessToken();
    response = await fetchFromZoho(accessToken);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || data?.error?.message || 'Zoho API request failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const record = Array.isArray(data?.data) ? data.data[0] : null;
  return record ? formatLead(record) : null;
};

const fetchLeads = async (fields = DEFAULT_LEAD_FIELDS) => {
  let accessToken = await getAccessToken();

  const fetchFromZoho = async (token) =>
    fetch(`${ZOHO_API_BASE_URL}/crm/v2/Leads?fields=${encodeURIComponent(fields)}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    });

  let response = await fetchFromZoho(accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    accessToken = await requestAccessToken();
    response = await fetchFromZoho(accessToken);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || data?.error?.message || 'Zoho API request failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const leads = Array.isArray(data?.data) ? data.data.map(formatLead) : [];
  return leads;
};

const searchLeadsByEmail = async (email, fields = DEFAULT_LEAD_FIELDS) => {
  if (!email) return [];
  let accessToken = await getAccessToken();

  const query = new URLSearchParams({
    email: String(email),
    fields,
  });

  const fetchFromZoho = async (token) =>
    fetch(`${ZOHO_API_BASE_URL}/crm/v2/Leads/search?${query.toString()}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    });

  let response = await fetchFromZoho(accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    accessToken = await requestAccessToken();
    response = await fetchFromZoho(accessToken);
  }

  if (response.status === 204 || response.status === 404) {
    return [];
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || data?.error?.message || 'Zoho API request failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const leads = Array.isArray(data?.data) ? data.data.map(formatLead) : [];
  return leads;
};

const createLead = async (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Zoho lead payload is required.');
  }

  let accessToken = await getAccessToken();
  const requestBody = JSON.stringify({ data: [payload] });

  const createInZoho = async (token) =>
    fetch(`${ZOHO_API_BASE_URL}/crm/v2/Leads`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

  let response = await createInZoho(accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    accessToken = await requestAccessToken();
    response = await createInZoho(accessToken);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(data?.data)) {
    const error = new Error(data?.message || data?.error?.message || 'Zoho API request failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const result = data.data[0];
  if (!result || result.status !== 'success') {
    const error = new Error(result?.message || 'Zoho lead creation failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const leadId = result?.details?.id;
  return leadId ? fetchLeadById(leadId) : null;
};

const updateLead = async (leadId, payload) => {
  if (!leadId) {
    throw new Error('Zoho lead id is required.');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Zoho lead payload is required.');
  }

  let accessToken = await getAccessToken();
  const requestBody = JSON.stringify({ data: [{ id: String(leadId), ...payload }] });

  const updateInZoho = async (token) =>
    fetch(`${ZOHO_API_BASE_URL}/crm/v2/Leads/${encodeURIComponent(leadId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

  let response = await updateInZoho(accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    accessToken = await requestAccessToken();
    response = await updateInZoho(accessToken);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(data?.data)) {
    const error = new Error(data?.message || data?.error?.message || 'Zoho API request failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const result = data.data[0];
  if (!result || result.status !== 'success') {
    const error = new Error(result?.message || 'Zoho lead update failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  return fetchLeadById(leadId);
};

const addNoteToLead = async ({ leadId, title, content }) => {
  if (!leadId || !content) {
    throw new Error('Lead id and note content are required.');
  }

  let accessToken = await getAccessToken();
  const requestBody = JSON.stringify({
    data: [
      {
        Note_Title: title || 'Admin Note',
        Note_Content: content,
        Parent_Id: String(leadId),
        se_module: 'Leads',
      },
    ],
  });

  const createNote = async (token) =>
    fetch(`${ZOHO_API_BASE_URL}/crm/v2/Notes`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

  let response = await createNote(accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    accessToken = await requestAccessToken();
    response = await createNote(accessToken);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(data?.data)) {
    const error = new Error(data?.message || data?.error?.message || 'Zoho API request failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  const result = data.data[0];
  if (!result || result.status !== 'success') {
    const error = new Error(result?.message || 'Zoho note creation failed');
    error.statusCode = response.status || 502;
    error.details = data;
    throw error;
  }

  return result;
};

module.exports = {
  fetchLeads,
  fetchLeadById,
  searchLeadsByEmail,
  createLead,
  updateLead,
  addNoteToLead,
  hasZohoEnv,
};
