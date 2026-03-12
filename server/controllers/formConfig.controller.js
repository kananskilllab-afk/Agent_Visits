const FormConfig = require('../models/FormConfig');

exports.getFormConfig = async (req, res) => {
    try {
        const { formType } = req.query;
        const query = { isActive: true };
        if (formType) query.formType = formType;
        
        const config = await FormConfig.findOne(query).sort({ createdAt: -1 });
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFormConfig = async (req, res) => {
    try {
        const { version, fields, formType } = req.body;

        // Deactivate others of same type if this one will be active
        if (req.body.isActive) {
            await FormConfig.updateMany({ formType: formType || 'generic' }, { isActive: false });
        }

        const config = await FormConfig.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: config });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
