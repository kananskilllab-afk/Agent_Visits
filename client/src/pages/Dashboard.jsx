import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    MapPin,
    Calendar
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card flex items-center gap-4">
        <div 
            className="p-3 rounded-xl bg-opacity-10 text-opacity-100"
            style={{ backgroundColor: `${color}1A`, color: color }}
        >
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, visitsRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/visits?limit=5')
                ]);
                setStats(statsRes.data.data);
                setVisits(visitsRes.data.data);
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
        </div>
    </div>;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
                    <p className="text-slate-500">Here's a summary of the agent visit survey status.</p>
                </div>
                <div className="flex gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={(user.role === 'user' || user.role === 'home_visit') ? "My Total Visits" : "Total Visits"}
                    value={stats?.stats?.totalVisits || 0}
                    icon={FileText}
                    color="#1A3C6E"
                />
                <StatCard
                    title="Pending Review"
                    value={stats?.stats?.pendingReview || 0}
                    icon={Clock}
                    color="#F59E0B"
                />
                <StatCard
                    title="Action Required"
                    value={stats?.stats?.actionRequired || 0}
                    icon={AlertCircle}
                    color="#EF4444"
                />
                <StatCard
                    title={(user.role === 'user' || user.role === 'home_visit') ? "Drafts" : "Active Users"}
                    value={(user.role === 'user' || user.role === 'home_visit') ? (stats?.statusDist?.find(s => s._id === 'draft')?.count || 0) : (stats?.stats?.activeUsers || 0)}
                    icon={(user.role === 'user' || user.role === 'home_visit') ? FileText : CheckCircle2}
                    color={(user.role === 'user' || user.role === 'home_visit') ? "#64748B" : "#10B981"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-kanan-blue" />
                                Visit Trends
                            </h3>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.trends || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#1A3C6E" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Visits */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-800">Recent Submissions</h3>
                    <div className="space-y-4">
                        {(visits || []).map((visit) => (
                            <div 
                                key={visit._id} 
                                onClick={() => navigate(`/edit-visit/${visit._id}`)}
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-kanan-blue transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 group-hover:text-kanan-blue transition-colors truncate">
                                        {visit.meta?.companyName || visit.studentInfo?.name || 'Untitled Report'}
                                    </h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                            visit.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                                            visit.status === 'closed' ? 'bg-green-100 text-green-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {visit.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {(visit.studentInfo?.address || visit.agencyProfile?.address || 'No address provided')?.substring(0, 30)}...
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Sub. on {new Date(visit.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => navigate('/visits')}
                            className="w-full py-3 text-sm font-semibold text-kanan-blue bg-kanan-blue/5 rounded-xl hover:bg-kanan-blue/10 transition-all"
                        >
                            View All History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
