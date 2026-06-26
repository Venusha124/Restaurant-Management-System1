'use client';

import React, { useState } from 'react';
import { useReservations } from '../ReservationsContext';

export default function RoomsPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { eventRooms, maintenanceTasks, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({
        id: null,
        name: '', capacity: '', price_per_day: '', type: 'Banquet', status: 'Available'
    });

    const icons: any = { Banquet: 'fa-champagne-glasses', Meeting: 'fa-briefcase', Outdoor: 'fa-tree', Conference: 'fa-people-group' };

    const tasksByRoom: any = {};
    (maintenanceTasks || []).forEach((t: any) => {
        if (!tasksByRoom[t.room_id]) tasksByRoom[t.room_id] = [];
        tasksByRoom[t.room_id].push(t);
    });

    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Available') cls = 'badge-success';
        if (status === 'Maintenance') cls = 'badge-warning';
        if (status === 'Booked') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    const openModal = (room?: any) => {
        if (room) {
            setFormData({
                id: room.id,
                name: room.name || '',
                capacity: room.capacity || '',
                price_per_day: room.price_per_day || '',
                type: room.type || 'Banquet',
                status: room.status || 'Available'
            });
        } else {
            setFormData({ id: null, name: '', capacity: '', price_per_day: '', type: 'Banquet', status: 'Available' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const submitRoom = async () => {
        if (!formData.name) return alert('Venue name is required');
        try {
            if (formData.id) {
                await fetchAPI(`/event-rooms/${formData.id}`, { method: 'PUT', body: JSON.stringify(formData) });
            } else {
                await fetchAPI('/event-rooms', { method: 'POST', body: JSON.stringify(formData) });
            }
            closeModal();
            await refreshData();
        } catch (e: any) { alert('Failed to save venue: ' + e.message); }
    };

    const deleteRoom = async (id: number) => {
        if (!confirm('Delete this venue? This will affect any bookings tied to it.')) return;
        try {
            await fetchAPI(`/event-rooms/${id}`, { method: 'DELETE' });
            await refreshData();
        } catch (e: any) { alert('Error deleting: ' + e.message); }
    };

    const toggleMaintenanceTask = async (id: number, isChecked: boolean) => {
        const status = isChecked ? 'Completed' : 'Pending';
        try {
            await fetchAPI(`/maintenance-tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            await refreshData();
        } catch (e: any) { alert('Failed to update task: ' + e.message); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
                        <i className="fa-solid fa-door-open" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                        Room Reservation
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{eventRooms.length} venues in database</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>Add Venue
                </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                <div>
                    {eventRooms.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <i className="fa-solid fa-door-closed"></i>
                                <h3>No Venues in Database</h3>
                                <p>Add your first venue to get started</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rooms-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                            {eventRooms.map(r => (
                                <div key={r.id} className="room-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px' }}>
                                    <div className="room-icon" style={{ width: '48px', height: '48px', background: 'rgba(0,242,254,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--primary)', marginBottom: '16px' }}>
                                        <i className={`fa-solid ${icons[r.type] || 'fa-building'}`}></i>
                                    </div>
                                    <div className="room-name" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{r.name}</div>
                                    <div className="room-price" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>
                                        {formatCurrency(r.price_per_day)} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>/ day</span>
                                    </div>
                                    <div className="room-meta" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-main)', marginBottom: '16px' }}>
                                        <span><i className="fa-solid fa-users" style={{ color: 'var(--primary)', marginRight: '5px', width: '16px' }}></i>{r.capacity} guests</span>
                                        <span><i className="fa-solid fa-tag" style={{ color: 'var(--primary)', marginRight: '5px', width: '16px' }}></i>{r.type}</span>
                                    </div>
                                    <div style={{ marginTop: '12px', marginBottom: '16px' }}>{getStatusBadge(r.status)}</div>
                                    <div className="room-actions" style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(r)} style={{ flex: 1, justifyContent: 'center' }}><i className="fa-solid fa-pen"></i></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteRoom(r.id)} style={{ flex: 1, justifyContent: 'center' }}><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Checklist Side Card */}
                <div className="card">
                    <h3 style={{ marginBottom: '12px' }}><i className="fa-solid fa-screwdriver-wrench" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>Venue Setup & Cleaning</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>Manage setup buffers and cleaning checklists before venues go back to Available.</p>
                    
                    {eventRooms.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No venues registered yet.</div>
                    ) : (
                        eventRooms.map(room => {
                            const roomTasks = tasksByRoom[room.id] || [];
                            const completed = roomTasks.filter((t: any) => t.status === 'Completed');
                            
                            return (
                                <div key={room.id} style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong style={{ fontSize: '13px', color: 'var(--text-bright)' }}>{room.name}</strong>
                                        <span style={{ fontSize: '11px', background: 'rgba(0,242,254,0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '8px', fontWeight: 600 }}>
                                            {completed.length}/{roomTasks.length} Done
                                        </span>
                                    </div>
                                    {roomTasks.length === 0 ? (
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>No active setup or cleaning tasks.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                            {roomTasks.map((task: any) => {
                                                const isChecked = task.status === 'Completed';
                                                return (
                                                    <label key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', userSelect: 'none', lineHeight: 1.3 }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isChecked} 
                                                            onChange={e => toggleMaintenanceTask(task.id, e.target.checked)}
                                                            style={{ width: '14px', height: '14px', marginTop: '1px', cursor: 'pointer' }}
                                                        />
                                                        <span style={{ textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-muted)' : 'inherit' }}>{task.task_name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay open" id="roomModal">
                    <div className="modal-content" style={{ borderTop: '5px solid var(--primary)', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 242, 254, 0.15)' }}>
                        <button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
                        <h3><i className="fa-solid fa-door-open" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>{formData.id ? 'Edit Venue / Room' : 'Add Venue / Room'}</h3>
                        <div className="form-group">
                            <label>Venue Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Grand Ballroom" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                            <div className="form-group">
                                <label>Capacity (Guests)</label>
                                <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="200" />
                            </div>
                            <div className="form-group">
                                <label>Price Per Day ({currency})</label>
                                <input type="number" value={formData.price_per_day} onChange={e => setFormData({ ...formData, price_per_day: e.target.value })} placeholder="50000" />
                            </div>
                            <div className="form-group">
                                <label>Venue Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="Banquet">Banquet</option><option value="Meeting">Meeting Room</option><option value="Outdoor">Outdoor</option><option value="Conference">Conference</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Available">Available</option><option value="Booked">Booked</option><option value="Maintenance">Maintenance</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitRoom}>
                                <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>{formData.id ? 'Save Changes' : 'Add Venue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
