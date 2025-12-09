const express = require('express');
const router = express.Router();
const {getTrips,getTrip,createTrip,updateTrip,deleteTrip}= require('../controllers/tripController')
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);

router.get('/',getTrips);
router.get('/:id',getTrip);

router.use(authorize('admin'));

router.post('/',createTrip);

router.put('/:id',updateTrip);
router.delete('/:id',deleteTrip);
module.exports = router;

