'use client';

import React from 'react';
import { useReservations } from '../ReservationsContext';

export default function DashboardPage() {
    const { data } = useReservations();
    const { reservations, customers, eventRooms, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const revenue = reservations.reduce((a, r) => a + parseFloat(r.total_price || '0'), 0);
    const confirmed = reservations.filter(r => r.status === 'Confirmed').length;
    const pending = reservations.filter(r => r.status === 'Pending').length;
    const upcoming = reservations.filter(r => new Date(r.date_start) >= new Date()).length;
    const available = eventRooms.filter(r => r.status === 'Available').length;

    const formatCurrency = (val: number) => {
        return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Confirmed' || status === 'Available') cls = 'badge-success';
        if (status === 'Pending') cls = 'badge-warning';
        if (status === 'Cancelled' || status === 'Maintenance' || status === 'Booked') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0,242,254,0.15)' }}>
                        <i className="fa-solid fa-calendar-check" style={{ color: '#00f2fe' }}></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{reservations.length}</div>
                        <div className="stat-label">Total Reservations</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-circle-dot" style={{ marginRight: '4px' }}></i>{confirmed} Confirmed · {pending} Pending</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <i className="fa-solid fa-users" style={{ color: '#10b981' }}></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{customers.length}</div>
                        <div className="stat-label">Registered Customers</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-circle-dot" style={{ marginRight: '4px' }}></i>Synced from DB</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79,172,254,0.15)' }}>
                        <i className="fa-solid fa-door-open" style={{ color: '#4facfe' }}></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{eventRooms.length}</div>
                        <div className="stat-label">Venues</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-circle-dot" style={{ marginRight: '4px' }}></i>{available} Available</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <i className="fa-solid fa-sack-dollar" style={{ color: '#f59e0b' }}></i>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: '20px' }}>{formatCurrency(revenue)}</div>
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-trend positive"><i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{upcoming} upcoming</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Recent Reservations</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Latest bookings from database</p>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan={4}>
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                                                <p>No reservations yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {reservations.slice(0, 6).map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 700 }}>{r.event_name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.customer_name}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(r.date_start)}</td>
                                        <td>{getStatusBadge(r.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Venues</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{available} available now</p>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Venue</th>
                                    <th>Type</th>
                                    <th>Price/Day</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventRooms.length === 0 && (
                                    <tr>
                                        <td colSpan={4}>
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                <i className="fa-solid fa-door-closed" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                                                <p>No venues yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {eventRooms.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 700 }}>{r.name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.type}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(r.price_per_day)}</td>
                                        <td>{getStatusBadge(r.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
