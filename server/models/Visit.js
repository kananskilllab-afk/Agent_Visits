const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'reviewed', 'action_required', 'closed'],
        default: 'draft'
    },
    formVersion: String,
    formType: {
        type: String,
        enum: ['generic', 'home_visit'],
        default: 'generic'
    },

    meta: {
        companyName: { type: String },
        meetingStart: { type: Date },
        meetingEnd: { type: Date },
        rmName: { type: String },
        bdmName: { type: String }
    },

    agencyProfile: {
        establishmentYear: { type: Number },
        address: { type: String },
        pinCode: { type: String },
        contactNumber: { type: String },
        email: String,
        businessModel: [String],
        officeArea: { type: Number },
        infraRating: { type: Number, min: 1, max: 5 },
        hasComputerLab: { type: Boolean, default: false },
        numComputers: Number
    },

    promoterTeam: {
        name: { type: String },
        designation: { type: String },
        totalStaff: { type: Number },
        coachingTeamSize: { type: Number, default: 0 },
        countryTeamSize: { type: Number, default: 0 },
        countriesPromoted: [String]
    },

    marketingOps: {
        avgDailyWalkins: { type: Number, default: 0 },
        walkinRatio: String,
        totalBranches: { type: Number, default: 1 }
    },

    kananKnowledge: {
        source: String,
        previousAssociation: { type: Boolean, default: false },
        associationDetails: String
    },

    currentBusiness: {
        preferredCountries: [String],
        volumeCanada: { type: Number, default: 0 },
        volumeUK: { type: Number, default: 0 },
        volumeUSA: { type: Number, default: 0 },
        volumeOthers: { type: Number, default: 0 }
    },

    competitors: {
        mainAggregators: [String],
        directAgents: String
    },

    painPoints: {
        problems: { type: String },
        solutions: { type: String }
    },

    postVisit: {
        actionPoints: { type: String },
        remarks: { type: String }
    },

    adminNotes: [{
        note: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }],

    editHistory: [{
        editedAt: { type: Date, default: Date.now },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changesSummary: String
    }]
}, {
    timestamps: true,
    strict: false // Allow dynamic fields from Form Builder
});

module.exports = mongoose.model('Visit', visitSchema);
