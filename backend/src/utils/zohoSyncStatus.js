const ZohoSyncStatus = require('../models/ZohoSyncStatus');

const updateZohoSyncStatus = async ({ status = 'success', error, stats } = {}) => {
  const payload = {
    status,
    lastSyncError: error || null
  };

  if (status === 'success') {
    payload.lastSyncedAt = new Date();
    payload.lastStats = stats || null;
  }

  return ZohoSyncStatus.findOneAndUpdate(
    { key: 'default' },
    { $set: payload, $setOnInsert: { key: 'default' } },
    { upsert: true, new: true }
  );
};

const getZohoSyncStatus = async () => {
  return ZohoSyncStatus.findOne({ key: 'default' }).lean();
};

module.exports = {
  updateZohoSyncStatus,
  getZohoSyncStatus,
};
