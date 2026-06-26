'use client';

import React from 'react';
import { useReservations } from '../ReservationsContext';

export default function ReportsPage() {
    const { data } = useReservations();
    const { reservations, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';
    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const revenue = reservations.reduce((a, r) => a + parseFloat(r.total_price || 0), 0);
    const byStatus: any = { Confirmed: 0, Pending: 0, Cancelled: 0 };
    reservations.forEach(r => { if (byStatus[r.status] !== undefined) byStatus[r.status]++; });

    const byVenue: any = {};
    reservations.forEach(r => {
        const vn = r.room_name || 'No Venue';
        if (!byVenue[vn]) byVenue[vn] = { count: 0, revenue: 0 };
        byVenue[vn].count++;
        byVenue[vn].revenue += parseFloat(r.total_price || 0);
    });

    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Confirmed') cls = 'badge-success';
        if (status === 'Pending') cls = 'badge-warning';
        if (status === 'Cancelled') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
                        <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                        Reports & Analytics
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Overview of reservation metrics</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0,242,254,0.15)' }}>
                        <i className="fa-solid fa-calendar-check" style={{ color: '#00f2fe' }}></i>
                    </div>
                    <div>
                        <div className="stat-value">{reservations.length}</div>
                        <div className="stat-label">Total Bookings (DB)</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
                    </div>
                    <div>
                        <div className="stat-value">{byStatus.Confirmed}</div>
                        <div className="stat-label">Confirmed</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <i className="fa-solid fa-clock" style={{ color: '#f59e0b' }}></i>
                    </div>
                    <div>
                        <div className="stat-value">{byStatus.Pending}</div>
                        <div className="stat-label">Pending Approval</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <i className="fa-solid fa-sack-dollar" style={{ color: '#f59e0b' }}></i>
                    </div>
                    <div>
                        <div className="stat-value" style={{ fontSize: '18px' }}>{formatCurrency(revenue)}</div>
                        <div className="stat-label">Total Revenue (DB)</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Bookings by Status</h3>
                    {Object.entries(byStatus).map(([s, n]: any) => (
                        <div key={s}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{getStatusBadge(s)}</div>
                                <div style={{ fontWeight: 700 }}>{n}</div>
                            </div>
                            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                                <div style={{ height: '100%', borderRadius: '4px', background: 'var(--primary)', width: `${reservations.length ? Math.round(n / reservations.length * 100) : 0}%`, transition: 'width 0.6s ease' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Revenue by Venue</h3>
                    {Object.keys(byVenue).length === 0 ? (
                        <div className="empty-state">
                            <i className="fa-solid fa-chart-bar"></i>
                            <h3>No Data</h3>
                            <p>Add reservations to see revenue breakdown</p>
                        </div>
                    ) : (
                        Object.entries(byVenue)
                            .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
                            .map(([venue, data]: any) => (
                                <div key={venue} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{venue}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{data.count} booking(s)</div>
                                    </div>
                                    <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(data.revenue)}</div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}
