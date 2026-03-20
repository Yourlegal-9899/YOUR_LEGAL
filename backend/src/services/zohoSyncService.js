const { fetchLeads } = require('./zohoService');
const Lead = require('../models/Lead');
const { updateZohoSyncStatus } = require('../utils/zohoSyncStatus');
const { upsertLeadFromZoho, syncPendingUsersToZoho } = require('./zohoLeadSyncService');

let syncInterval = null;

const syncZohoLeadsBackground = async () => {
  try {
    console.log('[Zoho Sync] Starting background sync...');
    
    const zohoLeads = await fetchLeads();
    
    let newCount = 0;
    let updatedCount = 0;

    for (const lead of zohoLeads) {
      const existingLead = await Lead.findOne({ zohoId: lead.id }).select('_id');
      await upsertLeadFromZoho(lead);
      if (existingLead) updatedCount++;
      else newCount++;
    }

    const portalSync = await syncPendingUsersToZoho({ limit: 50 });

    await updateZohoSyncStatus({
      status: 'success',
      stats: { total: zohoLeads.length, new: newCount, updated: updatedCount }
    });

    console.log(
      `[Zoho Sync] Completed: ${zohoLeads.length} total (${newCount} new, ${updatedCount} updated)`
    );
    if (portalSync.attempted) {
      console.log(
        `[Zoho Sync] Portal users synced: ${portalSync.synced}/${portalSync.attempted} (failed ${portalSync.failed})`
      );
    }
  } catch (error) {
    console.error('[Zoho Sync] Failed:', error?.message || error);
    await updateZohoSyncStatus({
      status: 'error',
      error: error?.message || 'Zoho sync failed'
    });
  }
};

const startZohoSync = (intervalMinutes = 30) => {
  if (syncInterval) {
    console.log('[Zoho Sync] Already running');
    return;
  }

  // Run immediately on start
  syncZohoLeadsBackground();

  // Then run every X minutes
  syncInterval = setInterval(syncZohoLeadsBackground, intervalMinutes * 60 * 1000);
  
  console.log(`[Zoho Sync] Started - will sync every ${intervalMinutes} minutes`);
};

const stopZohoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[Zoho Sync] Stopped');
  }
};

module.exports = {
  startZohoSync,
  stopZohoSync,
  syncZohoLeadsBackground
};
