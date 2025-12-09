const express = require('express');
const router = express.Router();
const {
  getConsumptionReport,
  getKilometrageReport,
  getMaintenanceReport
} = require('../controllers/reportController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);
router.use(authorize('admin'));

router.get('/consumption', getConsumptionReport);
router.get('/kilometrage', getKilometrageReport);
router.get('/maintenance', getMaintenanceReport);

module.exports = router;