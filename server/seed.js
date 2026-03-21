const mongoose = require('mongoose');
const User = require('./models/User');
const Visit = require('./models/Visit');
const PinCode = require('./models/PinCode');
const dotenv = require('dotenv');

dotenv.config();

// ── Helpers ───────────────────────────────────────────────────────────────────

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

// Random date within the last N days, biased toward weekdays and business hours
const randDate = (daysBack = 90) => {
    const now = new Date();
    let attempts = 0;
    while (attempts < 20) {
        const d = new Date(now - randInt(0, daysBack) * 86400000);
        const dow = d.getDay(); // 0=Sun, 6=Sat
        if (dow >= 1 && dow <= 6) { // Mon–Sat (some Saturday visits too)
            d.setHours(randInt(9, 18), randInt(0, 59), 0, 0);
            return d;
        }
        attempts++;
    }
    // fallback
    const d = new Date(now - randInt(0, daysBack) * 86400000);
    d.setHours(randInt(9, 18), 0, 0, 0);
    return d;
};

// GPS jitter around a city center
const jitterCoords = (lat, lng, km = 15) => ({
    lat: lat + (Math.random() - 0.5) * (km / 111),
    lng: lng + (Math.random() - 0.5) * (km / 111)
});

// ── Reference data ────────────────────────────────────────────────────────────

