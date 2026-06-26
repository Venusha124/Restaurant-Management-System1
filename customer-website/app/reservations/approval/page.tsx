'use client';

import React from 'react';
import { useReservations } from '../ReservationsContext';

export default function ApprovalPage() {
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
            <div className="card">
                <div className="section-header" style={{ marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                            <i className="fa-solid fa-stamp" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                            Sales Head Approval
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{pending.length} reservation(s) awaiting approval in database</p>
                    </div>
                </div>
                
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
                                    <th>Event</th>
                                    <th>Customer</th>
                                    <th>Venue</th>
                                    <th>Guests</th>
                                    <th>Value</th>
                                    <th>Date</th>
                                    <th>Decision</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 700 }}>{r.event_name}</td>
                                        <td>
                                            {r.customer_name}<br/>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.customer_phone || ''}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.room_name || '—'}</td>
                                        <td>{r.num_guests || '—'}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(r.total_price)}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(r.date_start)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-primary btn-sm" onClick={() => updateReservationStatus(r.id, 'Confirmed')}>
                                                    <i className="fa-solid fa-check" style={{ marginRight: '5px' }}></i>Approve & Save
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => updateReservationStatus(r.id, 'Cancelled')}>
                                                    <i className="fa-solid fa-xmark" style={{ marginRight: '5px' }}></i>Reject
                                                </button>
                                            </div>
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
