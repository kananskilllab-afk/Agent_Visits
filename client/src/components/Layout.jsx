import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    ChevronRight,
    List
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-kanan-blue text-white shadow-lg shadow-kanan-blue/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {active && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['user', 'admin', 'superadmin', 'home_visit'] },
        ...(isAdmin ? [
            ...(user.role === 'superadmin' || user.department === 'B2B' ? [
                { label: 'Visit History (B2B)', icon: List, path: '/visits?formType=generic', roles: ['admin', 'superadmin'] }
            ] : []),
            ...(user.role === 'superadmin' || user.department === 'B2C' ? [
                { label: 'Home Visit History', icon: List, path: '/visits?formType=home_visit', roles: ['admin', 'superadmin'] }
            ] : []),
        ] : [
            { label: 'New Visit', icon: PlusCircle, path: '/new-visit', roles: ['user', 'home_visit'] },
            { label: 'Visit History', icon: List, path: '/visits', roles: ['user', 'home_visit'] },
        ]),
        { label: 'User Management', icon: Users, path: '/users', roles: ['superadmin'] },
        { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['admin', 'superadmin'] },
        { label: 'Form Builder', icon: Settings, path: '/form-builder', roles: ['superadmin'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center justify-center mb-10 px-2 py-2">
                    <img src="/logo.png" alt="Kanan International" className="h-12 w-auto object-contain" />
                </div>

                <nav className="flex-1 space-y-2">
                    {filteredItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={(location.pathname + location.search) === item.path || (location.pathname === item.path && !location.search)}
                        />
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <Link 
                        to="/profile"
                        className={`flex items-center gap-3 px-2 mb-6 hover:bg-slate-50 p-2 rounded-2xl transition-all group ${location.pathname === '/profile' ? 'bg-slate-50' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-kanan-blue group-hover:bg-white transition-colors ring-1 ring-slate-100">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{user.role}</p>
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Kanan International" className="h-7 w-auto object-contain" />
                </Link>
                <div className="flex items-center gap-3">
                    <Link to="/profile" className="p-2 text-slate-600 bg-slate-50 rounded-full">
                        <UserIcon className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-600"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6">
                    <nav className="space-y-3">
                        {filteredItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                active={(location.pathname + location.search) === item.path || (location.pathname === item.path && !location.search)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        ))}
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-600 font-medium pt-10"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 w-full">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
