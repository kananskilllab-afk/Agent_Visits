import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    Users,
    TrendingUp,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Download,
    Filter,
    Calendar as CalendarIcon,
    RefreshCcw,
    MapPin as MapIcon,
    Briefcase
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import ActivityMap from '../components/charts/ActivityMap';

const Analytics = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userVisits, setUserVisits] = useState([]);
    const [isFetchingUser, setIsFetchingUser] = useState(false);
    const [pincodes, setPincodes] = useState([]);
    
    // Filters State
    const [filters, setFilters] = useState({
        pinCode: '',
        bdmName: '',
        rmName: '',
        status: '',
        city: '',
        startDate: '',
        endDate: '',
        reportType: user.role === 'admin' && user.department ? user.department : ''
    });

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            pinCode: '',
            bdmName: '',
            rmName: '',
            status: '',
            city: '',
            startDate: '',
            endDate: '',
            reportType: ''
        });
    };

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const pincodeRes = await api.get('/pincodes');
                setPincodes(pincodeRes.data.data);
            } catch (err) {
                console.error('Error fetching pincodes:', err);
            }
        };
        fetchBaseData();
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });
                const queryString = params.toString() ? `?${params.toString()}` : '';
                
                const [summaryRes, performanceRes] = await Promise.all([
                    api.get(`/analytics/summary${queryString}`),
                    api.get(`/analytics/performance${queryString}`)
                ]);
                setSummary(summaryRes.data.data);
                setPerformance(performanceRes.data.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [filters]);

    const fetchUserSpecificData = async (userId) => {
        setIsFetchingUser(true);
        try {
            // We'll use the visits endpoint with a filter to get recent visits for this user
            const res = await api.get(`/visits?submittedBy=${userId}`);
            setUserVisits(res.data.data);
            const userPerf = performance.find(p => p._id === userId);
            setSelectedUser(userPerf);
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setIsFetchingUser(false);
        }
    };

    const filteredPerformance = performance.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[400px] bg-slate-200 rounded-xl"></div>
                <div className="h-[400px] bg-slate-200 rounded-xl"></div>
            </div>
        </div>
    );

    const statusColors = {
        'submitted': '#2E75B6',
        'closed': '#10B981',
        'action_required': '#EF4444',
        'draft': '#94A3B8',
        'reviewed': '#1A3C6E'
    };

    const pieData = summary?.statusDist.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('_', ' '),
        value: item.count,
        color: statusColors[item._id] || '#cbd5e1'
    })) || [];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Advanced Analytics</h1>
                    <p className="text-slate-500">Comprehensive overview of activity and performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Reset
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-kanan-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card border-none bg-slate-50/50 p-6">
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                    <Filter className="w-5 h-5 text-kanan-blue" />
                    Analytics Filters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* BDM Search */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> BDM Name
                        </label>
                        <input 
                            type="text"
                            placeholder="Search BDM..."
                            className="input-field h-10 text-sm"
                            value={filters.bdmName}
                            onChange={(e) => handleFilterChange('bdmName', e.target.value)}
                        />
                    </div>
                    {/* RM Search */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3" /> RM Name
                        </label>
                        <input 
                            type="text"
                            placeholder="Search RM..."
                            className="input-field h-10 text-sm"
                            value={filters.rmName}
                            onChange={(e) => handleFilterChange('rmName', e.target.value)}
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <RefreshCcw className="w-3 h-3" /> Status
                        </label>
                        <select 
                            className="input-field h-10 text-sm"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="action_required">Action Required</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    {/* Pincode Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <MapIcon className="w-3 h-3" /> Pincode
                        </label>
                        <select 
                            value={filters.pinCode}
                            onChange={(e) => handleFilterChange('pinCode', e.target.value)}
                            className="input-field h-10 text-sm"
                        >
                            <option value="">All Pincodes</option>
                            {pincodes.map(pc => (
                                <option key={pc._id} value={pc.code}>{pc.code} - {pc.city}</option>
                            ))}
                        </select>
                    </div>
                    {/* Date Range Start */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <CalendarIcon className="w-3 h-3" /> Date From
                        </label>
                        <input 
                            type="date"
                            className="input-field h-10 text-sm"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>
                    {/* Date Range End */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <CalendarIcon className="w-3 h-3" /> Date To
                        </label>
                        <input 
                            type="date"
                            className="input-field h-10 text-sm"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                    {/* Report Type Filter */}
                    <div className="space-y-1.5 lg:col-span-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <PieChartIcon className="w-3 h-3" /> Report Type
                        </label>
                        <select 
                            className="input-field h-10 text-sm"
                            value={filters.reportType}
                            onChange={(e) => handleFilterChange('reportType', e.target.value)}
                        >
                            {(user.role === 'superadmin' || !user.department) && <option value="">All Reports</option>}
                            {(user.role === 'superadmin' || user.department === 'B2B') && <option value="B2B">B2B (Agency)</option>}
                            {(user.role === 'superadmin' || user.department === 'B2C') && <option value="B2C">Home Visit</option>}
                        </select>
                    </div>
                    {/* City/Location */}
                    <div className="space-y-1.5 lg:col-span-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <Search className="w-3 h-3" /> Specific Location/City
                        </label>
                        <input 
                            type="text"
                            placeholder="Enter city or address keywords..."
                            className="input-field h-10 text-sm"
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-l-4 border-l-kanan-navy">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Submission Volume</p>
                            <h3 className="text-3xl font-bold text-slate-900">{summary?.stats.totalVisits}</h3>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg text-kanan-navy">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="card border-l-4 border-l-kanan-blue">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Active Surveyors</p>
                            <h3 className="text-3xl font-bold text-slate-900">{performance.length}</h3>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg text-kanan-blue">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="card border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Pending Processing</p>
                            <h3 className="text-3xl font-bold text-slate-900">{summary?.stats.pendingReview}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Search className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Map Section */}
            <div className="card">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-kanan-blue" />
                    Visit Activity Map
                </h3>
                <ActivityMap visits={userVisits.length > 0 ? userVisits : performance.flatMap(p => p.recentVisits || [])} />
                <p className="mt-4 text-xs text-slate-400 italic">
                    * Showing locations for visits with active GPS tracking.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="card">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-kanan-blue" />
                        Visit Status Distribution
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="card">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                        Top Performing Surveyors (Visits)
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performance.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} width={100} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="visitsCount" fill="#2E75B6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="card p-0 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-slate-800">Surveyor Performance Ranking</h3>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search surveyor..." 
                            className="input-field pl-10 h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                <th className="px-6 py-4">Surveyor Name</th>
                                <th className="px-6 py-4 text-center">Employee ID</th>
                                <th className="px-6 py-4 text-center">Total Visits</th>
                                <th className="px-6 py-4 text-center shrink-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPerformance.map((item, index) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-kanan-navy">
                                                {index + 1}
                                            </div>
                                            <span className="font-bold text-slate-800">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500 font-mono">{item.employeeId}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 bg-kanan-light text-kanan-blue rounded-full font-bold text-xs ring-1 ring-kanan-blue/10">
                                            {item.visitsCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => fetchUserSpecificData(item._id)}
                                            className="px-3 py-1.5 bg-kanan-blue/5 text-kanan-blue rounded-lg font-bold text-xs hover:bg-kanan-blue/10 transition-all"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-kanan-blue/10 text-kanan-blue flex items-center justify-center font-bold text-lg">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                                    <p className="text-sm text-slate-500">Employee ID: {selectedUser.employeeId}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Contributions</p>
                                    <p className="text-2xl font-bold text-slate-900">{selectedUser.visitsCount} Visits</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl">
                                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Status</p>
                                    <p className="text-2xl font-bold text-emerald-700">Active</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 mb-4">Recent Submissions for this User</h4>
                                {isFetchingUser ? (
                                    <div className="py-8 text-center text-slate-400 italic">Fetching visit history...</div>
                                ) : userVisits.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400">No recent visits found.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {userVisits.slice(0, 5).map(visit => (
                                            <div key={visit._id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-all">
                                                <div>
                                                    <p className="font-bold text-slate-900">{visit.meta.companyName}</p>
                                                    <p className="text-xs text-slate-500">{new Date(visit.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                    visit.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                                    visit.status === 'closed' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {visit.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 text-right">
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
