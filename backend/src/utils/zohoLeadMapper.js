const DEFAULT_STATUS_MAP = {
  new: 'Not Contacted',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost Lead',
};

const getEnvStatusMap = () => ({
  new: process.env.ZOHO_STATUS_NEW,
  contacted: process.env.ZOHO_STATUS_CONTACTED,
  qualified: process.env.ZOHO_STATUS_QUALIFIED,
  converted: process.env.ZOHO_STATUS_CONVERTED,
  lost: process.env.ZOHO_STATUS_LOST,
});

const mapLocalStatusToZoho = (status) => {
  const key = String(status || '').trim().toLowerCase();
  if (!key) return null;
  const envMap = getEnvStatusMap();
  return envMap[key] || DEFAULT_STATUS_MAP[key] || null;
};

const mapZohoStatusToLocal = (status) => {
  if (!status) return null;
  const normalized = String(status).trim().toLowerCase();
  if (!normalized) return null;

  if (['new', 'not contacted', 'not_contacted'].includes(normalized)) return 'new';
  if (normalized.includes('contact')) return 'contacted';
  if (normalized.includes('qualif')) return 'qualified';
  if (normalized.includes('convert')) return 'converted';
  if (normalized.includes('lost') || normalized.includes('junk') || normalized.includes('unqual')) return 'lost';

  return null;
};

const parseZohoDate = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      console.warn(`Invalid date format from Zoho: ${dateString}`);
      return null;
    }
    return date;
  } catch (error) {
    console.warn(`Error parsing Zoho date: ${dateString}`, error);
    return null;
  }
};

const splitName = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: '', lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
};

const buildZohoLeadPayload = ({
  fullName,
  email,
  phone,
  company,
  leadSource,
  status,
  extraFields,
} = {}) => {
  const { firstName, lastName } = splitName(fullName);
  const fallbackLastName = email ? String(email).split('@')[0] : 'Unknown';
  const defaultCompany = process.env.ZOHO_DEFAULT_COMPANY;

  const payload = {
    Last_Name: lastName || fallbackLastName,
    First_Name: firstName || undefined,
    Email: email || undefined,
    Phone: phone || undefined,
    Company: company || defaultCompany || undefined,
    Lead_Source: leadSource || undefined,
    Lead_Status: mapLocalStatusToZoho(status) || undefined,
  };

  if (extraFields && typeof extraFields === 'object') {
    Object.entries(extraFields).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      payload[key] = value;
    });
  }

  return payload;
};

const normalizeZohoLead = (lead = {}) => {
  const fullName = lead.Full_Name
    || [lead.First_Name, lead.Last_Name].filter(Boolean).join(' ')
    || lead.Last_Name
    || lead.Email
    || '';

  const mappedStatus = mapZohoStatusToLocal(lead.Lead_Status);

  return {
    zohoId: lead.id ? String(lead.id) : null,
    fullName,
    email: lead.Email || undefined,
    phone: lead.Phone || lead.Mobile || undefined,
    company: lead.Company || undefined,
    leadSource: lead.Lead_Source || undefined,
    zohoCreatedTime: parseZohoDate(lead.Created_Time),
    status: mappedStatus,
  };
};

module.exports = {
  mapLocalStatusToZoho,
  mapZohoStatusToLocal,
  parseZohoDate,
  buildZohoLeadPayload,
  normalizeZohoLead,
};
