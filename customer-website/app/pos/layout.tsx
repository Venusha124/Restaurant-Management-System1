'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PosProvider } from './PosContext';
import './pos.css';

export default function PosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname.startsWith(`/pos/${path}`);
    const isLogin = pathname === '/pos/login';

    return (
        <PosProvider>
            <div className="app-container">
            {/* Sidebar Navigation */}
            {!isLogin && (
            <aside className="sidebar" id="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <i className="fa-solid fa-bowl-food"></i>
                    </div>
                    <div className="logo-text">
                        <h2>TASTY OF</h2>
                        <p>ASCENDIA</p>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <Link href="/pos/dashboard" className={`nav-item ${isActive('dashboard') ? 'active' : ''}`}>
                        <i className="fa-solid fa-border-all"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/pos/order-line" className={`nav-item ${isActive('order-line') ? 'active' : ''}`}>
                        <i className="fa-solid fa-receipt"></i>
                        <span>Order Line</span>
                    </Link>
                    <Link href="/pos/history" className={`nav-item ${isActive('history') ? 'active' : ''}`}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        <span>Order History</span>
                    </Link>
                    <Link href="/pos/tables" className={`nav-item ${isActive('tables') ? 'active' : ''}`}>
                        <i className="fa-solid fa-chair"></i>
                        <span>Manage Table</span>
                    </Link>
                    <Link href="/pos/dishes" className={`nav-item ${isActive('dishes') ? 'active' : ''}`}>
                        <i className="fa-solid fa-utensils"></i>
                        <span>Manage Dishes</span>
                    </Link>
                    <Link href="/pos/serving" className={`nav-item ${isActive('serving') ? 'active' : ''}`}>
                        <i className="fa-solid fa-bell-concierge"></i>
                        <span>Ready to Serve</span>
                    </Link>
                    <Link href="/pos/customers" className={`nav-item ${isActive('customers') ? 'active' : ''}`}>
                        <i className="fa-solid fa-users"></i>
                        <span>Customers</span>
                    </Link>
                    <Link href="/pos/users" className={`nav-item ${isActive('users') ? 'active' : ''}`}>
                        <i className="fa-solid fa-user-shield"></i>
                        <span>Staff & Users</span>
                    </Link>
                    <Link href="/pos/kitchen" className={`nav-item ${isActive('kitchen') ? 'active' : ''}`}>
                        <i className="fa-solid fa-fire-burner"></i>
                        <span>Kitchen Display</span>
                    </Link>
                    <Link href="/pos/settings" className={`nav-item ${isActive('settings') ? 'active' : ''}`}>
                        <i className="fa-solid fa-gear"></i>
                        <span>Settings</span>
                    </Link>
                    <Link href="/pos/help" className={`nav-item ${isActive('help') ? 'active' : ''}`}>
                        <i className="fa-regular fa-circle-question"></i>
                        <span>Help Center</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <a href="/" className="nav-item logout">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </aside>
            )}

            {/* Main Content Area */}
            <main className="main-container">
                {/* Topbar */}
                {!isLogin && (
                <header className="topbar">
                    <div className="search-bar">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search menu, orders and more" />
                    </div>
                    
                    <div className="topbar-actions">
                        <div id="onlineStatus">
                            <span className="badge online">Online</span>
                        </div>
                        <button className="notification-btn">
                            <i className="fa-regular fa-bell"></i>
                            <span className="badge">0</span>
                        </button>
                        <div className="user-profile">
                            <img src="https://ui-avatars.com/api/?name=Admin+User&background=00BFA5&color=fff" alt="User Profile" className="avatar" />
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>
                )}

                {/* Dynamic View Container */}
                <div id="app-view" className="view-container">
                    {children}
                </div>
            </main>
        </div>
        </PosProvider>
    );
}
