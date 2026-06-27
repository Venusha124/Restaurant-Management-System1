'use client';

import React, { useState } from 'react';
import { usePos } from '../PosContext';

export default function ManageDishes() {
    const { data, fetchAPI, setData } = usePos();
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        category_id: '',
        price: '',
        image: ''
    });

    const isManager = ['admin', 'manager'].includes(data.currentUser?.role);
    const currency = data.settings?.currency_symbol || 'Rs.';

    const openModal = (dish: any = null) => {
        if (dish) {
            setFormData({
                id: dish.id,
                name: dish.name,
                category_id: dish.category_id,
                price: dish.price,
                image: dish.image || ''
            });
        } else {
            setFormData({
                id: '',
                name: '',
                category_id: data.categories?.[0]?.id || '',
                price: '',
                image: ''
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            return alert('Dish name is required.');
        }
        if (parseFloat(formData.price) < 0) {
            return alert('Price cannot be negative.');
        }

        try {
            const payload = { ...formData, price: parseFloat(formData.price) };
            if (formData.id) {
                await fetchAPI(`/dishes/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            } else {
                await fetchAPI('/dishes', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }
            setShowModal(false);
            
            // Refresh dishes
            const res = await fetchAPI('/dishes');
            const dishes = await res.json();
            setData(prev => ({ ...prev, dishes }));
        } catch (err) {
            alert('Failed to save dish');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this dish?')) return;
        try {
            await fetchAPI(`/dishes/${id}`, { method: 'DELETE' });
            const res = await fetchAPI('/dishes');
            const dishes = await res.json();
            setData(prev => ({ ...prev, dishes }));
        } catch (err) {
            alert('Failed to delete dish');
        }
    };

    const getCategoryName = (id: string) => {
        return data.categories?.find((c: any) => c.id === id)?.name || 'Unknown';
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .dishes-layout { display: flex; flex-direction: column; gap: 20px; height: 100%; }
                .dishes-header { display: flex; justify-content: space-between; align-items: center; }
                .table-container { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 24px; padding: 24px; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; text-align: left; }
                .data-table th { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
                .data-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-main); font-size: 14px; }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .dish-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
            `}} />
            
            <div className="dishes-layout">
                <div className="dishes-header">
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Manage Dishes</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Add, edit, or remove menu items.</p>
                    </div>
                    {isManager && (
                        <button className="btn btn-primary" onClick={() => openModal()} style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 700 }}>
                            <i className="fa-solid fa-plus"></i> Add New Dish
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.dishes.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No dishes found</td></tr>
                            ) : data.dishes.map((d: any) => (
                                <tr key={d.id}>
                                    <td>
                                        <img src={d.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={d.name} className="dish-img" />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                                    <td>{getCategoryName(d.category_id)}</td>
                                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{currency}{d.price.toFixed(2)}</td>
                                    {isManager && (
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openModal(d)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', marginRight: '16px', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                                            <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
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
                            {formData.id ? 'Edit Dish' : 'Add New Dish'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Dish Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category</label>
                                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} required>
                                    <option value="" disabled>Select a category</option>
                                    {data.categories?.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Price</label>
                                <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: '12px' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>Save Dish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
