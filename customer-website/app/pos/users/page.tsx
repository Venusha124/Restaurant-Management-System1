'use client';

import React, { useState, useEffect } from 'react';
import { usePos } from '../PosContext';
import { useRouter } from 'next/navigation';

export default function ManageUsers() {
    const { data, fetchAPI } = usePos();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        username: '',
        password: '',
        role: 'waiter'
    });

    const isAdmin = data.currentUser?.role === 'admin';

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await fetchAPI('/users');
            if (res.ok) {
                const fetchedUsers = await res.json();
                setUsers(fetchedUsers);
            }
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAdmin) {
            router.push('/pos/dashboard');
            return;
        }
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    const openModal = (user: any = null) => {
        if (user) {
            setFormData({
                id: user.id,
                name: user.name,
                username: user.username,
                password: '', // Don't show existing password
                role: user.role
            });
        } else {
            setFormData({
                id: '',
                name: '',
                username: '',
                password: '',
                role: 'waiter'
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.id) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't update if blank
                await fetchAPI(`/users/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            } else {
                await fetchAPI('/users', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setShowModal(false);
            loadUsers();
        } catch (err: any) {
            alert(`Failed to save user: ${err.message}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await fetchAPI(`/users/${id}`, { method: 'DELETE' });
            loadUsers();
        } catch (err: any) {
            alert(`Failed to delete user: ${err.message}`);
        }
    };

    if (!isAdmin) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .users-layout { display: flex; flex-direction: column; gap: 20px; height: 100%; }
                .users-header { display: flex; justify-content: space-between; align-items: center; }
                .table-container { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 24px; padding: 24px; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; text-align: left; }
                .data-table th { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
                .data-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-main); font-size: 14px; }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
                .role-admin { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .role-manager { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .role-cashier { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .role-kitchen { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .role-waiter { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
            `}} />
            
            <div className="users-layout">
                <div className="users-header">
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Staff & Roles</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage system access and roles.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()} style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 700 }}>
                        <i className="fa-solid fa-plus"></i> Add New User
                    </button>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No users found</td></tr>
                                ) : users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td>{u.username}</td>
                                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openModal(u)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', marginRight: '16px', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                                            <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} disabled={u.id === data.currentUser?.id}><i className="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <div className="modal-content" style={{ background: 'var(--bg-main)', padding: '30px', borderRadius: '24px', width: '400px' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>
                            {formData.id ? 'Edit User' : 'Add New User'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Full Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Username</label>
                                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Password {formData.id && '(Leave blank to keep unchanged)'}</label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!formData.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Role</label>
                                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }}>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="kitchen">Kitchen</option>
                                    <option value="waiter">Waiter</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: '12px' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
