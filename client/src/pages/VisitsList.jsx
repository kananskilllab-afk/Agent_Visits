import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FileText, Search, MapPin, Calendar, Building, Trash2, Edit } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VisitsList = () => {
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [visitToDelete, setVisitToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const urlFormType = searchParams.get('formType');

    const fetchVisits = async () => {
        try {
            // If superadmin/admin specifies a type, filter by it
            const query = urlFormType ? `?formType=${urlFormType}` : '';
            const res = await api.get(`/visits${query}`);
            setVisits(res.data.data);
        } catch (err) {
            console.error('Failed to fetch visits', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisits();
    }, [urlFormType]);

    const handleDeleteVisit = async () => {
        if (!visitToDelete) return;
        
        setIsSubmitting(true);
        try {
            await api.delete(`/visits/${visitToDelete._id}`);
            fetchVisits();
            setVisitToDelete(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete visit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredVisits = visits.filter(visit => 
        visit?.meta?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit?.studentInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit?.agencyProfile?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit?.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{(urlFormType === 'home_visit' || user.department === 'B2C' || user.role === 'home_visit') ? 'Home Visits' : 'Visits'}</h1>
                    <p className="text-slate-500">View and track all your logged {(urlFormType === 'home_visit' || user.department === 'B2C' || user.role === 'home_visit') ? 'Home Visit' : 'Visit'} reports.</p>
                </div>
            </div>

            <div className="card shadow-sm border-slate-200 p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search visits..."
                            className="input-field pl-10 h-11 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading your visits...</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">{(urlFormType === 'home_visit' || user.department === 'B2C' || user.role === 'home_visit') ? 'Home Visit Details' : 'Visit Details'}</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredVisits.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-slate-500">No visits found.</td>
                                        </tr>
                                    ) : (
                                        filteredVisits.map((visit) => (
                                            <tr key={visit._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-kanan-blue/10 text-kanan-blue flex items-center justify-center font-bold shrink-0">
                                                            <Building className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                                {visit?.studentInfo?.name || visit?.meta?.companyName || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">By: {visit?.submittedBy?.name || user.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                        visit.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        visit.status === 'closed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {visit.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-xs truncate" title={visit?.exactLocation || visit?.studentInfo?.address || visit?.location?.address || visit?.agencyProfile?.address}>
                                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <span className="truncate">{visit?.exactLocation || visit?.studentInfo?.address || visit?.location?.address || visit?.agencyProfile?.address || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {new Date(visit.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(user.role === 'superadmin' || user.role === 'admin' || visit.submittedBy?._id === user._id) && (
                                                            <button 
                                                                title="Edit Visit"
                                                                onClick={() => navigate(`/edit-visit/${visit._id}`)}
                                                                className="p-1.5 rounded-lg border border-kanan-blue/20 text-kanan-blue hover:bg-kanan-blue/5 transition-all"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {(user.role === 'superadmin' || visit.submittedBy?._id === user._id) && (
                                                            <button 
                                                                title="Delete Visit"
                                                                onClick={() => setVisitToDelete(visit)}
                                                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredVisits.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No visits found.</div>
                            ) : (
                                filteredVisits.map((visit) => (
                                    <div key={visit._id} className="p-4 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-kanan-blue/10 text-kanan-blue flex items-center justify-center font-bold shrink-0">
                                                    <Building className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{visit?.meta?.companyName || 'Unknown Company'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                                            visit.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
                                                            {visit.status}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(visit.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {(user.role === 'superadmin' || user.role === 'admin' || visit.submittedBy?._id === user._id) && (
                                                    <button 
                                                        onClick={() => navigate(`/edit-visit/${visit._id}`)}
                                                        className="p-2 rounded-lg border border-kanan-blue/10 bg-kanan-blue/5 text-kanan-blue"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(user.role === 'superadmin' || visit.submittedBy?._id === user._id) && (
                                                    <button 
                                                        onClick={() => setVisitToDelete(visit)}
                                                        className="p-2 rounded-lg border border-red-100 bg-red-50 text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                            <span className="leading-relaxed">{visit?.exactLocation || visit?.studentInfo?.address || visit?.agencyProfile?.address || 'No address'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Confirm Delete Modal */}
            {visitToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Visit Form?</h3>
                            <p className="text-slate-500 text-sm">
                                Are you sure you want to permanently delete the visit for <strong className="text-slate-800">{visitToDelete.meta?.companyName || 'this company'}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setVisitToDelete(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteVisit}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete Visit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitsList;
