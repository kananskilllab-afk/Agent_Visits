const mongoose = require('mongoose');

const formConfigSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    formType: {
        type: String,
        enum: ['generic', 'home_visit'],
        default: 'generic'
    },
    fields: [{
        id: String,
        group: String,
        label: String,
        type: {
            type: String,
            enum: ['text', 'textarea', 'number', 'date', 'datetime', 'dropdown', 'multi-select', 'toggle', 'star-rating', 'file']
        },
        required: {
            type: Boolean,
            default: false
        },
        options: [String],
        conditionalOn: {
            fieldId: String,
            value: mongoose.Schema.Types.Mixed
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FormConfig', formConfigSchema);
