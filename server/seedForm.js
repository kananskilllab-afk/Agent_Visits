const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const FormConfig = require('./models/FormConfig');

const initialFields = [
    // Meta
    { id: 'meta.companyName', group: 'Visit Meta', label: 'Company Name', type: 'text', required: true },
    { id: 'meta.bdmName', group: 'Visit Meta', label: 'BDM Name', type: 'text', required: true },
    { id: 'meta.rmName', group: 'Visit Meta', label: 'RM Name', type: 'text', required: true },
    { id: 'meta.meetingStart', group: 'Visit Meta', label: 'Meeting Start', type: 'datetime', required: true },
    { id: 'meta.meetingEnd', group: 'Visit Meta', label: 'Meeting End', type: 'datetime', required: true },
    
    // Agency Profile
    { id: 'agencyProfile.address', group: 'Agency Profile', label: 'Office Address', type: 'textarea', required: true },
    { id: 'agencyProfile.establishmentYear', group: 'Agency Profile', label: 'Establishment Year', type: 'number', required: true },
    { id: 'agencyProfile.pinCode', group: 'Agency Profile', label: 'PIN Code', type: 'text', required: true },
    { id: 'agencyProfile.contactNumber', group: 'Agency Profile', label: 'Contact Number', type: 'text', required: true },
    { id: 'agencyProfile.officeArea', group: 'Agency Profile', label: 'Office Area (sq.ft)', type: 'number', required: true },
    { id: 'agencyProfile.businessModel', group: 'Agency Profile', label: 'Business Model', type: 'multi-select', required: true, options: ['Hybrid', 'Only IELTS/Coaching', 'Only Study Visa', 'Immigration', 'Other'] },
    { id: 'agencyProfile.infraRating', group: 'Agency Profile', label: 'Infrastructure Rating', type: 'star-rating', required: true },
    { id: 'agencyProfile.hasComputerLab', group: 'Agency Profile', label: 'Computer Lab?', type: 'toggle', required: false },
    
    // Promoter & Team
    { id: 'promoterTeam.name', group: 'Promoter & Team', label: 'Promoter Name', type: 'text', required: true },
    { id: 'promoterTeam.designation', group: 'Promoter & Team', label: 'Designation', type: 'text', required: true },
    { id: 'promoterTeam.totalStaff', group: 'Promoter & Team', label: 'Total Staff Count', type: 'number', required: true },
    { id: 'promoterTeam.countriesPromoted', group: 'Promoter & Team', label: 'Countries Promoted', type: 'multi-select', required: true, options: ['Canada', 'USA', 'UK', 'Australia', 'New Zealand', 'Europe', 'Other'] },
    
    // Marketing
    { id: 'marketingOps.avgDailyWalkins', group: 'Marketing & Ops', label: 'Avg. Daily Walk-ins', type: 'number', required: true },
    { id: 'marketingOps.walkinRatio', group: 'Marketing & Ops', label: 'Walk-in to Enquiry Ratio', type: 'text', required: true },
    { id: 'marketingOps.totalBranches', group: 'Marketing & Ops', label: 'Total Active Branches', type: 'number', required: true },
    
    // Kanan Knowledge
    { id: 'kananKnowledge.source', group: 'Kanan Knowledge', label: 'Source of Information', type: 'dropdown', required: true, options: ['Direct Outreach', 'Social Media', 'Exhibition', 'Reference', 'Other'] },
    { id: 'kananKnowledge.previousAssociation', group: 'Kanan Knowledge', label: 'Previous Association?', type: 'toggle', required: false },
    
    // Partnership
    { id: 'currentBusiness.preferredCountries', group: 'Partnership', label: 'Preferred Countries', type: 'multi-select', required: true, options: ['Canada', 'USA', 'UK', 'Australia', 'Other'] },
    { id: 'currentBusiness.volumeCanada', group: 'Partnership', label: 'Annual Volume Canada', type: 'number', required: true },
    { id: 'currentBusiness.volumeUK', group: 'Partnership', label: 'Annual Volume UK', type: 'number', required: true },
    { id: 'currentBusiness.volumeUSA', group: 'Partnership', label: 'Annual Volume USA', type: 'number', required: true },
    
    // Challenges
    { id: 'competitors.mainAggregators', group: 'Challenges', label: 'Main Aggregators', type: 'multi-select', required: true, options: ['ApplyBoard', 'Adventous', 'KC Overseas', 'Shorelight', 'IDP', 'Others'] },
    { id: 'competitors.directAgents', group: 'Challenges', label: 'Direct Agents', type: 'textarea', required: false },
    
    // Support
    { id: 'painPoints.problems', group: 'Support', label: 'Agent Pain Points', type: 'textarea', required: true },
    { id: 'painPoints.solutions', group: 'Support', label: 'Solutions Provided', type: 'textarea', required: true },
    
    // Summary
    { id: 'postVisit.actionPoints', group: 'Final Summary', label: 'Action Points', type: 'textarea', required: true },
    { id: 'postVisit.remarks', group: 'Final Summary', label: 'Overall Remarks', type: 'textarea', required: false }
];

async function seed() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existing = await FormConfig.findOne({ isActive: true });
        if (existing) {
            console.log('Active configuration already exists at v' + existing.version);
        } else {
            console.log('Creating initial fields...');
            await FormConfig.create({
                version: '1.0',
                isActive: true,
                fields: initialFields
            });
            console.log('Initial form configuration seeded!');
        }
        process.exit(0);
    } catch (err) {
        console.error('SERVER SEED ERROR:', err);
        process.exit(1);
    }
}

seed();
