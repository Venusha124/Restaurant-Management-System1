'use client';

import React, { useState } from 'react';
import { useReservations } from '../ReservationsContext';

export default function BookingPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { eventRooms, inquiries, waitlist, reservations, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const [form, setForm] = useState({
        booking_no: '', inquiry_ref_no: '', event_name: '', room_id: '',
        customer_name: '', customer_phone: '', date_start: '', date_end: '',
        num_guests: '', total_price: '', status: 'Confirmed', notes: ''
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Confirmed') cls = 'badge-success';
        if (status === 'Pending') cls = 'badge-warning';
        if (status === 'Cancelled') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    const checkOverlap = (roomId: string | number, dateStart: string, dateEnd: string, excludeResId: number | null = null) => {
        if (!roomId || !dateStart) return false;
        const start = new Date(dateStart);
        const end = dateEnd ? new Date(dateEnd) : start;
        
        return reservations.some((r: any) => {
            if (String(r.room_id) !== String(roomId)) return false;
            if (r.status !== 'Confirmed') return false;
            if (excludeResId && r.id === excludeResId) return false;
            
            const rStart = new Date(r.date_start);
            const rEnd = r.date_end ? new Date(r.date_end) : rStart;
            
            return start <= rEnd && end >= rStart;
        });
    };

    const submitBooking = async () => {
        if (!form.event_name) return alert('Event Name required');
        if (!form.customer_name) return alert('Customer Name required');
        if (!form.customer_phone) return alert('Customer phone is required');
        if (form.customer_phone && !/^\+?[0-9\s\-\(\)]{7,15}$/.test(form.customer_phone)) return alert('Invalid phone number format');
        if (!form.date_start) return alert('Start Date required');
        if (form.date_end && new Date(form.date_start) > new Date(form.date_end)) return alert('End date cannot be before start date');
        if (form.num_guests && Number(form.num_guests) < 1) return alert('Number of guests must be at least 1');
        if (form.total_price && Number(form.total_price) < 0) return alert('Total price cannot be negative');

        const overlaps = checkOverlap(form.room_id, form.date_start, form.date_end);
        if (overlaps && form.status === 'Confirmed') {
            if (confirm('⚠️ VENUE OVERLAP CONFLICT!\n\nThis room/venue is already booked for the selected dates. Would you like to add the customer to the Waitlist queue instead?')) {
                try {
                    await fetchAPI('/waitlist', {
                        method: 'POST',
                        body: JSON.stringify({
                            room_id: form.room_id,
                            customer_name: form.customer_name,
                            customer_phone: form.customer_phone,
                            date_start: form.date_start,
                            date_end: form.date_end,
                            num_guests: form.num_guests,
                            event_name: form.event_name,
                            notes: form.notes || ''
                        })
                    });
                    await refreshData();
                    alert('Customer added to the Waitlist queue ✓');
                } catch (err: any) {
                    alert('Failed to add to Waitlist: ' + err.message);
                }
            }
            return;
        }

        try {
            await fetchAPI('/reservations', { method: 'POST', body: JSON.stringify(form) });
            setForm({
                booking_no: '', inquiry_ref_no: '', event_name: '', room_id: '',
                customer_name: '', customer_phone: '', date_start: '', date_end: '',
                num_guests: '', total_price: '', status: 'Confirmed', notes: ''
            });
            await refreshData();
        } catch (e: any) { alert('Error saving booking: ' + e.message); }
    };

    const deleteWaitlist = async (id: number) => {
        if (!confirm('Remove from waitlist?')) return;
        try {
            await fetchAPI(`/waitlist/${id}`, { method: 'DELETE' });
            await refreshData();
        } catch (e: any) { alert('Error: ' + e.message); }
    };

    const openEditModal = (r: any) => {
        setEditForm({
            id: r.id,
            booking_no: r.booking_no || '',
            inquiry_ref_no: r.inquiry_ref_no || '',
            event_name: r.event_name || '',
            room_id: r.room_id || '',
            customer_name: r.customer_name || '',
            customer_phone: r.customer_phone || '',
            date_start: r.date_start ? r.date_start.split('T')[0] : '',
            date_end: r.date_end ? r.date_end.split('T')[0] : '',
            num_guests: r.num_guests || '',
            total_price: r.total_price || '',
            status: r.status || 'Pending',
            notes: r.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const updateReservation = async () => {
        if (!editForm.event_name) return alert('Event Name required');
        if (!editForm.customer_name) return alert('Customer Name required');
        if (!editForm.customer_phone) return alert('Customer phone is required');
        if (editForm.customer_phone && !/^\+?[0-9\s\-\(\)]{7,15}$/.test(editForm.customer_phone)) return alert('Invalid phone number format');
        if (!editForm.date_start) return alert('Start Date required');
        if (editForm.date_end && new Date(editForm.date_start) > new Date(editForm.date_end)) return alert('End date cannot be before start date');
        if (editForm.num_guests && Number(editForm.num_guests) < 1) return alert('Number of guests must be at least 1');
        if (editForm.total_price && Number(editForm.total_price) < 0) return alert('Total price cannot be negative');

        const overlaps = checkOverlap(editForm.room_id, editForm.date_start, editForm.date_end, editForm.id);
        if (overlaps && editForm.status === 'Confirmed') {
            alert('⚠️ VENUE OVERLAP CONFLICT!\n\nThis room/venue is already booked for the selected dates. Please change the dates, venue, or status.');
            return;
        }

        try {
            const response = await fetchAPI(`/reservations/${editForm.id}`, { method: 'PUT', body: JSON.stringify(editForm) });
            const data = await response.json();
            setIsEditModalOpen(false);
            await refreshData();
            if (data.promoted) {
                setTimeout(() => {
                    alert(`🎉 WAITLIST PROMOTION:\n\nCustomer "${data.promoted.customer_name}" has been automatically promoted to a Pending booking for Room/Venue!`);
                }, 500);
            }
        } catch (e: any) { alert('Error updating booking: ' + e.message); }
    };

    const deleteReservation = async (id: number) => {
        if (!confirm('Delete this booking?')) return;
        try {
            const response = await fetchAPI(`/reservations/${id}`, { method: 'DELETE' });
            const data = await response.json();
            await refreshData();
            if (data.promoted) {
                setTimeout(() => {
                    alert(`🎉 WAITLIST PROMOTION:\n\nCustomer "${data.promoted.customer_name}" has been automatically promoted to a Pending booking for Room/Venue!`);
                }, 500);
            }
        } catch (e: any) { alert('Error: ' + e.message); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Create Booking Form */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                        <i className="fa-solid fa-calendar-plus" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                        Create Booking
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All entries are saved directly to the database</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                    <div className="form-group"><label>Booking No</label><input type="text" readOnly placeholder="Auto-generated" style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }} /></div>
                    <div className="form-group">
                        <label>Inquiry No (Populate Details)</label>
                        <select value={form.inquiry_ref_no} onChange={e => setForm({ ...form, inquiry_ref_no: e.target.value })}>
                            <option value="">-- Select Inquiry (Optional) --</option>
                            {inquiries.map(inq => <option key={inq.id} value={inq.ref_no}>{inq.ref_no} — {inq.customer_name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label>Event Name *</label><input type="text" value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} placeholder="e.g. Wedding Reception" /></div>
                    <div className="form-group">
                        <label>Venue</label>
                        <select value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                            <option value="">-- No Venue --</option>
                            {eventRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label>Customer Name *</label><input type="text" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Full name" /></div>
                    <div className="form-group"><label>Phone</label><input type="text" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} placeholder="+94 77 ..." /></div>
                    <div className="form-group"><label>From Date *</label><input type="date" value={form.date_start} onChange={e => setForm({ ...form, date_start: e.target.value })} /></div>
                    <div className="form-group"><label>To Date</label><input type="date" value={form.date_end} onChange={e => setForm({ ...form, date_end: e.target.value })} /></div>
                    <div className="form-group"><label>No. of Guests</label><input type="number" value={form.num_guests} onChange={e => setForm({ ...form, num_guests: e.target.value })} /></div>
                    <div className="form-group"><label>Total Price ({currency})</label><input type="number" value={form.total_price} onChange={e => setForm({ ...form, total_price: e.target.value })} /></div>
                    <div className="form-group">
                        <label>Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            <option>Pending</option><option>Confirmed</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Notes</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special requirements..."></textarea>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button className="btn btn-primary" onClick={submitBooking}>
                        <i className="fa-solid fa-database" style={{ marginRight: '8px' }}></i>Save to Database
                    </button>
                    <button className="btn btn-outline" onClick={() => setForm({
                        booking_no: '', inquiry_ref_no: '', event_name: '', room_id: '', customer_name: '', customer_phone: '', date_start: '', date_end: '', num_guests: '', total_price: '', status: 'Confirmed', notes: ''
                    })}>
                        <i className="fa-solid fa-rotate-left" style={{ marginRight: '8px' }}></i>Clear
                    </button>
                </div>
            </div>

            {/* Waitlist Queue */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                        <i className="fa-solid fa-people-line" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                        Customer Waitlist Queue
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{waitlist.length} customers waitlisted</p>
                </div>
                
                {waitlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-users-slash" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                        <h3>Waitlist is empty</h3>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Room / Venue</th><th>Customer</th><th>Phone</th><th>Event Name</th><th>Dates Requested</th><th>Guests</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waitlist.map((w: any) => (
                                    <tr key={w.id}>
                                        <td style={{ fontWeight: 700 }}>{w.room_name || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{w.customer_name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{w.customer_phone || '—'}</td>
                                        <td>{w.event_name}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(w.date_start)} {w.date_end ? `→ ${formatDate(w.date_end)}` : ''}</td>
                                        <td>{w.num_guests || '—'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteWaitlist(w.id)}>
                                                <i className="fa-solid fa-xmark" style={{ marginRight: '5px' }}></i>Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* All Bookings */}
            <div className="card">
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>All Bookings</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{reservations.length} records in database</p>
                </div>
                
                {reservations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                        <h3>No Records Found</h3>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th><th>Customer</th><th>Venue</th><th>Guests</th><th>From</th><th>To</th><th>Value</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(r => (
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
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEditModal(r)}><i className="fa-solid fa-pen"></i></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => deleteReservation(r.id)}><i className="fa-solid fa-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay open" id="reservationModal">
                    <div className="modal-content" style={{ maxWidth: '600px', borderTop: '5px solid var(--primary)', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 242, 254, 0.15)' }}>
                        <button className="modal-close" onClick={() => setIsEditModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                        <h3><i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>Edit Reservation</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                            <div className="form-group"><label>Booking No</label><input type="text" readOnly value={editForm.booking_no} style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }} /></div>
                            <div className="form-group"><label>Inquiry No</label><input type="text" value={editForm.inquiry_ref_no} onChange={e => setEditForm({ ...editForm, inquiry_ref_no: e.target.value })} /></div>
                            <div className="form-group"><label>Event Name</label><input type="text" value={editForm.event_name} onChange={e => setEditForm({ ...editForm, event_name: e.target.value })} /></div>
                            <div className="form-group">
                                <label>Venue / Room</label>
                                <select value={editForm.room_id} onChange={e => setEditForm({ ...editForm, room_id: e.target.value })}>
                                    <option value="">-- No Venue --</option>
                                    {eventRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Customer Name</label><input type="text" value={editForm.customer_name} onChange={e => setEditForm({ ...editForm, customer_name: e.target.value })} /></div>
                            <div className="form-group"><label>Phone Number</label><input type="text" value={editForm.customer_phone} onChange={e => setEditForm({ ...editForm, customer_phone: e.target.value })} /></div>
                            <div className="form-group"><label>Date From</label><input type="date" value={editForm.date_start} onChange={e => setEditForm({ ...editForm, date_start: e.target.value })} /></div>
                            <div className="form-group"><label>Date To</label><input type="date" value={editForm.date_end} onChange={e => setEditForm({ ...editForm, date_end: e.target.value })} /></div>
                            <div className="form-group"><label>Guests</label><input type="number" value={editForm.num_guests} onChange={e => setEditForm({ ...editForm, num_guests: e.target.value })} /></div>
                            <div className="form-group"><label>Total Price</label><input type="number" value={editForm.total_price} onChange={e => setEditForm({ ...editForm, total_price: e.target.value })} /></div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Status</label>
                                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                    <option>Pending</option><option>Confirmed</option><option>Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={updateReservation}>Update Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
