const express = require('express');
const router = express.Router()
const { getTrucks,getTruck,createTruck,updateTruck,deleteTruck}= require('../controllers/truckController')
const protect  = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getTrucks);
router.post('/', createTruck);
router.get('/:id', getTruck);
router.put('/:id', updateTruck);
router.delete('/:id', deleteTruck);

module.exports = router;
