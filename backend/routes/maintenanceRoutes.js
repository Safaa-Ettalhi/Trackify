const express = require('express');
const router = express.Router();
const {
  getMaintenances,
  getUpcomingMaintenances,
  createMaintenance,
  updateMaintenance
} = require('../controllers/maintenanceController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);
router.use(authorize('admin'));
router.get('/', getMaintenances);
router.get('/upcoming', getUpcomingMaintenances);
router.post('/', createMaintenance);

router.put('/:id', updateMaintenance);

module.exports = router;