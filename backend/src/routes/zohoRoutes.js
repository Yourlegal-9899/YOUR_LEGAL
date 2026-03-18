const express = require('express');
const {
  getZohoLeads,
  syncZohoLeads,
  getStoredLeads,
  getZohoSyncStatus,
  getLeadById,
  updateLeadStatus,
  assignLead,
  addLeadNote,
  handleZohoWebhook,
} = require('../controllers/zohoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/leads', protect, authorize('admin'), getZohoLeads);
router.post('/sync', protect, authorize('admin'), syncZohoLeads);
router.get('/stored-leads', protect, authorize('admin'), getStoredLeads);
router.get('/sync-status', protect, authorize('admin'), getZohoSyncStatus);
router.get('/leads/:id', protect, authorize('admin'), getLeadById);
router.patch('/leads/:id/status', protect, authorize('admin'), updateLeadStatus);
router.patch('/leads/:id/assign', protect, authorize('admin'), assignLead);
router.post('/leads/:id/notes', protect, authorize('admin'), addLeadNote);
router.post('/webhook', handleZohoWebhook);

module.exports = router;
