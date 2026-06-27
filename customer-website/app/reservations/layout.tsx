'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './reservations.css';
import { ReservationsProvider, useReservations } from './ReservationsContext';

function ReservationsLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data, refreshData } = useReservations();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { path: '/reservations/dashboard', icon: 'fa-border-all', label: 'Dashboard' },
        { path: '/reservations/customers', icon: 'fa-user-plus', label: 'Customer Registration' },
        { path: '/reservations/inquiry', icon: 'fa-clipboard-question', label: 'Inquiry' },
        { path: '/reservations/booking', icon: 'fa-calendar-plus', label: 'Booking' },
        { path: '/reservations/events', icon: 'fa-champagne-glasses', label: 'Event Management' },
        { path: '/reservations/rooms', icon: 'fa-city', label: 'Venues' },
        { path: '/reservations/hotel-rooms', icon: 'fa-bed', label: 'Hotel Rooms' },
        { path: '/reservations/hotel-bookings', icon: 'fa-address-book', label: 'Hotel Bookings' },
        { path: '/reservations/finance', icon: 'fa-file-invoice-dollar', label: 'Finance' },
        { path: '/reservations/agreement', icon: 'fa-file-contract', label: 'Agreement' }
    ];

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <i className="fa-solid fa-hotel"></i>
                    </div>
                    <div className="logo-text">
                        <h2>{data.settings?.business_name || 'ASCENDIA'}</h2>
                        <p>Reservations</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link 
                            key={item.path}
                            href={item.path} 
                            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <a href="http://localhost:301" target="_blank" className="nav-item">
                        <i className="fa-solid fa-cash-register"></i>
                        <span>Go to POS</span>
                    </a>
                    <a href="#" className="nav-item" style={{ color: '#ef4444' }}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-container">
                {/* Topbar */}
                <header className="topbar">
                    <div className="search-bar">
                        <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', marginRight: '12px' }}></i>
                        <input type="text" placeholder="Search reservations, customers and more..." />
                    </div>
                    <div className="topbar-actions">
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                            {currentTime ? `${currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}  |  ${currentTime.toLocaleTimeString()}` : ''}
                        </div>
                        <button className="notification-btn" onClick={() => refreshData()} title="Refresh Data">
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <div className="user-profile">
                            <img src={`https://ui-avatars.com/api/?name=${data.currentUser?.name}&background=00f2fe&color=000&size=38`} className="avatar" alt="User" />
                            <div className="user-info">
                                <span className="user-name">{data.currentUser?.name}</span>
                                <span className="user-role">{data.currentUser?.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic View Container */}
                <div className="view-container">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReservationsProvider>
            <ReservationsLayoutContent>{children}</ReservationsLayoutContent>
        </ReservationsProvider>
    );
}
