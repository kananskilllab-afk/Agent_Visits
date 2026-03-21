const mongoose = require('mongoose');

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const adminNoteSchema = new mongoose.Schema({
    note:     { type: String, required: true },
    addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt:  { type: Date, default: Date.now }
}, { _id: true });

const editHistorySchema = new mongoose.Schema({
    editedAt:        { type: Date, default: Date.now },
    editedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changesSummary:  { type: String }
}, { _id: true });

// ─── Main Schema ─────────────────────────────────────────────────────────────

const visitSchema = new mongoose.Schema({

    // ── Core ──────────────────────────────────────────────────────────────────
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'reviewed', 'action_required', 'closed'],
        default: 'draft',
        index: true
    },
    formVersion: { type: String },
    formType: {
        type: String,
        enum: ['generic', 'home_visit'],
        default: 'generic',
        index: true
    },

    // ══════════════════════════════════════════════════════════════════════════
    // B2B (generic) SECTIONS
    // ══════════════════════════════════════════════════════════════════════════

    // Step 1 – Visit Meta
    meta: {
        companyName:  { type: String, index: true },
        meetingStart: { type: Date },
        meetingEnd:   { type: Date },
        rmName:       { type: String },
        bdmName:      { type: String, index: true }
    },

    // Step 2 – Agency Profile
    agencyProfile: {
        establishmentYear: { type: Number },
        address:           { type: String },
        pinCode:           { type: String, index: true },
        contactNumber:     { type: String },
        email:             { type: String },
        businessModel:     [{ type: String }],
        officeArea:        { type: Number },
        infraRating:       { type: Number, min: 1, max: 5 },
        hasComputerLab:    { type: Boolean, default: false },
        numComputers:      { type: Number }
    },

    // Step 3 – Promoter & Team
    promoterTeam: {
        name:             { type: String },
        designation:      { type: String },
        totalStaff:       { type: Number },
        coachingTeamSize: { type: Number, default: 0 },
        countryTeamSize:  { type: Number, default: 0 },
        countriesPromoted: [{ type: String }]
    },

    // Step 4 – Marketing & Ops
    marketingOps: {
        avgDailyWalkins: { type: Number, default: 0 },
        walkinRatio:     { type: String },
        totalBranches:   { type: Number, default: 1 }
    },

    // Step 5 – Kanan Knowledge
    kananKnowledge: {
        source:              { type: String },
        previousAssociation: { type: Boolean, default: false },
        associationDetails:  { type: String }
    },

    // Step 6 – Partnership  (formerly currentBusiness)
    partnership: {
        preferredCountries: [{ type: String }],
        volumeCanada:       { type: Number, default: 0 },
        volumeUK:           { type: Number, default: 0 },
        volumeUSA:          { type: Number, default: 0 },
        volumeOthers:       { type: Number, default: 0 }
    },

    // Step 7 – Challenges  (formerly competitors)
    challenges: {
        mainAggregators: [{ type: String }],
        directAgents:    { type: String }
    },

    // Step 8 – Support  (formerly painPoints)
    support: {
        painPoints: { type: String },
        solutions:  { type: String }
    },

    // Step 9 – Post-Visit Summary
    postVisit: {
        actionPoints: { type: String },
        remarks:      { type: String }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // B2C (home_visit) SECTIONS
    // ══════════════════════════════════════════════════════════════════════════

    // Visit Info
    visitInfo: {
        visitDate:   { type: Date },
        officer:     { type: String },
        teamSize:    { type: String }, // Stored as string from dropdown
        teamMembers: [{ type: String }] // Array of additional names
    },

    // Student Information
    studentInfo: {
        crmId: { type: String, index: true },
        name:  { type: String },
        email: { type: String }
    },

    // Contact Details
    contactDetails: {
        indiaNo:   { type: String },
        canadaNo:  { type: String },
        parentsNo: { type: String }
    },

    // Location
    location: {
        address: { type: String },
        city:    { type: String, index: true },
        pinCode: { type: String },
        state:   { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },

    // Academic Details
    academic: {
        college: { type: String }
    },

    // Checklist
    checklist: {
        waGroup: { type: Boolean, default: false },
        waGroupName: { type: String },
        momDone: { type: Boolean, default: false }
    },

    // Final Outcome
    outcome: {
        status:  { type: String, enum: [
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
        remarks: { type: String },
        photo:   { type: String }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // GPS AUTO-DETECTED LOCATION  (both form types, captured at time of visit)
    // ══════════════════════════════════════════════════════════════════════════
    gpsLocation: { type: String },
    gpsCoordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SHARED ADMIN FIELDS  (both form types)
    // ══════════════════════════════════════════════════════════════════════════
    adminNotes:  [adminNoteSchema],
    editHistory: [editHistorySchema]

}, {
    timestamps: true
});

// ─── Compound indexes ─────────────────────────────────────────────────────────
visitSchema.index({ createdAt: -1 });
visitSchema.index({ formType: 1, status: 1 });
visitSchema.index({ submittedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
