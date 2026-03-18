const crypto = require('crypto');
const { fetchLeads, fetchLeadById } = require('../services/zohoService');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { sendZeptoMail } = require('../services/zeptoMailService');
const { updateZohoSyncStatus, getZohoSyncStatus } = require('../utils/zohoSyncStatus');

const VALID_STATUSES = new Set(['new', 'contacted', 'qualified', 'converted', 'lost']);

const buildPassword = () => crypto.randomBytes(8).toString('hex');

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

// Helper function to safely parse query dates
const parseQueryDate = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') {
      return null;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const appendActivity = async (leadId, activity) => {
  if (!leadId || !activity) return;
  await Lead.findByIdAndUpdate(leadId, {
    $push: {
      activities: {
        type: activity.type || 'note',
        message: activity.message,
        actor: activity.actor || null,
        meta: activity.meta || null,
        createdAt: activity.createdAt || new Date(),
      },
    },
  });
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

exports.syncZohoLeads = async (req, res) => {
  try {
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
      stats: { total: zohoLeads.length, new: newCount, updated: updatedCount },
    });

    res.json({ 
      success: true, 
      message: `Synced ${zohoLeads.length} leads (${newCount} new, ${updatedCount} updated)`,
      stats: { total: zohoLeads.length, new: newCount, updated: updatedCount }
    });
  } catch (error) {
    console.error('Zoho leads sync failed:', error?.message || error);
    await updateZohoSyncStatus({
      status: 'error',
      error: error?.message || 'Failed to sync Zoho leads',
    });
    res.status(error.statusCode || 500).json({
      message: error?.message || 'Failed to sync Zoho leads',
    });
  }
};

