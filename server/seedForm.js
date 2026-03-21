const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const FormConfig = require('./models/FormConfig');

// ── B2B Form Fields (9 Steps) ─────────────────────────────────────────────────
const b2bFields = [
    // Step 1 – Visit Meta
    { id: 'meta.companyName',  group: 'Visit Meta', label: 'Company Name',  type: 'text',     required: true },
    { id: 'meta.bdmName',      group: 'Visit Meta', label: 'BDM Name',      type: 'text',     required: true },
    { id: 'meta.rmName',       group: 'Visit Meta', label: 'RM Name',       type: 'text',     required: true },
    { id: 'meta.meetingStart', group: 'Visit Meta', label: 'Meeting Start', type: 'datetime', required: true },
    { id: 'meta.meetingEnd',   group: 'Visit Meta', label: 'Meeting End',   type: 'datetime', required: true },

    // Step 2 – Agency Profile
    { id: 'agencyProfile.address',           group: 'Agency Profile', label: 'Office Address',        type: 'textarea',     required: true },
    { id: 'agencyProfile.pinCode',           group: 'Agency Profile', label: 'PIN Code',              type: 'text',         required: true },
    { id: 'agencyProfile.establishmentYear', group: 'Agency Profile', label: 'Establishment Year',    type: 'number',       required: true },
    { id: 'agencyProfile.contactNumber',     group: 'Agency Profile', label: 'Contact Number',        type: 'text',         required: true },
    { id: 'agencyProfile.officeArea',        group: 'Agency Profile', label: 'Office Area (sq.ft)',   type: 'number',       required: false },
    { id: 'agencyProfile.businessModel',     group: 'Agency Profile', label: 'Business Model',        type: 'multi-select', required: true,  options: ['Hybrid', 'Only IELTS/Coaching', 'Only Study Visa', 'Immigration', 'Other'] },
    { id: 'agencyProfile.infraRating',       group: 'Agency Profile', label: 'Infrastructure Rating', type: 'star-rating',  required: true },
    { id: 'agencyProfile.hasComputerLab',    group: 'Agency Profile', label: 'Computer Lab?',         type: 'toggle',       required: false },

    // Step 3 – Promoter & Team
    { id: 'promoterTeam.name',              group: 'Promoter & Team', label: 'Promoter Name',         type: 'text',         required: true },
    { id: 'promoterTeam.designation',       group: 'Promoter & Team', label: 'Designation',           type: 'text',         required: true },
    { id: 'promoterTeam.totalStaff',        group: 'Promoter & Team', label: 'Total Staff Count',     type: 'number',       required: true },
    { id: 'promoterTeam.countriesPromoted', group: 'Promoter & Team', label: 'Countries Promoted',    type: 'multi-select', required: true, options: ['Canada', 'USA', 'UK', 'Australia', 'New Zealand', 'Europe', 'Other'] },

    // Step 4 – Marketing & Ops
    { id: 'marketingOps.avgDailyWalkins', group: 'Marketing & Ops', label: 'Avg. Daily Walk-ins',         type: 'number', required: true },
    { id: 'marketingOps.walkinRatio',     group: 'Marketing & Ops', label: 'Walk-in to Enquiry Ratio',    type: 'text',   required: false },
    { id: 'marketingOps.totalBranches',   group: 'Marketing & Ops', label: 'Total Active Branches',       type: 'number', required: true },

    // Step 5 – Kanan Knowledge
    { id: 'kananKnowledge.source',              group: 'Kanan Knowledge', label: 'Source of Information', type: 'dropdown', required: true,  options: ['Direct Outreach', 'Social Media', 'Exhibition', 'Reference', 'Other'] },
    { id: 'kananKnowledge.previousAssociation', group: 'Kanan Knowledge', label: 'Previous Association?', type: 'toggle',   required: false },

    // Step 6 – Partnership
    { id: 'partnership.preferredCountries', group: 'Partnership', label: 'Preferred Countries',    type: 'multi-select', required: true, options: ['Canada', 'USA', 'UK', 'Australia', 'Other'] },
    { id: 'partnership.volumeCanada',       group: 'Partnership', label: 'Annual Volume – Canada', type: 'number',       required: true },
    { id: 'partnership.volumeUK',           group: 'Partnership', label: 'Annual Volume – UK',     type: 'number',       required: false },
    { id: 'partnership.volumeUSA',          group: 'Partnership', label: 'Annual Volume – USA',    type: 'number',       required: false },

    // Step 7 – Challenges
    { id: 'challenges.mainAggregators', group: 'Challenges', label: 'Main Aggregators', type: 'multi-select', required: true,  options: ['ApplyBoard', 'Adventous', 'KC Overseas', 'Shorelight', 'IDP', 'Others'] },
    { id: 'challenges.directAgents',    group: 'Challenges', label: 'Direct Agents',    type: 'textarea',     required: false },

    // Step 8 – Support
    { id: 'support.painPoints', group: 'Support', label: 'Agent Pain Points',   type: 'textarea', required: true },
    { id: 'support.solutions',  group: 'Support', label: 'Solutions Provided',  type: 'textarea', required: true },

    // Step 9 – Final Summary
    { id: 'postVisit.actionPoints', group: 'Final Summary', label: 'Action Points',   type: 'textarea', required: true },
    { id: 'postVisit.remarks',      group: 'Final Summary', label: 'Overall Remarks', type: 'textarea', required: false }
];

