'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div>
            {/* Hero Section */}
            <header id="home" className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="fade-in-up">Experience Culinary <span className="highlight">Excellence</span></h1>
                    <p className="fade-in-up delay-1">Discover a world of flavors curated for the extraordinary. Fresh ingredients, masterful chefs, and an ambiance you will never forget.</p>
                    <div className="hero-actions fade-in-up delay-2">
                        <Link href="/menu" className="btn btn-outline">Explore Menu</Link>
                        <Link href="/book" className="btn btn-primary">Reserve Now</Link>
                    </div>
                </div>
                <div className="scroll-indicator">
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
            </header>
        </div>
    );
}
