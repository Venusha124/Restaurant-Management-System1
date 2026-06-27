'use client';

import React from 'react';

export default function HotelRoomsPage() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hotel Rooms</h2>
                    <button className="btn btn-primary" style={{ borderRadius: '20px', padding: '10px 20px', boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)' }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>Add New Room
                    </button>
                </div>

                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-bed" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                    <h3>Hotel Rooms Management</h3>
                    <p>Manage your physical hotel rooms here.</p>
                </div>
            </div>
        </div>
    );
}
