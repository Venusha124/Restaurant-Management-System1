'use client';

import React, { useState } from 'react';
import { usePos } from '../PosContext';

export default function ManageCustomers() {
    const { data, fetchAPI, setData } = usePos();
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        phone: '',
        email: ''
    });

    const isManager = ['admin', 'manager', 'cashier'].includes(data.currentUser?.role);

    const openModal = (customer: any = null) => {
        if (customer) {
            setFormData({
                id: customer.id,
                name: customer.name,
                phone: customer.phone || '',
                email: customer.email || ''
            });
        } else {
            setFormData({
                id: '',
                name: '',
                phone: '',
                email: ''
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            return alert('Name is required.');
        }
        if (!formData.phone.trim()) {
            return alert('Phone is required.');
        }
        if (formData.phone && !/^\+?[0-9\s\-\(\)]{7,15}$/.test(formData.phone)) {
            return alert('Invalid phone number format.');
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return alert('Invalid email format.');
        }

        try {
            if (formData.id) {
                await fetchAPI(`/customers/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchAPI('/customers', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setShowModal(false);
            
            // Refresh customers
            const res = await fetchAPI('/customers');
            const customers = await res.json();
            setData(prev => ({ ...prev, customers }));
        } catch (err) {
            alert('Failed to save customer');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await fetchAPI(`/customers/${id}`, { method: 'DELETE' });
            const res = await fetchAPI('/customers');
            const customers = await res.json();
            setData(prev => ({ ...prev, customers }));
        } catch (err) {
            alert('Failed to delete customer');
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .customers-layout { display: flex; flex-direction: column; gap: 20px; height: 100%; }
                .customers-header { display: flex; justify-content: space-between; align-items: center; }
                .table-container { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 24px; padding: 24px; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; text-align: left; }
                .data-table th { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
                .data-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-main); font-size: 14px; }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
            `}} />
            
            <div className="customers-layout">
                <div className="customers-header">
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Manage Customers</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Loyalty members and customer profiles.</p>
                    </div>
                    {isManager && (
                        <button className="btn btn-primary" onClick={() => openModal()} style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 700 }}>
                            <i className="fa-solid fa-plus"></i> Add New Customer
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Loyalty Points</th>
                                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.customers.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No customers found</td></tr>
                            ) : data.customers.map((c: any) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>{c.phone || 'N/A'}</td>
                                    <td>{c.email || 'N/A'}</td>
                                    <td><span className="badge">{c.points || 0} pts</span></td>
                                    {isManager && (
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openModal(c)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', marginRight: '16px', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                                            {data.currentUser?.role === 'admin' && (
                                                <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <div className="modal-content" style={{ background: 'var(--bg-main)', padding: '30px', borderRadius: '24px', width: '400px' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>
                            {formData.id ? 'Edit Customer' : 'Add New Customer'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Phone Number</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Email (Optional)</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: '12px' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>Save Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
