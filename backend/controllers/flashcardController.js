const Flashcard = require('../models/Flashcard');
const FlashcardSet = require('../models/FlashcardSet');
const { generateFlashcardContent } = require('../utils/aiService');

exports.createSet = async (req, res) => {
    const fs = require('fs');
    const logFile = 'creation_debug.txt';
    const log = (msg) => fs.appendFileSync(logFile, new Date().toISOString() + ': ' + msg + '\n');

    try {
        const { title, description, cards, type } = req.body;
        log(`[createSet] START. Title: ${title}, Cards: ${cards ? cards.length : 0}`);

        if (!req.user || !req.user.id) {
            log('[createSet] ERROR: No User ID');
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // 1. Create Set
        const newSet = new FlashcardSet({
            user: req.user.id,
            title,
            description
        });
        const savedSet = await newSet.save();
        log(`[createSet] Set Saved: ${savedSet._id}`);

        // 2. Create Cards Serially
        const savedCards = [];
        if (cards && cards.length > 0) {
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                let backContent = card.definition;

                if (type !== 'raw') {
                    try {
                        log(`[createSet] Generating AI for card ${i}`);
                        backContent = await generateFlashcardContent(card.definition, type);
                    } catch (aiErr) {
                        log(`[createSet] AI Fail for card ${i}: ${aiErr.message}`);
                        // Fallback
                        backContent = card.definition;
                    }
                }

                const newCard = new Flashcard({
                    user: req.user.id,
                    set: savedSet._id,
                    front: card.term,
                    back: backContent,
                    type
                });

                const savedCard = await newCard.save();
                savedCards.push(savedCard);
                log(`[createSet] Card ${i} Saved: ${savedCard._id}`);
            }
        }

        log('[createSet] SUCCESS. Returning response.');
        res.json({ set: savedSet, cards: savedCards });

    } catch (err) {
        log(`[createSet] CRITICAL ERROR: ${err.message}\n${err.stack}`);
        console.error("Create Set Error:", err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
};

exports.getAllSets = async (req, res) => {
    try {
        // Fetch all sets for user, sort by newest
        // Optional: Aggregate to count cards?
        const sets = await FlashcardSet.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Let's also attach card count for UI
        // This is N+1 but efficient enough for small N. Ideally use aggregation.
        const setsWithCount = await Promise.all(sets.map(async (set) => {
            const count = await Flashcard.countDocuments({ set: set._id });
            return {
                ...set.toObject(),
                cardCount: count
            };
        }));

        res.json(setsWithCount);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getSetDetails = async (req, res) => {
    try {
        console.log(`[DEBUG] getSetDetails called for ID: ${req.params.id}`);
        console.log(`[DEBUG] User ID from Token: ${req.user ? req.user.id : 'No User'}`);

        // Validate ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[DEBUG] Invalid ID format');
            return res.status(400).json({ msg: 'Invalid Set ID' });
        }

        const set = await FlashcardSet.findById(req.params.id);
        if (!set) {
            console.log('[DEBUG] Set not found in DB');
            return res.status(404).json({ msg: 'Set not found' });
        }

        console.log(`[DEBUG] Set found: ${set._id}, Owner: ${set.user}`);

        if (set.user.toString() !== req.user.id) {
            console.log(`[DEBUG] User mismatch: SetOwner=${set.user.toString()} vs TokenUser=${req.user.id}`);
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const cards = await Flashcard.find({ set: req.params.id });
        console.log(`[DEBUG] Cards found: ${cards.length}`);

        res.json({ set, cards });
    } catch (err) {
        console.error("[DEBUG] ERROR in getSetDetails:", err);
        res.status(500).send('Server error');
    }
};

exports.updateFlashcardStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'learning' or 'mastered'
        console.log(`[DEBUG] updateFlashcardStatus: ID=${req.params.id}, Status=${status}, User=${req.user.id}`);

        let flashcard = await Flashcard.findById(req.params.id);

        if (!flashcard) return res.status(404).json({ msg: 'Flashcard not found' });
        if (flashcard.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        flashcard.status = status;

        // Simple Spaced Repetition Logic
        if (status === 'mastered') {
            // Set next review to 3 days later
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 3);
            flashcard.nextReviewDate = nextDate;
        } else {
            // Keep it due
            flashcard.nextReviewDate = new Date();
        }

        await flashcard.save();
        console.log(`[DEBUG] Flashcard saved. New NextReview: ${flashcard.nextReviewDate}`);
        res.json(flashcard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Kept for backward compatibility if needed, but primarily we use createSet now
exports.createFlashcard = async (req, res) => {
    // ... Legacy code or handle single creation if needed
    // For now, let's just error or leave it. 
    // The Prompt says "remove all flashcard which are present in home tab and render all sets".
    // So we probably don't need orphan support.
    res.status(400).json({ msg: "Please use createSet" });
};

exports.getDueFlashcards = async (req, res) => {
    // ...
    // Assuming Review Mechanism still works on individual cards or sets? 
    // Usually Review is cross-set or specific set. 
    // Let's keep this as is for now? 
    // "On clicking on set , details or all infroamtion of set gets showed."
    // It doesn't explicitly say "Revise" tab changes.
    // I made this endpoint for "Due" cards. 
    try {
        const flashcards = await Flashcard.find({
            user: req.user.id,
            nextReviewDate: { $lte: new Date() }
        }).sort({ nextReviewDate: 1 });
        res.json(flashcards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Sets
        const totalSets = await FlashcardSet.countDocuments({ user: userId });

        // 2. Mastered Cards
        const cardsMastered = await Flashcard.countDocuments({
            user: userId,
            status: 'mastered'
        });

        // 3. Streak (Real Implementation)
        const user = await require('../models/User').findById(userId);
        const streak = user ? user.streak : 0;

        res.json({
            totalSets,
            cardsMastered,
            streak
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
