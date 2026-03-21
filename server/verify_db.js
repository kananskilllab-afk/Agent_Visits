const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const FormConfig = require('./models/FormConfig');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const configs = await FormConfig.find({ isActive: true });
        console.log('Active Configs Found:', configs.length);

        configs.forEach(config => {
            console.log(`\nForm Type: ${config.formType}, Version: ${config.version}`);
            const outcomeFields = config.fields.filter(f => f.group === 'Final Outcome' || f.group === 'Final Summary');
            console.log('Outcome Group Fields:', outcomeFields.map(f => ({ id: f.id, label: f.label, type: f.type })));
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
