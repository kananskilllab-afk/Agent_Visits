const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const { globalLimiter } = require('./middleware/rateLimiter');
const auditLogger = require('./middleware/auditLogger');

// Load environment variables
dotenv.config();

const app = express();

// Connect to Database
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        // Auto-seed FormConfig if missing
        const FormConfig = require('./models/FormConfig');
        const activeB2B = await FormConfig.findOne({ formType: 'generic', isActive: true });

        // Seed B2B form if missing or incomplete (< 31 fields)
        if (true) { // Force re-seed to ensure photo-upload field is added
            console.log('Seeding B2B form configuration (all 9 steps, 31 fields)...');
            if (activeB2B) {
                await FormConfig.updateMany({ formType: 'generic' }, { isActive: false });
            }
            await FormConfig.create({
                version: `5.0-B2B-${Date.now()}`,
                isActive: true,
                formType: 'generic',
                description: 'Standard B2B agency visit form',
                fields: [
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
                    { id: 'agencyProfile.businessModel',     group: 'Agency Profile', label: 'Business Model',        type: 'multi-select', required: true, options: ['Hybrid', 'Only IELTS/Coaching', 'Only Study Visa', 'Immigration', 'Other'] },
                    { id: 'agencyProfile.infraRating',       group: 'Agency Profile', label: 'Infrastructure Rating', type: 'star-rating',  required: true },
                    { id: 'agencyProfile.hasComputerLab',    group: 'Agency Profile', label: 'Computer Lab?',         type: 'toggle',       required: false },

                    // Step 3 – Promoter & Team
                    { id: 'promoterTeam.name',              group: 'Promoter & Team', label: 'Promoter Name',      type: 'text',         required: true },
                    { id: 'promoterTeam.designation',       group: 'Promoter & Team', label: 'Designation',        type: 'text',         required: true },
                    { id: 'promoterTeam.totalStaff',        group: 'Promoter & Team', label: 'Total Staff Count',  type: 'number',       required: true },
                    { id: 'promoterTeam.countriesPromoted', group: 'Promoter & Team', label: 'Countries Promoted', type: 'multi-select', required: true, options: ['Canada', 'USA', 'UK', 'Australia', 'New Zealand', 'Europe', 'Other'] },

                    // Step 4 – Marketing & Ops
                    { id: 'marketingOps.avgDailyWalkins', group: 'Marketing & Ops', label: 'Avg. Daily Walk-ins',       type: 'number', required: true },
                    { id: 'marketingOps.walkinRatio',     group: 'Marketing & Ops', label: 'Walk-in to Enquiry Ratio',  type: 'text',   required: false },
                    { id: 'marketingOps.totalBranches',   group: 'Marketing & Ops', label: 'Total Active Branches',     type: 'number', required: true },

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
                    { id: 'support.painPoints', group: 'Support', label: 'Agent Pain Points',  type: 'textarea', required: true },
                    { id: 'support.solutions',  group: 'Support', label: 'Solutions Provided', type: 'textarea', required: true },

                    // Step 9 – Final Summary
                    { id: 'postVisit.actionPoints', group: 'Final Summary', label: 'Action Points',   type: 'textarea',     required: true },
                    { id: 'postVisit.remarks',      group: 'Final Summary', label: 'Overall Remarks', type: 'textarea',     required: false },
                    { id: 'outcome.photo',          group: 'Final Summary', label: 'Visit Photo',     type: 'photo-upload', required: false }
                ]
            });
            console.log('B2B Form configuration seeded.');
        }

        // Seed B2C form if missing or incomplete
        const hasB2C = await FormConfig.findOne({ formType: 'home_visit', isActive: true });
        if (!hasB2C || hasB2C.fields.length < 19) {
            console.log('Seeding B2C form configuration...');
            if (hasB2C) {
                await FormConfig.updateMany({ formType: 'home_visit' }, { isActive: false });
            }
            await FormConfig.create({
                version: `3.0-B2C-${Date.now()}`,
                isActive: true,
                formType: 'home_visit',
                description: 'Standard B2C home visit form',
                fields: [
                    // Visit Details
                    { id: 'visitInfo.visitDate', group: 'Visit Details', label: 'Visit Date',         type: 'date',     required: true },
                    { id: 'visitInfo.teamSize',  group: 'Visit Details', label: 'Total Team Members', type: 'dropdown', required: true, options: ['1','2','3','4','5'] },
                    { id: 'visitInfo.officer',   group: 'Visit Details', label: 'Counsellor Name',    type: 'text',     required: true },
                    // Student Information
                    { id: 'studentInfo.crmId',   group: 'Student Information', label: 'CRM ID',       type: 'text', required: true },
                    { id: 'studentInfo.name',    group: 'Student Information', label: 'Student Name', type: 'text', required: true },
                    { id: 'studentInfo.email',   group: 'Student Information', label: 'Email ID',     type: 'text', required: true },
                    // Contact Details
                    { id: 'contactDetails.indiaNo',   group: 'Contact Details', label: 'India No.',   type: 'text', required: true },
                    { id: 'contactDetails.canadaNo',  group: 'Contact Details', label: 'Canada No.',  type: 'text', required: true },
                    { id: 'contactDetails.parentsNo', group: 'Contact Details', label: 'Parents No.', type: 'text', required: true },
                    // Location Details
                    { id: 'location.pinCode', group: 'Location Details', label: 'PIN Code', type: 'text',     required: true },
                    { id: 'location.address', group: 'Location Details', label: 'Address',  type: 'textarea', required: true },
                    { id: 'location.city',    group: 'Location Details', label: 'City',     type: 'text',     required: true },
                    { id: 'location.state',   group: 'Location Details', label: 'State',    type: 'text',     required: true },
                    // Academic Details
                    { id: 'academic.college', group: 'Academic Details', label: 'College', type: 'text', required: true },
                    // Checklist
                    { id: 'checklist.waGroup', group: 'Checklist', label: 'WA Group Created (Y/N)', type: 'toggle', required: true },
                    { id: 'checklist.momDone', group: 'Checklist', label: 'MOM Done (Y/N)',          type: 'toggle', required: true },
                    // Final Outcome
                    { id: 'outcome.status',  group: 'Final Outcome', label: 'Visit Outcome / Status', type: 'dropdown', required: true, options: [
                        'Pending', 'Completed', 'Cancelled', 'HOUSE LOCKED', 'ADDRESS NOT FOUND', 'VISIT DONE',
                        'REVISIT REQUIRED', 'ENROLLED', 'NOT INTRESTED', 'OUT OF VADODARAA', 'IN PROGRESS',
                        'WRONG ADDRESS DETAILS', 'NOT RESPONDING', 'HO INVITE', 'FOLLOW UP REQUIRED',
                        'SHIFTED OTHER CITY', 'NOT FOUND'
                    ] },
                    { id: 'outcome.remarks', group: 'Final Outcome', label: 'Remarks / Notes',          type: 'textarea',     required: true },
                    { id: 'outcome.photo',   group: 'Final Outcome', label: 'Visit Verification Photo', type: 'photo-upload', required: false }
                ]
            });
            console.log('B2C Form configuration seeded.');
        }
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://127.0.0.1:5173', 'http://localhost:5173'] : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(globalLimiter); // Rate limiting
app.use(auditLogger); // Audit tracking
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to AVS Application API' });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const visitRoutes = require('./routes/visits.routes');
const userRoutes = require('./routes/users.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes = require('./routes/reports.routes');
const formConfigRoutes = require('./routes/formConfig.routes');
const auditLogRoutes = require('./routes/auditLogs.routes');
const pincodeRoutes = require('./routes/pincode.routes');
const uploadRoutes = require('./routes/upload.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/form-config', formConfigRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