const CITIES = [
    { name: 'Mumbai',     lat: 19.0760, lng: 72.8777, state: 'Maharashtra', region: 'West India' },
    { name: 'Delhi',      lat: 28.6139, lng: 77.2090, state: 'Delhi', region: 'North India' },
    { name: 'Bengaluru',  lat: 12.9716, lng: 77.5946, state: 'Karnataka', region: 'South India' },
    { name: 'Chennai',    lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', region: 'South India' },
    { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867, state: 'Telangana', region: 'South India' },
    { name: 'Pune',       lat: 18.5204, lng: 73.8567, state: 'Maharashtra', region: 'West India' },
    { name: 'Kolkata',    lat: 22.5726, lng: 88.3639, state: 'West Bengal', region: 'East India' },
    { name: 'Ahmedabad',  lat: 23.0225, lng: 72.5714, state: 'Gujarat', region: 'West India' },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, state: 'Punjab', region: 'North India' },
    { name: 'Jaipur',     lat: 26.9124, lng: 75.7873, state: 'Rajasthan', region: 'North India' },
    { name: 'Lucknow',    lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', region: 'North India' },
    { name: 'Gurugram',   lat: 28.4595, lng: 77.0266, state: 'Haryana', region: 'North India' },
];

const PINCODES = [
    { code: '400001', area: 'Churchgate',   city: 'Mumbai',     state: 'Maharashtra', region: 'West India' },
    { code: '400053', area: 'Andheri West', city: 'Mumbai',     state: 'Maharashtra', region: 'West India' },
    { code: '400070', area: 'Chembur',      city: 'Mumbai',     state: 'Maharashtra', region: 'West India' },
    { code: '110001', area: 'Connaught Place', city: 'Delhi',   state: 'Delhi',       region: 'North India' },
    { code: '110092', area: 'Patparganj',   city: 'Delhi',      state: 'Delhi',       region: 'North India' },
    { code: '122001', area: 'Sector 18',    city: 'Gurugram',   state: 'Haryana',     region: 'North India' },
    { code: '560001', area: 'MG Road',      city: 'Bengaluru',  state: 'Karnataka',   region: 'South India' },
    { code: '560038', area: 'Koramangala',  city: 'Bengaluru',  state: 'Karnataka',   region: 'South India' },
    { code: '600001', area: 'Parrys',       city: 'Chennai',    state: 'Tamil Nadu',  region: 'South India' },
    { code: '600017', area: 'T Nagar',      city: 'Chennai',    state: 'Tamil Nadu',  region: 'South India' },
    { code: '500001', area: 'Abids',        city: 'Hyderabad',  state: 'Telangana',   region: 'South India' },
    { code: '411001', area: 'Camp',         city: 'Pune',       state: 'Maharashtra', region: 'West India' },
    { code: '700001', area: 'BBD Bag',      city: 'Kolkata',    state: 'West Bengal', region: 'East India' },
    { code: '380001', area: 'Lal Darwaja',  city: 'Ahmedabad',  state: 'Gujarat',     region: 'West India' },
    { code: '160017', area: 'Sector 17',    city: 'Chandigarh', state: 'Punjab',      region: 'North India' },
    { code: '302001', area: 'MI Road',      city: 'Jaipur',     state: 'Rajasthan',   region: 'North India' },
    { code: '226001', area: 'Hazratganj',   city: 'Lucknow',    state: 'Uttar Pradesh', region: 'North India' },
];

const COMPANIES = [
    'Global Education Consultants', 'StudyAbroad Hub', 'Future Pathways', 'Horizon Overseas',
    'EduWorld Consultants', 'Abroad Dreams', 'Pioneer Consultancy', 'Bright Futures Institute',
    'Elite Study Abroad', 'Academic Wings', 'International Gateway', 'Overseas Scholar',
    'UniPlan Consultants', 'Career Compass Abroad', 'NextGen Education', 'Skyline Overseas',
    'Pinnacle Consultants', 'Eduvision Global', 'Scholar\'s Path', 'Global Minds Academy',
    'Prime Education Consultants', 'Aspire Abroad', 'Sunrise Education Hub', 'Premier Overseas',
    'Excel Consultants', 'Vision International', 'EduFirst Consultancy', 'Beyond Borders',
    'Capital Education Hub', 'Focus Abroad Advisors'
];

const BDM_NAMES = ['Amit Singh', 'Preethi Nair', 'Rajesh Kumar', 'Sneha Verma', 'Manish Gupta'];
const RM_NAMES = ['Rahul Sharma', 'Divya Patel', 'Suresh Nair', 'Ananya Reddy', 'Vikram Joshi'];

const BUSINESS_MODELS = ['Only Study Visa', 'Hybrid', 'Test Prep + Visa', 'PR Only', 'Full Service'];
const COUNTRIES_PROMOTED = ['Canada', 'UK', 'USA', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'France'];
const AGGREGATORS = ['ApplyBoard', 'IDP', 'AECC Global', 'Edwise', 'SI-UK', 'StudyCo', 'Canam'];
const KANAN_SOURCES = ['Reference', 'Social Media', 'Cold Call', 'Exhibition', 'Walk-in', 'Email Campaign'];
const PROMOTER_DESIGNATIONS = ['Managing Director', 'CEO', 'Director', 'Owner', 'Branch Manager', 'Senior Counsellor'];

const STUDENT_NAMES = [
    'Arjun Patel', 'Riya Shah', 'Karan Mehta', 'Anjali Singh', 'Dhruv Sharma',
    'Neha Gupta', 'Rohan Verma', 'Shreya Nair', 'Vikram Reddy', 'Tanvi Joshi',
    'Aditya Kumar', 'Priya Rao', 'Siddharth Iyer', 'Meera Pillai', 'Rahul Das',
    'Pooja Bhatt', 'Amit Saxena', 'Divya Menon', 'Nikhil Kapoor', 'Swati Tiwari',
    'Harsh Agarwal', 'Ritika Bose', 'Gaurav Malhotra', 'Simran Kaur', 'Abhishek Roy',
    'Nidhi Pandey', 'Shubham Yadav', 'Pallavi Desai', 'Mayank Srivastava', 'Komal Jain',
    'Ishaan Chopra', 'Ankita Mishra', 'Vivek Thakur', 'Ruhi Sharma', 'Pranav Naik',
    'Kavya Pillai', 'Rishabh Dubey', 'Trisha Banerjee', 'Parth Modi', 'Avni Patel'
];

const OUTCOME_STATUSES = ['Completed', 'Pending', 'Follow-up Needed', 'Cancelled'];
const OUTCOME_WEIGHTS = [0.45, 0.25, 0.20, 0.10]; // probability weights

const VISIT_STATUSES = ['closed', 'submitted', 'reviewed', 'draft', 'action_required'];
const STATUS_WEIGHTS = [0.28, 0.25, 0.22, 0.15, 0.10];

const pickWeighted = (items, weights) => {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
        cumulative += weights[i];
        if (r <= cumulative) return items[i];
    }
    return items[items.length - 1];
};

