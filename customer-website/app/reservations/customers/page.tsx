'use client';

import React, { useState } from 'react';
import { useReservations } from '../ReservationsContext';

export default function CustomersPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { customers, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [activeTab, setActiveTab] = useState('Personal');

    const openModal = (customer?: any) => {
        if (customer) {
            setEditingId(customer.id);
            setFormData({ name: customer.name || '', phone: customer.phone || '', email: customer.email || '' });
        } else {
            setEditingId(null);
            setFormData({ name: '', phone: '', email: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const submitCustomer = async () => {
        const { name, phone, email } = formData;
        if (!name.trim()) return alert('Customer name is required');
        if (!phone.trim()) return alert('Phone number is required');
        if (phone && !/^\+?[0-9\s\-\(\)]{7,15}$/.test(phone)) return alert('Invalid phone number format');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Invalid email format');

        try {
            if (editingId) {
                await fetchAPI(`/customers/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
            } else {
                await fetchAPI('/customers', { method: 'POST', body: JSON.stringify(formData) });
            }
            closeModal();
            await refreshData();
        } catch (e: any) {
            alert('Database error: ' + e.message);
        }
    };

    const deleteCustomer = async (id: number) => {
        if (!confirm('Delete this customer? This cannot be undone.')) return;
        try {
            await fetchAPI(`/customers/${id}`, { method: 'DELETE' });
            await refreshData();
        } catch (e: any) {
            alert('Failed to delete: ' + e.message);
        }
    };

    const formatCurrency = (val: number) => {
        return `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                            <i className="fa-solid fa-user-plus" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                            Customer Registration
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{customers.length} customers synced from database</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()} style={{ borderRadius: '20px', padding: '10px 20px', boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)' }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>Register Customer
                    </button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                    <div 
                        onClick={() => setActiveTab('Personal')}
                        style={{ flex: 1, textAlign: 'center', padding: '16px', cursor: 'pointer', fontWeight: 700, borderRadius: '8px 8px 0 0',
                            background: activeTab === 'Personal' ? 'linear-gradient(90deg, #00f2fe, #4facfe)' : 'transparent',
                            color: activeTab === 'Personal' ? '#000' : 'var(--text-muted)',
                            boxShadow: activeTab === 'Personal' ? '0 0 20px rgba(0,242,254,0.4)' : 'none'
                        }}>
                        Personal
                    </div>
                    <div 
                        onClick={() => setActiveTab('Company')}
                        style={{ flex: 1, textAlign: 'center', padding: '16px', cursor: 'pointer', fontWeight: 700, borderRadius: '8px 8px 0 0',
                            background: activeTab === 'Company' ? 'linear-gradient(90deg, #00f2fe, #4facfe)' : 'transparent',
                            color: activeTab === 'Company' ? '#000' : 'var(--text-muted)',
                            boxShadow: activeTab === 'Company' ? '0 0 20px rgba(0,242,254,0.4)' : 'none'
                        }}>
                        Company
                    </div>
                </div>
                
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>FULL NAME</th>
                                <th>PHONE</th>
                                <th>EMAIL</th>
                                <th>LOYALTY</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            <i className="fa-solid fa-users" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                                            <h3>No Customers</h3>
                                            <p>Register your first customer to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {customers.map((cu, i) => (
                                <tr key={cu.id || i}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{String(i + 1).padStart(2, '0')}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                                                {(cu.name || '?')[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 700 }}>{cu.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{cu.phone || '—'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{cu.email || '—'}</td>
                                    <td><span className="badge badge-info" style={{ borderRadius: '16px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--primary)' }}>{cu.loyalty_points || 0} pts</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => openModal(cu)} style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}>
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteCustomer(cu.id)} style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay open" id="customerModal">
                    <div className="modal-content" style={{ borderTop: '5px solid #f59e0b', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), 0 0 35px rgba(245, 158, 11, 0.15)' }}>
                        <button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
                        <h3>
                            <i className="fa-solid fa-user-plus" style={{ color: '#f59e0b', marginRight: '10px' }}></i>
                            {editingId ? 'Edit Customer' : 'Register Customer'}
                        </h3>
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="e.g. Saman Perera" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input 
                                type="text" 
                                value={formData.phone} 
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                placeholder="+94 77 123 4567" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                placeholder="email@example.com" 
                            />
                        </div>
                        
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitCustomer} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none' }}>
                                <i className="fa-solid fa-user-check" style={{ marginRight: '8px' }}></i>{editingId ? 'Update' : 'Register'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
