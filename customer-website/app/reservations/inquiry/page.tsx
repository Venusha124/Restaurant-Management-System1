'use client';

import React, { useState } from 'react';
import { useReservations } from '../ReservationsContext';

export default function InquiryPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { inquiries, eventRooms, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentInquiry, setCurrentInquiry] = useState<any>(null);
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({
        id: null,
        customer_name: '', customer_phone: '', customer_email: '', source: 'Walk-in', assigned_to: '',
        event_type: 'Wedding', room_id: '', preferred_date: '', num_guests: '', budget: '', follow_up_date: '', flexible_date: false,
        requirements: '', notes: ''
    });

    const statusCounts = { All: inquiries.length, New: 0, 'In Progress': 0, Quoted: 0, Converted: 0, Rejected: 0 } as any;
    inquiries.forEach(i => { if (statusCounts[i.status] !== undefined) statusCounts[i.status]++; });

    const filtered = filter === 'All' ? inquiries : inquiries.filter(i => i.status === filter);
    const converted = statusCounts.Converted;
    const convRate = inquiries.length ? Math.round((converted / inquiries.length) * 100) : 0;
    const overdue = inquiries.filter(i => i.follow_up_date && new Date(i.follow_up_date) < new Date() && i.status !== 'Converted' && i.status !== 'Rejected').length;

    const sourceIcons: any = { 'Walk-in': 'fa-person-walking', 'Phone Call': 'fa-phone', 'Email': 'fa-envelope', 'Social Media': 'fa-hashtag', 'Website': 'fa-globe', 'Referral': 'fa-people-arrows' };

    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Converted') cls = 'badge-success';
        if (status === 'In Progress' || status === 'Quoted') cls = 'badge-warning';
        if (status === 'Rejected') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    const openModal = (inq?: any) => {
        setStep(1);
        if (inq) {
            setFormData({
                id: inq.id,
                customer_name: inq.customer_name || '', customer_phone: inq.customer_phone || '', customer_email: inq.customer_email || '',
                source: inq.source || 'Walk-in', assigned_to: inq.assigned_to || '',
                event_type: inq.event_type || 'Wedding', room_id: inq.room_id || '',
                preferred_date: inq.preferred_date ? inq.preferred_date.split('T')[0] : '',
                num_guests: inq.num_guests || '', budget: inq.budget || '',
                follow_up_date: inq.follow_up_date ? inq.follow_up_date.split('T')[0] : '',
                flexible_date: inq.flexible_date ? true : false,
                requirements: inq.requirements || '', notes: inq.notes || ''
            });
        } else {
            setFormData({
                id: null,
                customer_name: '', customer_phone: '', customer_email: '', source: 'Walk-in', assigned_to: '',
                event_type: 'Wedding', room_id: '', preferred_date: '', num_guests: '', budget: '', follow_up_date: '', flexible_date: false,
                requirements: '', notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const submitInquiry = async () => {
        if (!formData.customer_name) return alert('Customer name is required');
        
        try {
            if (formData.id) {
                await fetchAPI(`/inquiries/${formData.id}`, { method: 'PUT', body: JSON.stringify(formData) });
            } else {
                await fetchAPI('/inquiries', { method: 'POST', body: JSON.stringify(formData) });
            }
            closeModal();
            await refreshData();
        } catch (e: any) {
            alert('Database error: ' + e.message);
        }
    };

    const deleteInquiry = async (id: number) => {
        if (!confirm('Delete this inquiry?')) return;
        try {
            await fetchAPI(`/inquiries/${id}`, { method: 'DELETE' });
            await refreshData();
        } catch (e: any) { alert('Failed to delete: ' + e.message); }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await fetchAPI(`/inquiries/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            await refreshData();
        } catch (e: any) { alert('Failed to update: ' + e.message); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Stats Row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div className="stat-icon" style={{ background: 'rgba(0,242,254,0.15)' }}><i className="fa-solid fa-clipboard-list" style={{ color: '#00f2fe' }}></i></div>
                    <div><div className="stat-value">{inquiries.length}</div><div className="stat-label">Total Inquiries</div></div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div className="stat-icon" style={{ background: 'rgba(0,242,254,0.1)' }}><i className="fa-solid fa-envelope-open" style={{ color: '#00f2fe' }}></i></div>
                    <div><div className="stat-value">{statusCounts.New}</div><div className="stat-label">New</div></div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><i className="fa-solid fa-spinner" style={{ color: '#f59e0b' }}></i></div>
                    <div><div className="stat-value">{statusCounts['In Progress']}</div><div className="stat-label">In Progress</div></div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><i className="fa-solid fa-arrow-right-arrow-left" style={{ color: '#10b981' }}></i></div>
                    <div><div className="stat-value">{converted}</div><div className="stat-label">Converted</div>
                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '4px' }}>
                            <div style={{ width: `${convRate}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '3px' }}>{convRate}% rate</div>
                    </div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderColor: overdue ? 'rgba(239,68,68,0.4)' : '' }}>
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><i className="fa-solid fa-bell" style={{ color: '#ef4444' }}></i></div>
                    <div><div className="stat-value" style={{ color: overdue ? '#ef4444' : '' }}>{overdue}</div><div className="stat-label">Overdue Follow-ups</div></div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                            <i className="fa-solid fa-clipboard-question" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                            Inquiry Management
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{filtered.length} of {inquiries.length} inquiries shown</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>New Inquiry
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {Object.entries(statusCounts).map(([status, count]: any) => (
                        <button key={status} 
                            onClick={() => setFilter(status)}
                            style={{ 
                                padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--glass-border)',
                                background: filter === status ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: filter === status ? '#000' : 'var(--text-main)',
                                fontWeight: filter === status ? 700 : 500
                            }}>
                            {status} <span style={{ fontSize: '11px', opacity: 0.8 }}>({count})</span>
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-inbox" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                        <h3>No Inquiries Found</h3>
                        <p>No inquiries match the selected filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {filtered.map(inq => {
                            const isOverdue = inq.follow_up_date && new Date(inq.follow_up_date) < new Date() && inq.status !== 'Converted' && inq.status !== 'Rejected';
                            return (
                                <div key={inq.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-muted)' }}>{inq.ref_no || '—'}</div>
                                        {getStatusBadge(inq.status)}
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 800 }}>{inq.customer_name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {inq.customer_phone && <div><i className="fa-solid fa-phone" style={{ marginRight: '6px', color: 'var(--primary)' }}></i>{inq.customer_phone}</div>}
                                        {inq.customer_email && <div><i className="fa-solid fa-envelope" style={{ marginRight: '6px', color: 'var(--primary)' }}></i>{inq.customer_email}</div>}
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {inq.event_type && <div><i className="fa-solid fa-champagne-glasses" style={{ marginRight: '6px', width: '16px' }}></i>{inq.event_type}</div>}
                                        {inq.preferred_date && <div><i className="fa-regular fa-calendar" style={{ marginRight: '6px', width: '16px' }}></i>{formatDate(inq.preferred_date)} {inq.flexible_date && '±'}</div>}
                                        {inq.num_guests && <div><i className="fa-solid fa-users" style={{ marginRight: '6px', width: '16px' }}></i>{inq.num_guests} guests</div>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                        <span><i className={`fa-solid ${sourceIcons[inq.source] || 'fa-circle-dot'}`} style={{ marginRight: '4px' }}></i>{inq.source}</span>
                                        {inq.follow_up_date && (
                                            <span style={{ color: isOverdue ? '#ef4444' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 'normal' }}>
                                                <i className="fa-solid fa-bell" style={{ marginRight: '4px' }}></i>Follow-up: {formatDate(inq.follow_up_date)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
                                        {inq.status === 'New' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(inq.id, 'In Progress')}><i className="fa-solid fa-play"></i></button>}
                                        {inq.status === 'In Progress' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(inq.id, 'Quoted')} style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}><i className="fa-solid fa-file-invoice-dollar"></i></button>}
                                        <button className="btn btn-outline btn-sm" onClick={() => openModal(inq)}><i className="fa-solid fa-pen"></i></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteInquiry(inq.id)}><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay open" id="inquiryModal">
                    <div className="modal-content" style={{ maxWidth: '680px', borderTop: '5px solid #10b981', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), 0 0 35px rgba(16, 185, 129, 0.15)' }}>
                        <button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
                        <h3><i className="fa-solid fa-clipboard-question" style={{ color: '#10b981', marginRight: '10px' }}></i>{formData.id ? 'Edit Inquiry' : 'New Inquiry'}</h3>

                        {/* Simplified step rendering without complex tabs for now, all in one view for ease of migration */}
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <p style={{ fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>Customer Information</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Full Name *</label><input type="text" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} /></div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Phone Number</label><input type="text" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} /></div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}><label>Email Address</label><input type="email" value={formData.customer_email} onChange={e => setFormData({ ...formData, customer_email: e.target.value })} /></div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Source</label>
                                        <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                                            <option>Walk-in</option><option>Phone Call</option><option>Email</option><option>Social Media</option><option>Website</option><option>Referral</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Assigned To</label><input type="text" value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} /></div>
                                </div>
                            </div>
                            
                            <div>
                                <p style={{ fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>Event Details</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Event Type</label>
                                        <select value={formData.event_type} onChange={e => setFormData({ ...formData, event_type: e.target.value })}>
                                            <option>Wedding</option><option>Birthday Party</option><option>Corporate Event</option><option>Conference</option><option>Anniversary</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Preferred Venue</label>
                                        <select value={formData.room_id} onChange={e => setFormData({ ...formData, room_id: e.target.value })}>
                                            <option value="">-- No Preference --</option>
                                            {eventRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Preferred Date</label><input type="date" value={formData.preferred_date} onChange={e => setFormData({ ...formData, preferred_date: e.target.value })} /></div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Number of Guests</label><input type="number" value={formData.num_guests} onChange={e => setFormData({ ...formData, num_guests: e.target.value })} /></div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Estimated Budget</label><input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} /></div>
                                    <div className="form-group" style={{ marginBottom: 0 }}><label>Follow-up Date</label><input type="date" value={formData.follow_up_date} onChange={e => setFormData({ ...formData, follow_up_date: e.target.value })} /></div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={formData.flexible_date} onChange={e => setFormData({ ...formData, flexible_date: e.target.checked })} style={{ width: 'auto' }} /> Date is flexible
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p style={{ fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>Requirements & Notes</p>
                                <div className="form-group"><label>Special Requirements</label><textarea rows={3} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} /></div>
                                <div className="form-group"><label>Internal Notes</label><textarea rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitInquiry} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none' }}>
                                <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>Save Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
