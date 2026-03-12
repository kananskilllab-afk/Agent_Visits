const mongoose = require('mongoose');
const User = require('./models/User');
const Visit = require('./models/Visit');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Visit.deleteMany({});

        // Create Users
        const superadmin = await User.create({
            employeeId: 'K-001',
            name: 'Super Admin',
            email: 'superadmin@kanan.co',
            passwordHash: 'Admin@123', // Will be hashed by pre-save
            role: 'superadmin'
        });

        const admin = await User.create({
            employeeId: 'K-002',
            name: 'Central Admin',
            email: 'admin@kanan.co',
            passwordHash: 'Admin@123',
            role: 'admin'
        });

        const user = await User.create({
            employeeId: 'K-101',
            name: 'Rahul Sharma',
            email: 'rahul@kanan.co',
            passwordHash: 'Rahul@123',
            role: 'user',
            region: 'North India'
        });

        console.log('Users seeded!');

        // Create Sample Visit
        await Visit.create({
            submittedBy: user._id,
            status: 'submitted',
            meta: {
                companyName: 'Global Education Consultants',
                meetingStart: new Date(),
                meetingEnd: new Date(Date.now() + 3600000),
                rmName: 'Rahul Sharma',
                bdmName: 'Amit Singh'
            },
            agencyProfile: {
                establishmentYear: 2015,
                address: '123 Business Hub, Sector 18, Gurugram',
                pinCode: '122001',
                contactNumber: '9876543210',
                businessModel: ['Hybrid', 'Coaching Only'],
                officeArea: 1200,
                infraRating: 4,
                hasComputerLab: true,
                numComputers: 15
            },
            promoterTeam: {
                name: 'Mr. Kapoor',
                designation: 'Managing Director',
                totalStaff: 10,
                coachingTeamSize: 4,
                countryTeamSize: 2,
                countriesPromoted: ['Canada', 'UK']
            },
            marketingOps: {
                avgDailyWalkins: 15,
                walkinRatio: '1:3',
                totalBranches: 1
            },
            painPoints: {
                problemStatement: 'Need more support for USA university partnerships.',
                solutionProvided: 'Will share the new Kanan USA portal details.',
                problemStatement: 'Marketing budget is low.',
                solutionProvided: 'Suggested tie-ups.',
            },
            postVisit: {
                actionPoints: 'Follow up on USA portal access next week.'
            }
        });

        console.log('Sample visits seeded!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