exports.getStoredLeads = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50, source, assignedTo, dateFrom, dateTo } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (source && source !== 'all') {
      query.leadSource = source;
    }

    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        query.assignedTo = { $in: [null] };
      } else {
        query.assignedTo = assignedTo;
      }
    }

    const parsedDateFrom = parseQueryDate(dateFrom);
    const parsedDateTo = parseQueryDate(dateTo);

    if (dateFrom && !parsedDateFrom) {
      console.warn(`Invalid dateFrom filter received: ${dateFrom}`);
    }
    if (dateTo && !parsedDateTo) {
      console.warn(`Invalid dateTo filter received: ${dateTo}`);
    }

    if (parsedDateFrom || parsedDateTo) {
      query.zohoCreatedTime = {};
      if (parsedDateFrom) query.zohoCreatedTime.$gte = parsedDateFrom;
      if (parsedDateTo) query.zohoCreatedTime.$lte = parsedDateTo;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .sort('-zohoCreatedTime')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email')
      .populate('convertedToUser', 'name email')
      .lean();

    const count = await Lead.countDocuments(query);

    res.json({ 
      success: true, 
      leads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get stored leads failed:', error?.message || error);
    res.status(500).json({
      message: error?.message || 'Failed to get stored leads',
    });
  }
};

exports.getZohoLeads = async (req, res) => {
  try {
    const leads = await fetchLeads();
    res.json({ success: true, leads });
  } catch (error) {
    console.error('Zoho leads fetch failed:', error?.message || error);
    res.status(error.statusCode || 500).json({
      message: error?.message || 'Failed to fetch Zoho leads',
    });
  }
};

exports.getZohoSyncStatus = async (req, res) => {
  try {
    const status = await getZohoSyncStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('convertedToUser', 'name email')
      .populate('comments.author', 'name email')
      .populate('activities.actor', 'name email')
      .lean();

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    const previousStatus = lead.status;
    lead.status = status;

    let conversion = null;

    if (status === 'converted' && !lead.convertedToUser) {
      if (!lead.email) {
        return res.status(400).json({ message: 'Lead must have an email to convert.' });
      }

      let user = await User.findOne({ email: lead.email });

      if (!user) {
        const password = buildPassword();
        user = await User.create({
          name: lead.fullName || lead.company || 'New Lead',
          email: lead.email,
          phone: lead.phone,
          companyName: lead.company,
          password,
          status: 'active',
          bypassPlan: true,
          emailVerified: true,
        });

        const loginUrl = `${process.env.FRONTEND_URL || ''}/login`;
        const subject = 'Your YourLegal account is ready';
        const text = `Your account has been created.\n\nEmail: ${lead.email}\nTemporary password: ${password}\nLogin: ${loginUrl}\n\nPlease change your password after logging in.`;
        const html = `<p>Your account has been created.</p><p><strong>Email:</strong> ${lead.email}<br/><strong>Temporary password:</strong> ${password}</p><p>Login here: <a href="${loginUrl}">${loginUrl}</a></p><p>Please change your password after logging in.</p>`;

        try {
          await sendZeptoMail({ to: lead.email, subject, text, html });
        } catch (mailError) {
          conversion = {
            warning: mailError.message || 'Lead converted, but email failed.',
          };
        }
      }

      lead.convertedToUser = user._id;
      conversion = conversion || { userId: user._id };
      await appendActivity(lead._id, {
        type: 'conversion',
        message: `Lead converted to user ${user.email}`,
        actor: req.user?._id,
      });
    }

    if (previousStatus !== status) {
      await appendActivity(lead._id, {
        type: 'status',
        message: `Status changed from ${previousStatus} to ${status}`,
        actor: req.user?._id,
        meta: { from: previousStatus, to: status },
      });
    }

    await lead.save();

    res.json({ success: true, lead, conversion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    const previousAssignee = lead.assignedTo ? String(lead.assignedTo) : null;
    lead.assignedTo = assignedTo || null;
    lead.assignedBy = req.user?._id;
    lead.assignedAt = assignedTo ? new Date() : null;
    await lead.save();

    await appendActivity(lead._id, {
      type: 'assignment',
      message: assignedTo ? 'Lead assigned' : 'Lead unassigned',
      actor: req.user?._id,
      meta: { from: previousAssignee, to: assignedTo || null },
    });

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addLeadNote = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: 'Note body is required.' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    lead.comments.push({
      body: String(body).trim(),
      author: req.user?._id,
      createdAt: new Date(),
    });
    await lead.save();

    await appendActivity(lead._id, {
      type: 'note',
      message: 'Note added',
      actor: req.user?._id,
    });

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleZohoWebhook = async (req, res) => {
  try {
    const expectedToken = process.env.ZOHO_WEBHOOK_TOKEN;
    if (expectedToken) {
      const token = req.query.token || req.headers['x-zoho-token'];
      if (token !== expectedToken) {
        return res.status(401).json({ message: 'Invalid webhook token.' });
      }
    }

    const payload = req.body || {};
    const rawLeads = Array.isArray(payload.data) ? payload.data : Array.isArray(payload.leads) ? payload.leads : [];
    const leadIds = rawLeads.map((lead) => lead?.id).filter(Boolean);

    const leadsToUpsert = [];

    for (const lead of rawLeads) {
      if (lead?.Full_Name || lead?.Email || lead?.Company) {
        leadsToUpsert.push({
          id: lead.id,
          Full_Name: lead.Full_Name,
          Email: lead.Email,
          Phone: lead.Phone,
          Company: lead.Company,
          Lead_Source: lead.Lead_Source,
          Created_Time: lead.Created_Time,
        });
      }
    }

    if (!leadsToUpsert.length && leadIds.length) {
      for (const leadId of leadIds) {
        const fullLead = await fetchLeadById(leadId);
        if (fullLead) leadsToUpsert.push(fullLead);
      }
    }

    const upserted = [];
    for (const lead of leadsToUpsert) {
      const updated = await upsertLead(lead);
      if (updated) upserted.push(updated);
    }

    res.json({ success: true, count: upserted.length });
  } catch (error) {
    console.error('Zoho webhook failed:', error?.message || error);
    res.status(500).json({ message: error.message });
  }
};
