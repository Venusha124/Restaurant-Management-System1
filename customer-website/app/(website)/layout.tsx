'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './website.css';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        
        const savedTheme = localStorage.getItem('ascendia_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            setIsLightMode(true);
        }
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        if (isLightMode) {
            document.body.classList.remove('light-mode');
            localStorage.setItem('ascendia_theme', 'dark');
            setIsLightMode(false);
        } else {
            document.body.classList.add('light-mode');
            localStorage.setItem('ascendia_theme', 'light');
            setIsLightMode(true);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="logo">
                        <i className="fa-solid fa-bowl-food"></i> ASCENDIA
                    </div>
                    <ul className="nav-links">
                        <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link></li>
                        <li><Link href="/menu" className={pathname === '/menu' ? 'active' : ''}>Our Menu</Link></li>
                        <li><Link href="/venues" className={pathname === '/venues' ? 'active' : ''}>Venues</Link></li>
                        <li><Link href="/book" className={pathname === '/book' ? 'active' : ''}>Reservations</Link></li>
                        <li><Link href="/waitlist" className={pathname === '/waitlist' ? 'active' : ''}>Waitlist</Link></li>
                    </ul>
                    <div className="nav-actions">
                        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Mode">
                            <i className={isLightMode ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
                        </button>
                        <Link href="/book" className="btn btn-primary">Book a Table</Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flexGrow: 1 }}>
                {children}
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <h3>ASCENDIA</h3>
                        <p>Elevating the art of dining.</p>
                    </div>
                    <div className="footer-links">
                        <Link href="/pos/dashboard" className="staff-link"><i className="fa-solid fa-cash-register"></i> Staff POS</Link>
                        <Link href="/reservations/dashboard" className="staff-link"><i className="fa-solid fa-book-open"></i> Staff Reservations</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Ascendia Restaurant. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
