'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function BookPage() {
    const searchParams = useSearchParams();
    const venueQuery = searchParams.get('venue');

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        date_start: '',
        num_guests: '',
        event_name: ''
    });

    const [status, setStatus] = useState({ message: '', type: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (venueQuery) {
            setFormData(prev => ({ ...prev, event_name: `Booking: ${venueQuery}` }));
        }
    }, [venueQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ message: '', type: '' });

        try {
            // Root server.js handles public reservations on port 301
            const response = await fetch('http://localhost:301/api/public/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ message: 'Reservation request submitted successfully! We will contact you soon to confirm.', type: 'success' });
                setFormData({ customer_name: '', customer_phone: '', date_start: '', num_guests: '', event_name: '' });
            } else {
                setStatus({ message: result.error || 'Failed to submit reservation.', type: 'error' });
            }
        } catch (error) {
            setStatus({ message: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <header className="page-header" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
                <div className="page-header-overlay"></div>
                <div className="page-header-content">
                    <h1 className="fade-in-up">Reserve a Table</h1>
                    <p className="fade-in-up delay-1">Secure your spot for an unforgettable evening</p>
                </div>
            </header>

            {/* Reservation Section */}
            <section id="reservations" className="reservation-section" style={{ minHeight: '80vh', padding: '60px 0' }}>
                <div className="section-container">
                    <div className="reservation-grid">
                        <div className="reservation-info">
                            <h4 className="subtitle">BOOK YOUR EXPERIENCE</h4>
                            <h2>Reserve a Table</h2>
                            <p>Secure your spot at Ascendia. Whether it's a romantic dinner or a family gathering, we promise an unforgettable evening.</p>
                            
                            <div className="info-item">
                                <i className="fa-regular fa-clock"></i>
                                <div>
                                    <h4>Opening Hours</h4>
                                    <p>Mon-Sun: 10:00 AM - 11:00 PM</p>
                                </div>
                            </div>
                            
                            <div className="info-item">
                                <i className="fa-solid fa-location-dot"></i>
                                <div>
                                    <h4>Location</h4>
                                    <p>123 Culinary Avenue, Food District</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="reservation-form-container glass-panel">
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" name="customer_name" required placeholder="John Doe" value={formData.customer_name} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="tel" name="customer_phone" required placeholder="+1 234 567 8900" value={formData.customer_phone} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date & Time</label>
                                        <input type="datetime-local" name="date_start" required value={formData.date_start} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Guests</label>
                                        <input type="number" name="num_guests" min="1" max="20" required placeholder="2" value={formData.num_guests} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Event / Occasion (Optional)</label>
                                    <input type="text" name="event_name" placeholder="e.g. Birthday, Anniversary" value={formData.event_name} onChange={handleChange} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Confirm Reservation'}
                                </button>
                            </form>
                            
                            {status.message && (
                                <div className={`status-msg ${status.type}`}>
                                    {status.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
