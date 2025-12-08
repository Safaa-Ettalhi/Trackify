const express = require('express');
const router = express.Router();
const {
  getTires,
  getTire,
  createTire,
  updateTire,
  deleteTire
} = require('../controllers/tireController');
const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(protect);
router.use(authorize('admin'));


router.get('/',getTires);
router.post('/',createTire);
router.get('/:id',getTire);
router.put('/:id',updateTire);
router.delete('/:id',deleteTire)

module.exports = router;

