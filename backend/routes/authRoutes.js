const express = require('express');
const router = express.Router();
const { register, login ,allUsers } = require('../controllers/authController');
const protect  = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.post('/register', register);
router.post('/login', login);
router.use(protect);
router.use(authorize('admin'));
router.get('/all', allUsers);
module.exports = router;