// ── B2C Form Fields ───────────────────────────────────────────────────────────
const b2cFields = [
    { id: 'visitInfo.visitDate', group: 'Visit Details',      label: 'Visit Date',                type: 'date',     required: true },
    { id: 'visitInfo.officer',   group: 'Visit Details',      label: 'Visit Officer (Who Went)',  type: 'text',     required: true },

    { id: 'studentInfo.crmId',   group: 'Student Information', label: 'CRM ID',        type: 'text', required: true },
    { id: 'studentInfo.name',    group: 'Student Information', label: 'Student Name',  type: 'text', required: true },
    { id: 'studentInfo.email',   group: 'Student Information', label: 'Email ID',      type: 'text', required: true },

    { id: 'contactDetails.indiaNo',   group: 'Contact Details', label: 'India No.',    type: 'text', required: true },
    { id: 'contactDetails.canadaNo',  group: 'Contact Details', label: 'Canada No.',   type: 'text', required: true },
    { id: 'contactDetails.parentsNo', group: 'Contact Details', label: 'Parents No.',  type: 'text', required: true },

    { id: 'location.address', group: 'Location Details', label: 'Address', type: 'textarea', required: true },
    { id: 'location.city',    group: 'Location Details', label: 'City',    type: 'text',     required: true },

    { id: 'academic.college', group: 'Academic Details', label: 'College', type: 'text', required: true },

    { id: 'checklist.waGroup', group: 'Checklist', label: 'WA Group Created (Y/N)', type: 'toggle', required: true },
    { id: 'checklist.momDone', group: 'Checklist', label: 'MOM Done (Y/N)',          type: 'toggle', required: true },

    { id: 'outcome.status',  group: 'Final Outcome', label: 'Visit Outcome / Status', type: 'dropdown', required: true, options: [
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
    { id: 'outcome.remarks', group: 'Final Outcome', label: 'Remarks / Notes',        type: 'textarea',     required: true },
    { id: 'outcome.photo',   group: 'Final Outcome', label: 'Visit Verification Photo', type: 'photo-upload', required: false }
];

async function seed() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Seed B2B form
        const existingB2B = await FormConfig.findOne({ formType: 'generic', isActive: true });
        if (!existingB2B) {
            await FormConfig.create({
                version: `3.0-B2B-seed`,
                isActive: true,
                formType: 'generic',
                description: 'Standard B2B agency visit form',
                fields: b2bFields
            });
            console.log('B2B form configuration seeded.');
        } else {
            console.log('Active B2B form already exists at version:', existingB2B.version);
        }

        // Seed B2C form
        const existingB2C = await FormConfig.findOne({ formType: 'home_visit', isActive: true });
        if (!existingB2C) {
            await FormConfig.create({
                version: `1.0-B2C-seed`,
                isActive: true,
                formType: 'home_visit',
                description: 'Standard B2C home visit form',
                fields: b2cFields
            });
            console.log('B2C form configuration seeded.');
        } else {
            console.log('Active B2C form already exists at version:', existingB2C.version);
        }

        process.exit(0);
    } catch (err) {
        console.error('SEED ERROR:', err);
        process.exit(1);
    }
}

seed();
