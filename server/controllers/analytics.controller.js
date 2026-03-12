const Visit = require('../models/Visit');
const User = require('../models/User');

const buildQuery = (reqQuery, user) => {
    let query = {};
    if (user.role === 'user' || user.role === 'home_visit') {
        query.submittedBy = user._id;
    }

    const { pinCode, bdmName, rmName, status, city, startDate, endDate, reportType } = reqQuery;

    if (pinCode && pinCode !== '') query['agencyProfile.pinCode'] = pinCode;
    if (bdmName) query['meta.bdmName'] = { $regex: bdmName, $options: 'i' };
    if (rmName) query['meta.rmName'] = { $regex: rmName, $options: 'i' };
    if (status) query.status = status;
    if (city) {
        query.$or = [
            { 'agencyProfile.address': { $regex: city, $options: 'i' } },
            { 'studentInfo.address': { $regex: city, $options: 'i' } }
        ];
    }
    
    if (reportType === 'B2B') query.formType = 'generic'; 
    if (reportType === 'B2C') query.formType = 'home_visit';

    // Role-based department restriction for Admin
    if (user.role === 'admin') {
        if (user.department === 'B2B') {
            query.formType = 'generic';
        } else if (user.department === 'B2C') {
            query.formType = 'home_visit';
        }
    }
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return query;
};

exports.getSummary = async (req, res) => {
    try {
        const query = buildQuery(req.query, req.user);

        const totalVisits = await Visit.countDocuments(query);
        const pendingReview = await Visit.countDocuments({ ...query, status: 'submitted' });
        const actionRequired = await Visit.countDocuments({ ...query, status: 'action_required' });
        const activeUsersCount = (req.user.role !== 'user' && req.user.role !== 'home_visit') ? await User.countDocuments({ isActive: true }) : null;

        // Monthly Trends (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const trends = await Visit.aggregate([
            { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Status Distribution
        const statusDist = await Visit.aggregate([
            { $match: query },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                stats: { totalVisits, pendingReview, actionRequired, activeUsers: activeUsersCount },
                trends,
                statusDist
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserPerformance = async (req, res) => {
    try {
        const matchQuery = buildQuery(req.query, req.user);

        const performance = await Visit.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$submittedBy",
                    visitsCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    name: "$user.name",
                    employeeId: "$user.employeeId",
                    visitsCount: 1
                }
            },
            { $sort: { visitsCount: -1 } }
        ]);

        res.json({ success: true, data: performance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
