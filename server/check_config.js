const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const FormConfig = require('./models/FormConfig');
require('dotenv').config();

async function checkConfig() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const config = await FormConfig.findOne({ formType: 'home_visit', isActive: true });
        if (config) {
            fs.writeFileSync(path.join(__dirname, 'config_output.json'), JSON.stringify(config.toObject(), null, 2));
            console.log("Config written to config_output.json");
        } else {
            console.log("No active home_visit config found");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkConfig();
