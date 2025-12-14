const express = require('express');
const router = express.Router();
const {
  getMaintenances,
  getUpcomingMaintenances,
  getMaintenanceNotifications,
  createMaintenance,
  updateMaintenance,
  markAsDone
} = require('../controllers/maintenanceController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);
router.use(authorize('admin'));
router.get('/', getMaintenances);
router.get('/upcoming', getUpcomingMaintenances);
router.get('/notifications', getMaintenanceNotifications);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.put('/:id/mark-done', markAsDone);

module.exports = router;