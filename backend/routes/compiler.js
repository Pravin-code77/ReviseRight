const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const compilerController = require('../controllers/compilerController');

// @route   POST api/compiler/run
// @desc    Run code
// @access  Private (or Public if we want)
router.post('/run', compilerController.run);

module.exports = router;
