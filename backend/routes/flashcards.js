const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const flashcardController = require('../controllers/flashcardController');


// Stats Route
router.get('/stats', auth, flashcardController.getStats);

// @route   POST api/flashcards/sets
// @desc    Create a flashcard set (with AI processing)
// @access  Private
router.post('/sets', auth, flashcardController.createSet);

// @route   GET api/flashcards/sets
// @desc    Get all sets
// @access  Private
router.get('/sets', auth, flashcardController.getAllSets);

// @route   GET api/flashcards/sets/:id
// @desc    Get set details
// @access  Private
router.get('/sets/:id', auth, flashcardController.getSetDetails);

// @route   GET api/flashcards/due
// @desc    Get all flashcards due for review
// @access  Private
router.get('/due', auth, flashcardController.getDueFlashcards);

// @route   PUT api/flashcards/:id/status
// @desc    Update flashcard status (swipe result)
// @access  Private
router.put('/:id/status', auth, flashcardController.updateFlashcardStatus);

module.exports = router;
