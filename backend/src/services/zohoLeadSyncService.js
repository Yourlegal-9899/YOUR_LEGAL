const Lead = require('../models/Lead');
const User = require('../models/User');
const {
  normalizeZohoLead,
  buildZohoLeadPayload,
} = require('../utils/zohoLeadMapper');
const {
  searchLeadsByEmail,
  createLead,
  updateLead,
  fetchLeadById,
  hasZohoEnv,
} = require('./zohoService');

const upsertLeadFromZoho = async (zohoLead, options = {}) => {
  const normalized = normalizeZohoLead(zohoLead);
  if (!normalized?.zohoId) return null;

  const payload = {
    ...normalized,
    lastSyncedAt: new Date(),
    lastSyncError: null,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const updatePayload = {
    $set: payload,
    $setOnInsert: {},
  };

  if (normalized.status) {
    updatePayload.$set.status = normalized.status;
  } else {
    updatePayload.$setOnInsert.status = 'new';
    delete updatePayload.$set.status;
  }

  if (options.convertedToUser) {
    updatePayload.$set.convertedToUser = options.convertedToUser;
  }

  return Lead.findOneAndUpdate(
    { zohoId: normalized.zohoId },
    updatePayload,
    { upsert: true, new: true }
  );
};

const getPortalLeadDefaults = () => ({
  leadSource: process.env.ZOHO_PORTAL_LEAD_SOURCE || 'Portal Signup',
  status: process.env.ZOHO_PORTAL_LEAD_STATUS || 'new',
});

const ensureZohoLeadForUser = async (user, options = {}) => {
  if (!hasZohoEnv()) return null;
  if (!user || !user.email || user.role === 'admin') return null;

  const defaults = getPortalLeadDefaults();
  const leadSource = options.leadSource || defaults.leadSource;
  const status = options.status || defaults.status;

  const basePayload = buildZohoLeadPayload({
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    company: user.companyName,
    extraFields: options.extraFields,
  });

  const createPayload = buildZohoLeadPayload({
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    company: user.companyName,
    leadSource,
    status,
    extraFields: options.extraFields,
  });

  let zohoLead = null;

  const localLead = await Lead.findOne({ email: user.email }).select('zohoId').lean();
  const preferredZohoId = localLead?.zohoId || user.zohoLeadId;

  if (preferredZohoId) {
    zohoLead = await updateLead(preferredZohoId, basePayload);
  } else {
    const matches = await searchLeadsByEmail(user.email);
    if (matches.length) {
      const matchId = matches[0].id || matches[0].zohoId;
      zohoLead = await updateLead(matchId, basePayload);
    } else {
      zohoLead = await createLead(createPayload);
    }
  }

  if (!zohoLead) return null;

  const storedLead = await upsertLeadFromZoho(zohoLead, { convertedToUser: user._id });

  await User.findByIdAndUpdate(user._id, {
    $set: {
      zohoLeadId: storedLead?.zohoId || zohoLead.id,
      zohoLastSyncedAt: new Date(),
      zohoSyncError: null,
    },
  });

  return storedLead;
};

const syncUserToZohoSafely = async (user, options = {}) => {
  try {
    return await ensureZohoLeadForUser(user, options);
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndUpdate(user._id, {
        $set: { zohoSyncError: error?.message || 'Zoho sync failed' },
      });
    }
    return null;
  }
};

const syncPendingUsersToZoho = async ({ limit = 25 } = {}) => {
  if (!hasZohoEnv()) {
    return { attempted: 0, synced: 0, failed: 0 };
  }

  const pendingUsers = await User.find({
    role: 'user',
    email: { $exists: true, $ne: '' },
    $or: [
      { zohoLeadId: { $exists: false } },
      { zohoLeadId: null },
      { zohoLeadId: '' },
      { zohoSyncError: { $ne: null } },
    ],
  })
    .limit(limit)
    .sort('-createdAt');

  let attempted = 0;
  let synced = 0;
  let failed = 0;

  for (const user of pendingUsers) {
    attempted += 1;
    try {
      await ensureZohoLeadForUser(user);
      synced += 1;
    } catch (error) {
      failed += 1;
      await User.findByIdAndUpdate(user._id, {
        $set: { zohoSyncError: error?.message || 'Zoho sync failed' },
      });
    }
  }

  return { attempted, synced, failed };
};

const refreshLeadFromZoho = async (leadId) => {
  if (!leadId) return null;
  const zohoLead = await fetchLeadById(leadId);
  return zohoLead ? upsertLeadFromZoho(zohoLead) : null;
};

module.exports = {
  upsertLeadFromZoho,
  ensureZohoLeadForUser,
  syncUserToZohoSafely,
  syncPendingUsersToZoho,
  refreshLeadFromZoho,
};
