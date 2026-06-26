'use client';

import React, { useState } from 'react';
import { useReservations } from '../ReservationsContext';

export default function CalendarPage() {
    const { data } = useReservations();
    const { reservations, eventRooms, maintenanceTasks } = data;

    const [currentCalYear, setCurrentCalYear] = useState(new Date().getFullYear());
    const [currentCalMonth, setCurrentCalMonth] = useState(new Date().getMonth());
    const [calRoomFilter, setCalRoomFilter] = useState('');

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const changeCalMonth = (offset: number) => {
        let m = currentCalMonth + offset;
        let y = currentCalYear;
        if (m < 0) { m = 11; y--; }
        else if (m > 11) { m = 0; y++; }
        setCurrentCalMonth(m);
        setCurrentCalYear(y);
    };

    const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
    const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDay = now.getDate();

    const getRoomStatusForDate = (room: any, dateKey: string) => {
        const resList = reservations.filter(r => 
            r.status !== 'Cancelled' && 
            r.room_id === room.id && 
            dateKey >= r.date_start.split('T')[0] && 
            dateKey <= (r.date_end || r.date_start).split('T')[0]
        );

        if (resList.length === 0) return { status: 'available', reservations: [] };

        const confirmed = resList.find(r => r.status === 'Confirmed');
        if (confirmed) {
            const hasPendingPrep = maintenanceTasks.some(t => t.reservation_id === confirmed.id && t.status === 'Pending');
            return { status: hasPendingPrep ? 'maintenance' : 'booked', reservations: [confirmed] };
        }

        const pending = resList.find(r => r.status === 'Pending');
        if (pending) return { status: 'pending', reservations: [pending] };

        return { status: 'available', reservations: [] };
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === todayDay && currentCalYear === todayYear && currentCalMonth === todayMonth;
        const monthStr = String(currentCalMonth + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateKey = `${currentCalYear}-${monthStr}-${dayStr}`;

        let statusClass = '';
        let cellContent = null;
        let tooltipContent = null;

        if (calRoomFilter !== '') {
            const selectedRoom = eventRooms.find(rm => rm.id === parseInt(calRoomFilter));
            if (selectedRoom) {
                const res = getRoomStatusForDate(selectedRoom, dateKey);
                statusClass = `status-${res.status}`;
                
                if (res.status !== 'available') {
                    tooltipContent = (
                        <div className="cal-tooltip">
                            <div className="cal-tooltip-title">
                                <span>{res.status === 'maintenance' ? 'Maintenance Prep' : 'Booking Details'}</span>
                                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 'normal' }}>{selectedRoom.name}</span>
                            </div>
                            {res.reservations.map(r => (
                                <React.Fragment key={r.id}>
                                    <div className="cal-tooltip-detail"><strong>Event:</strong> {r.event_name}</div>
                                    <div className="cal-tooltip-detail"><strong>Client:</strong> {r.customer_name}</div>
                                    <div className="cal-tooltip-detail"><strong>Phone:</strong> {r.customer_phone || '—'}</div>
                                    <div className="cal-tooltip-detail"><strong>Status:</strong> {r.status} {res.status === 'maintenance' ? '(Prep Pending)' : ''}</div>
                                    <div className="cal-tooltip-detail"><strong>Guests:</strong> {r.num_guests || '—'}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    );
                }
            }
        } else {
            const roomStatuses = eventRooms.map(room => ({
                room,
                res: getRoomStatusForDate(room, dateKey)
            }));
            
            const occupiedRooms = roomStatuses.filter(rs => rs.res.status !== 'available');
            
            cellContent = (
                <div className="cal-dots-container">
                    {roomStatuses.map(rs => (
                        <div key={rs.room.id} className={`cal-dot ${rs.res.status}`} title={`${rs.room.name}: ${rs.res.status}`}></div>
                    ))}
                </div>
            );
            
            if (occupiedRooms.length > 0) {
                tooltipContent = (
                    <div className="cal-tooltip">
                        <div className="cal-tooltip-title">Venue Occupancy</div>
                        {occupiedRooms.map(rs => (
                            <div key={rs.room.id} style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '11px', marginBottom: '2px' }}>
                                    {rs.room.name} ({rs.res.status.toUpperCase()})
                                </div>
                                {rs.res.reservations.map(r => (
                                    <React.Fragment key={r.id}>
                                        <div className="cal-tooltip-detail"><strong>Event:</strong> {r.event_name}</div>
                                        <div className="cal-tooltip-detail"><strong>Client:</strong> {r.customer_name}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            }
        }

        cells.push(
            <div key={d} className={`cal-cell ${isToday ? 'today' : ''} ${statusClass}`}>
                <div style={{ zIndex: 2 }}>{d}</div>
                {cellContent}
                {tooltipContent}
            </div>
        );
    }

    const thisMonthRes = reservations.filter(r => {
        const d = new Date(r.date_start);
        const matchesDate = d.getFullYear() === currentCalYear && d.getMonth() === currentCalMonth;
        const matchesRoom = calRoomFilter === '' || r.room_id === parseInt(calRoomFilter);
        return matchesDate && matchesRoom;
    });

    const formatCurrency = (val: number) => `Rs.${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';
    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Confirmed') cls = 'badge-success';
        if (status === 'Pending') cls = 'badge-warning';
        if (status === 'Cancelled') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => changeCalMonth(-1)} style={{ padding: '6px 10px' }}>
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <h3 style={{ margin: 0, minWidth: '140px', textAlign: 'center', fontSize: '16px' }}>{monthNames[currentCalMonth]} {currentCalYear}</h3>
                            <button className="btn btn-outline btn-sm" onClick={() => changeCalMonth(1)} style={{ padding: '6px 10px' }}>
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, width: '150px' }}>
                            <select value={calRoomFilter} onChange={e => setCalRoomFilter(e.target.value)} style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '8px', border: '1px solid var(--glass-border)', width: '100%' }}>
                                <option value="">-- All Venues --</option>
                                {eventRooms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="cal-grid" style={{ marginBottom: '8px' }}>
                        {dayNames.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
                    </div>
                    <div className="cal-grid" style={{ marginTop: 0 }}>{cells}</div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981' }}></div> Available
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}></div> Booked
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b' }}></div> Pending
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(249, 115, 22, 0.2)', border: '1px solid #f97316' }}></div> Buffer Prep
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="section-header">
                        <div>
                            <h2>Bookings & Statuses</h2>
                            <p>{thisMonthRes.length} item(s) found for selected filter</p>
                        </div>
                    </div>
                    {thisMonthRes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                            <h3>No Records Found</h3>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Event</th><th>Customer</th><th>Venue</th><th>Guests</th><th>From</th><th>To</th><th>Value</th><th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {thisMonthRes.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>{r.booking_no || `BKG-${String(r.id).padStart(4,'0')}`}</div>
                                                <div style={{ fontWeight: 700 }}>{r.event_name}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{r.customer_name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.customer_phone}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{r.room_name || '—'}</td>
                                            <td>{r.num_guests || '—'}</td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(r.date_start)}</td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(r.date_end)}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(r.total_price)}</td>
                                            <td>{getStatusBadge(r.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