// ── Main seed function ────────────────────────────────────────────────────────

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Clear existing data
        await User.deleteMany({});
        await Visit.deleteMany({});
        await PinCode.deleteMany({});
        console.log('Cleared existing data.');

        // ── Pincodes ──────────────────────────────────────────────────────────
        await PinCode.insertMany(PINCODES);
        console.log(`Seeded ${PINCODES.length} pincodes.`);

        // ── Users ─────────────────────────────────────────────────────────────
        const superadmin = await User.create({
            employeeId: 'K-001', name: 'Super Admin',
            email: 'superadmin@kanan.co', passwordHash: 'Admin@123',
            role: 'superadmin', department: 'B2B'
        });

        const adminB2B = await User.create({
            employeeId: 'K-002', name: 'Central Admin B2B',
            email: 'admin@kanan.co', passwordHash: 'Admin@123',
            role: 'admin', department: 'B2B', createdBy: superadmin._id
        });

        const adminB2C = await User.create({
            employeeId: 'K-003', name: 'Central Admin B2C',
            email: 'adminb2c@kanan.co', passwordHash: 'Admin@123',
            role: 'admin', department: 'B2C', createdBy: superadmin._id
        });

        // B2B Field Agents
        const b2bAgentData = [
            { employeeId: 'K-101', name: 'Rahul Sharma',  email: 'rahul@kanan.co',   passwordHash: 'Rahul@123',   region: 'North India' },
            { employeeId: 'K-102', name: 'Divya Kapoor',  email: 'divya@kanan.co',   passwordHash: 'Divya@123',   region: 'West India' },
            { employeeId: 'K-103', name: 'Suresh Menon',  email: 'suresh@kanan.co',  passwordHash: 'Suresh@123',  region: 'South India' },
            { employeeId: 'K-104', name: 'Ankita Verma',  email: 'ankita@kanan.co',  passwordHash: 'Ankita@123',  region: 'North India' },
            { employeeId: 'K-105', name: 'Ravi Pillai',   email: 'ravi@kanan.co',    passwordHash: 'Ravi@123',    region: 'South India' },
            { employeeId: 'K-106', name: 'Meena Joshi',   email: 'meena@kanan.co',   passwordHash: 'Meena@123',   region: 'West India' },
        ];
        const b2bAgents = await User.insertMany(
            b2bAgentData.map(u => ({ ...u, role: 'user', department: 'B2B', createdBy: adminB2B._id }))
        );

        // B2C Field Officers
        const b2cAgentData = [
            { employeeId: 'K-201', name: 'Priya Mehta',   email: 'priya@kanan.co',   passwordHash: 'Priya@123',   region: 'West India' },
            { employeeId: 'K-202', name: 'Aryan Singh',   email: 'aryan@kanan.co',   passwordHash: 'Aryan@123',   region: 'North India' },
            { employeeId: 'K-203', name: 'Lakshmi Rao',   email: 'lakshmi@kanan.co', passwordHash: 'Lakshmi@123', region: 'South India' },
            { employeeId: 'K-204', name: 'Kabir Das',     email: 'kabir@kanan.co',   passwordHash: 'Kabir@123',   region: 'East India' },
        ];
        const b2cAgents = await User.insertMany(
            b2cAgentData.map(u => ({ ...u, role: 'home_visit', department: 'B2C', createdBy: adminB2C._id }))
        );

        console.log(`Seeded ${2 + b2bAgents.length + b2cAgents.length + 1} users.`);

        // ── B2B Visits ────────────────────────────────────────────────────────
        const b2bVisits = [];
        const visitsPerB2BAgent = [18, 15, 13, 12, 11, 9]; // total 78

        for (let agentIdx = 0; agentIdx < b2bAgents.length; agentIdx++) {
            const agent = b2bAgents[agentIdx];
            const count = visitsPerB2BAgent[agentIdx];

            for (let i = 0; i < count; i++) {
                const city = rand(CITIES);
                const pincode = rand(PINCODES.filter(p => p.region === city.region) || PINCODES);
                const coords = jitterCoords(city.lat, city.lng);
                const visitDate = randDate(90);
                const status = pickWeighted(VISIT_STATUSES, STATUS_WEIGHTS);
                const numCountries = randInt(1, 4);
                const countries = [...COUNTRIES_PROMOTED].sort(() => 0.5 - Math.random()).slice(0, numCountries);
                const numPrefCountries = randInt(1, 3);
                const prefCountries = [...COUNTRIES_PROMOTED].sort(() => 0.5 - Math.random()).slice(0, numPrefCountries);
                const numBizModels = randInt(1, 2);
                const bizModels = [...BUSINESS_MODELS].sort(() => 0.5 - Math.random()).slice(0, numBizModels);

                b2bVisits.push({
                    submittedBy: agent._id,
                    status,
                    formType: 'generic',
                    formVersion: '4.0-B2B',
                    createdAt: visitDate,
                    updatedAt: visitDate,

                    meta: {
                        companyName: rand(COMPANIES),
                        meetingStart: visitDate,
                        meetingEnd: new Date(visitDate.getTime() + randInt(60, 180) * 60000),
                        rmName: rand(RM_NAMES),
                        bdmName: rand(BDM_NAMES)
                    },

                    agencyProfile: {
                        establishmentYear: randInt(2005, 2022),
                        address: `${randInt(1, 999)} ${rand(['Sector', 'Block', 'Phase', 'Road', 'Street'])} ${randInt(1, 50)}, ${city.name}`,
                        pinCode: pincode.code,
                        contactNumber: `9${randInt(100000000, 999999999)}`,
                        email: `info@${rand(COMPANIES).toLowerCase().replace(/\s+/g, '')}.com`,
                        businessModel: bizModels,
                        officeArea: randInt(400, 3000),
                        infraRating: randInt(2, 5),
                        hasComputerLab: Math.random() > 0.4,
                        numComputers: randInt(5, 30)
                    },

                    promoterTeam: {
                        name: `Mr./Ms. ${rand(['Kapoor', 'Shah', 'Nair', 'Iyer', 'Reddy', 'Mehta', 'Joshi', 'Singh'])}`,
                        designation: rand(PROMOTER_DESIGNATIONS),
                        totalStaff: randInt(4, 40),
                        coachingTeamSize: randInt(1, 8),
                        countryTeamSize: randInt(1, 5),
                        countriesPromoted: countries
                    },

                    marketingOps: {
                        avgDailyWalkins: randInt(5, 50),
                        walkinRatio: `1:${randInt(2, 8)}`,
                        totalBranches: randInt(1, 6)
                    },

                    kananKnowledge: {
                        source: rand(KANAN_SOURCES),
                        previousAssociation: Math.random() > 0.6,
                        associationDetails: Math.random() > 0.6 ? 'Previously worked with Kanan in 2022 for Canada applications.' : ''
                    },

                    partnership: {
                        preferredCountries: prefCountries,
                        volumeCanada: countries.includes('Canada') ? randInt(10, 100) : 0,
                        volumeUK:     countries.includes('UK')     ? randInt(5,  60)  : 0,
                        volumeUSA:    countries.includes('USA')    ? randInt(5,  80)  : 0,
                        volumeOthers: randInt(0, 30)
                    },

                    challenges: {
                        mainAggregators: [...AGGREGATORS].sort(() => 0.5 - Math.random()).slice(0, randInt(1, 3)),
                        directAgents: `${randInt(2, 15)} local agents in the ${city.name} area.`
                    },

                    support: {
                        painPoints: rand([
                            'Needs faster offer letter turnaround.',
                            'Wants better commission structure.',
                            'Requires more training on UK pathway.',
                            'Struggling with GIC process documentation.',
                            'Needs dedicated relationship manager.',
                            'Seeking better visa refusal support.'
                        ]),
                        solutions: rand([
                            'Shared new Kanan portal credentials.',
                            'Scheduled follow-up training session.',
                            'Introduced to regional team leader.',
                            'Provided updated fee structure document.',
                            'Enrolled in Kanan partner webinar series.'
                        ])
                    },

                    postVisit: {
                        actionPoints: rand([
                            'Follow up within 7 days for MOU signing.',
                            'Send Canada intake schedule by Friday.',
                            'Schedule product training for the team.',
                            'Share UK universities shortlist.',
                            'Verify agency registration documents.'
                        ]),
                        remarks: rand([
                            'Agency is well-established. High conversion potential.',
                            'New agency but motivated team. Worth investing time.',
                            'Strong B2C background. Can cross-sell B2B programs.',
                            'Competitor-heavy territory. Needs dedicated support.',
                            'Very interested in premium partner program.'
                        ])
                    },

                    gpsLocation: `${city.name}, ${pincode.code}`,
                    gpsCoordinates: coords
                });
            }
        }

        // Use insertMany with timestamps override
        await Visit.collection.insertMany(b2bVisits);
        console.log(`Seeded ${b2bVisits.length} B2B visits.`);

        // ── B2C Home Visits ───────────────────────────────────────────────────
        const b2cVisits = [];
        const visitsPerB2CAgent = [14, 12, 10, 8]; // total 44

        for (let agentIdx = 0; agentIdx < b2cAgents.length; agentIdx++) {
            const agent = b2cAgents[agentIdx];
            const count = visitsPerB2CAgent[agentIdx];

            for (let i = 0; i < count; i++) {
                const city = rand(CITIES);
                const coords = jitterCoords(city.lat, city.lng, 10);
                const visitDate = randDate(90);
                const status = pickWeighted(VISIT_STATUSES, STATUS_WEIGHTS);
                const outcomeStatus = pickWeighted(OUTCOME_STATUSES, OUTCOME_WEIGHTS);
                const studentName = rand(STUDENT_NAMES);

                b2cVisits.push({
                    submittedBy: agent._id,
                    status,
                    formType: 'home_visit',
                    formVersion: '1.0-B2C',
                    createdAt: visitDate,
                    updatedAt: visitDate,

                    visitInfo: {
                        visitDate,
                        officer: agent.name
                    },

                    studentInfo: {
                        crmId: `CRM-${randInt(10000, 99999)}`,
                        name: studentName,
                        email: `${studentName.toLowerCase().replace(/\s+/g, '.')}${randInt(10, 99)}@gmail.com`
                    },

                    contactDetails: {
                        indiaNo:   `9${randInt(100000000, 999999999)}`,
                        canadaNo:  `+1-${randInt(200, 999)}-555-${randInt(1000, 9999)}`,
                        parentsNo: `9${randInt(100000000, 999999999)}`
                    },

                    location: {
                        address: `${randInt(1, 500)} ${rand(['Sunrise Colony', 'Green Park', 'Lake View Apartments', 'Garden Heights', 'Shanti Nagar', 'Civil Lines'])}, ${city.name}`,
                        city: city.name,
                        coordinates: coords
                    },

                    academic: {
                        college: rand([
                            'University of Toronto', 'University of British Columbia',
                            'University of Waterloo', 'McGill University',
                            'University of Melbourne', 'University of Edinburgh',
                            'King\'s College London', 'University of Manchester',
                            'Northeastern University', 'Arizona State University'
                        ])
                    },

                    checklist: {
                        waGroup: Math.random() > 0.3,
                        momDone: Math.random() > 0.4
                    },

                    outcome: {
                        status: outcomeStatus,
                        remarks: rand([
                            'Student confirmed enrollment. Docs collected.',
                            'Follow-up call scheduled for next week.',
                            'Student needs more time to decide.',
                            'Parents require additional counselling.',
                            'All documents verified and submitted.',
                            'Student requested university comparison sheet.'
                        ])
                    },

                    gpsLocation: `${city.name}, ${city.state}`,
                    gpsCoordinates: coords
                });
            }
        }

        await Visit.collection.insertMany(b2cVisits);
        console.log(`Seeded ${b2cVisits.length} B2C visits.`);

        const totalVisits = b2bVisits.length + b2cVisits.length;
        console.log(`\n✅ Seeding complete!`);
        console.log(`   Users:  ${3 + b2bAgents.length + b2cAgents.length} (1 superadmin, 2 admins, ${b2bAgents.length} B2B agents, ${b2cAgents.length} B2C officers)`);
        console.log(`   Visits: ${totalVisits} (${b2bVisits.length} B2B + ${b2cVisits.length} B2C)`);
        console.log(`   Pincodes: ${PINCODES.length}`);
        console.log(`\n   Login credentials:`);
        console.log(`     superadmin@kanan.co / Admin@123  (Super Admin)`);
        console.log(`     admin@kanan.co      / Admin@123  (B2B Admin)`);
        console.log(`     adminb2c@kanan.co   / Admin@123  (B2C Admin)`);
        console.log(`     rahul@kanan.co      / Rahul@123  (B2B Agent)`);
        console.log(`     priya@kanan.co      / Priya@123  (B2C Officer)`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
