const { fetchLeads } = require('./zohoService');
const Lead = require('../models/Lead');
const { updateZohoSyncStatus } = require('../utils/zohoSyncStatus');

let syncInterval = null;

// Helper function to safely parse Zoho dates
const parseZohoDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Handle various Zoho date formats
    // Zoho often returns dates like "2023-12-01T10:30:00+05:30" or "2023-12-01 10:30:00"
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format from Zoho: ${dateString}`);
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn(`Error parsing Zoho date: ${dateString}`, error);
    return null;
  }
};

const normalizeLeadData = (lead) => ({
  zohoId: lead.id,
  fullName: lead.Full_Name,
  email: lead.Email,
  phone: lead.Phone,
  company: lead.Company,
  leadSource: lead.Lead_Source,
  zohoCreatedTime: parseZohoDate(lead.Created_Time),
});

const upsertLead = async (lead) => {
  if (!lead?.id) return null;
  const payload = {
    ...normalizeLeadData(lead),
    lastSyncedAt: new Date(),
    lastSyncError: null,
  };

  const updated = await Lead.findOneAndUpdate(
    { zohoId: lead.id },
    { $set: payload, $setOnInsert: { status: 'new' } },
    { upsert: true, new: true }
  );

  return updated;
};

const syncZohoLeadsBackground = async () => {
  try {
    console.log('[Zoho Sync] Starting background sync...');
    
    const zohoLeads = await fetchLeads();
    
    let newCount = 0;
    let updatedCount = 0;

    for (const lead of zohoLeads) {
      const existingLead = await Lead.findOne({ zohoId: lead.id }).select('_id');
      await upsertLead(lead);
      if (existingLead) updatedCount++;
      else newCount++;
    }

    await updateZohoSyncStatus({
      status: 'success',
      stats: { total: zohoLeads.length, new: newCount, updated: updatedCount }
    });

    console.log(`[Zoho Sync] Completed: ${zohoLeads.length} total (${newCount} new, ${updatedCount} updated)`);
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
