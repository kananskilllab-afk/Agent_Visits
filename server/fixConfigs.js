const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function run() {
    try {
        console.log('Connecting to URI:', process.env.MONGODB_URI.substring(0, 20) + '...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Define inline schema to avoid import issues
        const fieldSchema = new mongoose.Schema({
            id: String,
            group: String,
            label: String,
            type: String,
            required: Boolean,
            options: [String]
        });

        const formConfigSchema = new mongoose.Schema({
            version: String,
            isActive: Boolean,
            formType: String,
            fields: [fieldSchema]
        }, { timestamps: true });

        const FormConfig = mongoose.model('FormRepair', formConfigSchema, 'formconfigs');

        const b2bFields = [
            { id: 'meta.companyName', group: 'Visit Meta', label: 'Company Name', type: 'text', required: true },
            { id: 'meta.bdmName', group: 'Visit Meta', label: 'BDM Name', type: 'text', required: true },
            { id: 'meta.rmName', group: 'Visit Meta', label: 'RM Name', type: 'text', required: true },
            { id: 'meta.meetingStart', group: 'Visit Meta', label: 'Meeting Start', type: 'datetime', required: true },
            { id: 'meta.meetingEnd', group: 'Visit Meta', label: 'Meeting End', type: 'datetime', required: true },
            { id: 'agencyProfile.address', group: 'Agency Profile', label: 'Office Address', type: 'textarea', required: true },
            { id: 'agencyProfile.pinCode', group: 'Agency Profile', label: 'PIN Code', type: 'text', required: true },
            { id: 'agencyProfile.businessModel', group: 'Agency Profile', label: 'Business Model', type: 'multi-select', required: true, options: ['Hybrid', 'Only IELTS/Coaching', 'Only Study Visa', 'Immigration', 'Other'] },
            { id: 'postVisit.actionPoints', group: 'Final Summary', label: 'Action Points', type: 'textarea', required: true }
        ];

        const b2cFields = [
            { id: 'visitInfo.visitDate', group: 'Visit Details', label: 'Visit Date', type: 'date', required: true },
            { id: 'visitInfo.officer', group: 'Visit Details', label: 'Visit Officer (Who Went)', type: 'text', required: true },
            { id: 'studentInfo.crmId', group: 'Student Information', label: 'CRM ID', type: 'text', required: true },
            { id: 'studentInfo.name', group: 'Student Information', label: 'Student Name', type: 'text', required: true },
            { id: 'studentInfo.email', group: 'Student Information', label: 'Email ID', type: 'text', required: true },
            { id: 'contactDetails.indiaNo', group: 'Contact Details', label: 'India No.', type: 'text', required: true },
            { id: 'location.address', group: 'Location Details', label: 'Address', type: 'textarea', required: true },
            { id: 'outcome.status', group: 'Final Outcome', label: 'Visit Outcome / Status', type: 'dropdown', required: true, options: [
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
            ] },
            { id: 'outcome.remarks', group: 'Final Outcome', label: 'Remarks / Notes', type: 'textarea', required: true }
        ];

        console.log('Cleaning up old active configs...');
        await FormConfig.updateMany({}, { isActive: false });

        console.log('Seeding B2B...');
        await FormConfig.create({
            version: '3.0-B2B',
            isActive: true,
            formType: 'generic',
            fields: b2bFields
        });

        console.log('Seeding B2C...');
        await FormConfig.create({
            version: '3.0-B2C',
            isActive: true,
            formType: 'home_visit',
            fields: b2cFields
        });

        console.log('SUCCESS!');
        process.exit(0);
    } catch (err) {
        console.error('FAIL:', err);
        process.exit(1);
    }
}

run();
