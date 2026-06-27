'use client';

import React from 'react';
import { useReservations } from '../ReservationsContext';

export default function FinancePage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { reservations, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const pending = reservations.filter(r => r.status === 'Pending');

    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

    const updateReservationStatus = async (id: number, status: string) => {
        try {
            await fetchAPI(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            await refreshData();
        } catch (e: any) {
            alert('Failed to update: ' + e.message);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Top floating approval card example */}
            <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '16px' }}>
                <div style={{ color: 'var(--text-muted)' }}>—</div>
                <div style={{ fontWeight: 700 }}>Test</div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Test</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+94753733016</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>09 Jun 2026 to 11 Jun 2026</div>
                <div style={{ color: 'var(--primary)', fontWeight: 700 }}>Rs.0</div>
                <button className="btn btn-primary btn-sm" style={{ borderRadius: '20px', padding: '8px 24px', boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)' }}>
                    <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>Approve
                </button>
            </div>

            <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Hotel Bookings Pending Approval</h3>

                {pending.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '56px', marginBottom: '16px' }}></i>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>All Clear!</h3>
                        <p>No pending approvals at this time.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>BOOKING #</th>
                                    <th>CUSTOMER</th>
                                    <th>ROOM</th>
                                    <th>CHECK-OUT</th>
                                    <th>TOTAL PRICE</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.booking_no || `HB-${String(r.id).padStart(4,'0')}`}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#fff' }}>{r.customer_name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.customer_phone || ''}</div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{r.room_name || 'Room 101'}</td>
                                        <td style={{ fontSize: '13px', fontWeight: 600 }}>{formatDate(r.date_end || r.date_start)}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(r.total_price)}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm" 
                                                onClick={() => updateReservationStatus(r.id, 'Confirmed')}
                                                style={{ borderRadius: '20px', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                <i className="fa-solid fa-check" style={{ marginRight: '5px' }}></i>Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
