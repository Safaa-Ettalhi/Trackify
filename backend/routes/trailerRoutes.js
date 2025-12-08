const express = require('express');
const router = express.Router()
const {
        getTrailers,
        getTrailer,
        createTrailer,
        updateTrailer,
        deleteTrailer}= require('../controllers/trailerController');

const protect = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');


router.use(protect);
router.use(authorize('admin'))

router.get('/',getTrailers);
router.post('/',createTrailer);
router.get('/:id',getTrailer);
router.put('/:id',updateTrailer);
router.delete('/:id',deleteTrailer)

module.exports = router;

