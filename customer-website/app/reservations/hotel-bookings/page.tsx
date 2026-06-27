'use client';

import React from 'react';

const DUMMY_BOOKINGS = [
    { id: 'HB-7765', customer: 'Madushan', phone: '0765236985', room: '202 - Family', dates: '2026-06-28 to 2026-07-01', status: 'Confirmed', total: 'Rs.105,000' },
    { id: 'HB-9381', customer: 'Chamodi', phone: '0765236985', room: '102 - Deluxe', dates: '2026-07-14 to 2026-07-15', status: 'Pending', total: 'Rs.25,000' },
    { id: 'HB-5322', customer: 'Thilina', phone: '0765236985', room: '101 - Standard', dates: '2026-06-22 to 2026-06-23', status: 'Confirmed', total: 'Rs.15,000' },
    { id: 'HB-7705', customer: 'Hemal', phone: '0765236985', room: '102 - Deluxe', dates: '2026-07-01 to 2026-07-04', status: 'Confirmed', total: 'Rs.75,000' },
    { id: 'HB-6092', customer: 'Yomal', phone: '0765236985', room: '101 - Standard', dates: '2026-06-25 to 2026-06-26', status: 'Confirmed', total: 'Rs.15,000' },
    { id: 'HB-2506', customer: 'Sunimal', phone: '0765236985', room: '202 - Family', dates: '2026-06-13 to 2026-06-14', status: 'Checked Out', total: 'Rs.21,000' },
];

export default function HotelBookingsPage() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hotel Bookings</h2>
                    <button className="btn btn-primary" style={{ borderRadius: '20px', padding: '10px 20px', boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)' }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>New Hotel Booking
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Booking No</th>
                                <th>Customer</th>
                                <th>Room</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th>Total (Rs.)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DUMMY_BOOKINGS.map((b) => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: 700 }}>{b.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{b.customer}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.phone}</div>
                                    </td>
                                    <td>{b.room}</td>
                                    <td>{b.dates}</td>
                                    <td>{b.status}</td>
                                    <td style={{ fontWeight: 700 }}>{b.total}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px', borderRadius: '8px' }}>Edit</button>
                                            <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #10b981', color: '#10b981' }}>
                                                <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '4px' }}></i>Checkout
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
