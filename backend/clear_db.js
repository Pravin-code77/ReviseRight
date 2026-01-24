const mongoose = require('mongoose');
const Flashcard = require('./models/Flashcard');
const FlashcardSet = require('./models/FlashcardSet');
require('dotenv').config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await Flashcard.deleteMany({});
        console.log('Flashcards Request Cleared');

        await FlashcardSet.deleteMany({});
        console.log('FlashcardSets Request Cleared');

        console.log('Database Wipe Complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearDB();
