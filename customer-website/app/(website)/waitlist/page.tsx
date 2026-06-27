'use client';

import React, { useState } from 'react';

export default function WaitlistPage() {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        num_guests: ''
    });

    const [status, setStatus] = useState({ message: '', type: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.customer_phone && !/^\+?[0-9\s\-\(\)]{7,15}$/.test(formData.customer_phone)) {
            setStatus({ message: 'Invalid phone number format.', type: 'error' });
            return;
        }

        setSubmitting(true);
        setStatus({ message: '', type: '' });

        try {
            const response = await fetch('http://localhost:301/api/public/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ message: 'You have successfully joined the waitlist! We will notify you when your table is ready.', type: 'success' });
                setFormData({ customer_name: '', customer_phone: '', num_guests: '' });
            } else {
                setStatus({ message: result.error || 'Failed to join waitlist.', type: 'error' });
            }
        } catch (error) {
            setStatus({ message: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="waitlist-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="section-container" style={{ paddingTop: '80px', width: '100%' }}>
                <div className="waitlist-container glass-panel text-center">
                    <h4 className="subtitle">FULLY BOOKED?</h4>
                    <h2>Join the Virtual Waitlist</h2>
                    <p>Don't miss out on an extraordinary evening. Join our virtual waitlist and we'll notify you the moment a table frees up!</p>
                    <form onSubmit={handleSubmit} className="waitlist-form">
                        <div className="form-row waitlist-row">
                            <div className="form-group">
                                <input type="text" name="customer_name" required placeholder="Your Name" value={formData.customer_name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <input type="tel" name="customer_phone" required placeholder="Phone Number" value={formData.customer_phone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <input type="number" name="num_guests" min="1" max="20" required placeholder="Guests" value={formData.num_guests} onChange={handleChange} />
                            </div>
                            <div className="form-group btn-group">
                                <button type="submit" className="btn btn-primary btn-block" style={{ height: '48px', marginTop: 0 }} disabled={submitting}>
                                    {submitting ? 'Joining...' : 'Join Waitlist'}
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    {status.message && (
                        <div className={`status-msg ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
