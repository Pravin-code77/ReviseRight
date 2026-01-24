const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        console.log('Connecting to Mongo...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reviseright');
        console.log('Connected.');

        const email = 'testdebug_' + Date.now() + '@example.com';
        console.log(`Creating user: ${email}`);

        const user = new User({
            name: 'Debug User',
            email: email,
            password: 'password123'
        });

        console.log('Saving user...');
        await user.save();
        console.log('User saved successfully!');

        process.exit(0);
    } catch (err) {
        console.error('ERROR OCCURRED:');
        console.error(err);
        process.exit(1);
    }
};

run();
