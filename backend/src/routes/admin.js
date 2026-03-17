const express = require('express');
const { getAllUsers, updateUserStatus, getAdminStats, createUserAsAdmin } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users', protect, authorize('admin'), createUserAsAdmin);
router.put('/users/status', protect, authorize('admin'), updateUserStatus);
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
