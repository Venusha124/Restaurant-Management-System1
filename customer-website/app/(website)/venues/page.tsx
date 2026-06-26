'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VenuesPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                // Fetch from the reservation backend (port 302)
                const res = await fetch('http://localhost:302/api/event-rooms');
                const data = await res.json();
                setRooms(data);
            } catch (error) {
                console.error('Error fetching venues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    const bookVenue = (roomName: string) => {
        // Simple client-side routing with query param
        router.push(`/book?venue=${encodeURIComponent(roomName)}`);
    };

    return (
        <div className="venues-section" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Page Header */}
            <header className="page-header" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
                <div className="page-header-overlay"></div>
                <div className="page-header-content">
                    <h1 className="fade-in-up">Event Venues</h1>
                    <p className="fade-in-up delay-1">Perfect spaces for your unforgettable moments.</p>
                </div>
            </header>

            {/* Venues Grid */}
            <section className="section-container" style={{ paddingTop: '40px' }}>
                <div className="section-header text-center fade-in-up">
                    <h5 className="subtitle">Spaces</h5>
                    <h2>Host with Elegance</h2>
                    <p>From intimate gatherings to grand celebrations, discover our versatile dining spaces designed to elevate any occasion.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading venues...</div>
                ) : (
                    <div className="venues-grid" id="venuesGrid">
                        {rooms.length === 0 ? (
                            <p style={{ textAlign: 'center', width: '100%' }}>No event rooms are currently available.</p>
                        ) : (
                            rooms.map((room, index) => (
                                <div key={room.id} className={`venue-card fade-in-up delay-${(index % 3) + 1}`}>
                                    <img 
                                        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                        alt={room.name} 
                                        className="venue-img" 
                                    />
                                    <div className="venue-content">
                                        <div className="venue-header">
                                            <h3 className="venue-title">{room.name}</h3>
                                            <span className="venue-price">${room.price_per_day}/day</span>
                                        </div>
                                        <div className="venue-capacity">
                                            <i className="fa-solid fa-users"></i> Up to {room.capacity} guests
                                        </div>
                                        <button className="btn btn-outline btn-block" onClick={() => bookVenue(room.name)}>Book Venue</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
