const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const FormConfig = require('./models/FormConfig');

const newStatusOptions = [
    'Pending', 
    'Completed', 
    'Cancelled',
    'HOUSE LOCKED',
    'ADDRESS NOT FOUND',
    'VISIT DONE',
    'REVISIT REQUIRED',
    'ENROLLED',
    'NOT INTRESTED',
    'OUT OF VADODARAA',
    'IN PROGRESS',
    'WRONG ADDRESS DETAILS',
    'NOT RESPONDING',
    'HO INVITE',
    'FOLLOW UP REQUIRED',
    'SHIFTED OTHER CITY',
    'NOT FOUND'
];

async function sync() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const activeConfig = await FormConfig.findOne({ formType: 'home_visit', isActive: true });
        
        if (!activeConfig) {
            console.error('No active B2C config found!');
            process.exit(1);
        }

        console.log(`Current version: ${activeConfig.version}`);
        
        // Find the outcome.status field
        const statusField = activeConfig.fields.find(f => f.id === 'outcome.status');
        if (statusField) {
            statusField.options = newStatusOptions;
            activeConfig.version = `1.4-updated-${Date.now()}`;
            await activeConfig.save();
            console.log('Successfully updated status options in database.');
            console.log(`New version: ${activeConfig.version}`);
        } else {
            console.error('Could not find outcome.status field in config!');
        }

        process.exit(0);
    } catch (err) {
        console.error('SYNC ERROR:', err);
        process.exit(1);
    }
}

sync();
