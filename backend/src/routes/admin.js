const express = require('express');
const { getAllUsers, getAdminUsers, updateUserProfile, updateUserStatus, getAdminStats, createUserAsAdmin } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/admin-users', protect, authorize('admin'), getAdminUsers);
router.post('/users', protect, authorize('admin'), createUserAsAdmin);
router.put('/users/status', protect, authorize('admin'), updateUserStatus);
router.put('/users/:userId', protect, authorize('admin'), updateUserProfile);
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
