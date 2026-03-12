const Visit = require('../models/Visit');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all visits (User: own, Admin+: all)
exports.getVisits = async (req, res) => {
    try {
        let query = {};

        // Role-based filtering
        if (req.user.role === 'user' || req.user.role === 'home_visit') {
            query.submittedBy = req.user._id;
        }

        // Additional filters from query params
        const { status, companyName, startDate, endDate, city, formType } = req.query;
        if (status) query.status = status;
        
        if (companyName) {
            query.$or = [
                { 'meta.companyName': { $regex: companyName, $options: 'i' } },
                { 'studentInfo.name': { $regex: companyName, $options: 'i' } }
            ];
        }

        // Apply formType filter from query or from Admin's department
        if (formType) {
            query.formType = formType === 'home_visit' ? 'home_visit' : 'generic';
        }

        // Admin department restriction (overrides or restricts query params)
        if (req.user.role === 'admin') {
            if (req.user.department === 'B2C') {
                query.formType = 'home_visit';
            } else if (req.user.department === 'B2B') {
                query.formType = 'generic';
            }
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (city) {
            if (!query.$or) query.$or = [];
            query.$or.push(
                { 'agencyProfile.address': { $regex: city, $options: 'i' } },
                { 'studentInfo.address': { $regex: city, $options: 'i' } }
            );
        }

        const visits = await Visit.find(query)
            .populate('submittedBy', 'name employeeId')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: visits.length, data: visits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new visit (draft)
exports.createVisit = async (req, res) => {
    try {
        const visitData = {
            ...req.body,
            submittedBy: req.user._id,
            status: req.body.status || 'draft'
        };

        const visit = await Visit.create(visitData);
        res.status(201).json({ success: true, data: visit });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get single visit
exports.getVisitById = async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id)
            .populate('submittedBy', 'name employeeId')
            .populate('adminNotes.addedBy', 'name');

        if (!visit) {
            return res.status(404).json({ success: false, message: 'Visit not found' });
        }

        // Check ownership
        if ((req.user.role === 'user' || req.user.role === 'home_visit') && visit.submittedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this visit' });
        }

        res.json({ success: true, data: visit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update visit (24h window constraint)
exports.updateVisit = async (req, res) => {
    try {
        let visit = await Visit.findById(req.params.id);

        if (!visit) {
            return res.status(404).json({ success: false, message: 'Visit not found' });
        }

        // Admin can always update status and notes
        if (req.user.role !== 'user' && req.user.role !== 'home_visit') {
            // If it's just an admin adding a note or changing status
            if (req.body.status) visit.status = req.body.status;
            if (req.body.adminNote) {
                visit.adminNotes.push({
                    note: req.body.adminNote,
                    addedBy: req.user._id
                });
            }
            await visit.save();
            return res.json({ success: true, data: visit });
        }

        // User constraints
        if (visit.submittedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this visit' });
        }

        // 24-hour edit lock check (if not draft)
        if (visit.status !== 'draft') {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (visit.updatedAt < twentyFourHoursAgo) {
                return res.status(403).json({ success: false, message: 'Edit window (24h) has expired' });
            }
        }

        // Record history
        const historyEntry = {
            editedAt: new Date(),
            editedBy: req.user._id,
            changesSummary: 'Update survey details'
        };

        const updatedVisit = await Visit.findByIdAndUpdate(
            req.params.id,
            { ...req.body, $push: { editHistory: historyEntry } },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedVisit });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete visit
exports.deleteVisit = async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id);

        if (!visit) {
            return res.status(404).json({ success: false, message: 'Visit not found' });
        }

        // SuperAdmin can delete anything
        if (req.user.role === 'superadmin') {
            await visit.deleteOne();
            return res.json({ success: true, message: 'Visit removed' });
        }

        // User can only delete own visits
        if (visit.submittedBy.toString() === req.user._id.toString()) {
            await visit.deleteOne();
            return res.json({ success: true, message: 'Visit removed' });
        }

        res.status(403).json({ success: false, message: 'Not authorized to delete this visit' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
