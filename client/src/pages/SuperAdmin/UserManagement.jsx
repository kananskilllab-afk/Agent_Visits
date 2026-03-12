import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Shield,
    Trash2,
    UserCheck,
    UserX,
    Edit2,
    MoreVertical
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());

            if (editingUser && !data.passwordHash) {
                delete data.passwordHash;
            }

            // Map Department + User role to internal 'home_visit' role if needed
            // To maintain compatibility with existing form/analytics logic
            if (data.role === 'user' && data.department === 'B2C') {
                data.role = 'home_visit';
            }

            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, data);
            } else {
                await api.post('/users', { ...data, isActive: true });
            }
            setShowAddModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleUserStatus = async (user) => {
        try {
            await api.put(`/users/${user._id}`, { isActive: !user.isActive });
            fetchUsers();
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setIsSubmitting(true);
        try {
            await api.delete(`/users/${userToDelete._id}`);
            fetchUsers();
            setUserToDelete(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500">Manage employee accounts and permissions.</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setShowAddModal(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            <div className="card shadow-sm border-slate-200 p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="input-field pl-10 h-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                        Total {filteredUsers.length} users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Employee ID</th>
                                <th className="px-6 py-4">Dept</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic-text-fix">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-kanan-blue/10 text-kanan-blue flex items-center justify-center font-bold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{user?.name || 'Unknown User'}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user?.email || 'No email'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{user?.employeeId || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border ${user.department === 'B2C' || user.role === 'home_visit' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {user.department || (user.role === 'home_visit' ? 'B2C' : 'B2B')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${user.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    user.role === 'home_visit' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.role === 'home_visit' ? 'user' : user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-tight ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-3">
                                            <button
                                                title="Edit"
                                                onClick={() => { setEditingUser(user); setShowAddModal(true); }}
                                                className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                                onClick={() => toggleUserStatus(user)}
                                                className={`p-1.5 rounded-lg border transition-all ${user.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                            >
                                                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                title="Delete"
                                                onClick={() => setUserToDelete(user)}
                                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-800">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                            >
                                <MoreVertical className="w-5 h-5 rotate-90" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                    <input name="name" required className="input-field" placeholder="John Doe" defaultValue={editingUser?.name || ''} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Employee ID</label>
                                    <input name="employeeId" required className="input-field" placeholder="K-1001" defaultValue={editingUser?.employeeId || ''} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                                    <select name="department" required className="input-field" defaultValue={editingUser?.department || (editingUser?.role === 'home_visit' ? 'B2C' : 'B2B')}>
                                        <option value="B2B">B2B</option>
                                        <option value="B2C">B2C</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                                    <select name="role" required className="input-field" defaultValue={editingUser?.role === 'home_visit' ? 'user' : (editingUser?.role || 'user')}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">SuperAdmin</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                                    <input name="email" type="email" required className="input-field" placeholder="john@kanan.co" defaultValue={editingUser?.email || ''} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{editingUser ? 'New Password (optional)' : 'Initial Password'}</label>
                                    <input name="passwordHash" type="password" required={!editingUser} className="input-field" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    className="flex-1 btn-primary h-12 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Saving...' : (editingUser ? 'Update Account' : 'Create Account')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete User?</h3>
                            <p className="text-slate-500 text-sm">
                                Are you sure you want to permanently delete <strong className="text-slate-800">{userToDelete.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
