const express = require('express');
const router = express.Router();
const {
  getMyTrips,
  updateTripStatus,
  updateTripData
} = require('../controllers/driverController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);
router.use(authorize('chauffeur'));


router.get('/trips', getMyTrips);
router.put('/trips/:id/status', updateTripStatus);
router.put('/trips/:id/update', updateTripData);

module.exports = router;