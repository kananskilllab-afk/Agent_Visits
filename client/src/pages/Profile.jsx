import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    User as UserIcon, 
    Mail, 
    Shield, 
    Building2, 
    Globe, 
    Lock, 
    Eye, 
    EyeOff, 
    Save, 
    UserCircle,
    BadgeCheck
} from 'lucide-react';

const Profile = () => {
    const { user, checkUserLoggedIn } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setIsChangingPassword(false);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-kanan-blue/10 flex items-center justify-center text-kanan-blue ring-4 ring-white shadow-xl">
                            <UserIcon className="w-12 h-12" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-slate-100 text-kanan-blue">
                            <BadgeCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                        <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <Shield className="w-4 h-4" />
                            {user.role.toUpperCase().replace('_', ' ')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card space-y-6">
                        <h3 className="font-bold text-slate-800 border-b pb-4">Personal Information</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <UserCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee ID</p>
                                    <p className="text-sm font-semibold text-slate-700">{user.employeeId}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</p>
                                    <span className="inline-flex px-2 py-0.5 mt-0.5 rounded-full bg-kanan-blue/5 text-kanan-blue text-[10px] font-bold border border-kanan-blue/10">
                                        {user.department || 'Not Assigned'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Region</p>
                                    <p className="text-sm font-semibold text-slate-700">{user.region || 'All Regions'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Security Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-amber-500" />
                                Account Security
                            </h3>
                            {!isChangingPassword && (
                                <button 
                                    onClick={() => {
                                        setIsChangingPassword(true);
                                        setMessage({ type: '', text: '' });
                                    }}
                                    className="text-sm font-bold text-kanan-blue hover:underline"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        {!isChangingPassword ? (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <p className="text-slate-500 text-sm italic">
                                    Your password provides access to the Agent Visit Survey portal. Ensure it is strong and kept confidential.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-5 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-full">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.current ? "text" : "password"}
                                                required
                                                className="input-field pr-12 bg-white"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                className="input-field pr-12 bg-white"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPasswords.confirm ? "text" : "password"}
                                                required
                                                className="input-field pr-12 bg-white"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="btn-primary flex items-center gap-2 px-8 h-11"
                                    >
                                        {isLoading ? 'Updating...' : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsChangingPassword(false)}
                                        className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="card bg-red-50 border-red-100 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-red-800">Account Session</h4>
                            <p className="text-sm text-red-600/70">Securely sign out from this device.</p>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/login'} // Logout is handled via navbar but useful here too
                            className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-200"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
