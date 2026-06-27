'use client';

import React, { useState, useEffect } from 'react';
import { usePos } from '../PosContext';

export default function ManageTables() {
    const { data, setData, fetchAPI } = usePos();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        seats: 1,
        status: 'Available'
    });

    const isManager = ['admin', 'manager'].includes(data.currentUser?.role);

    const refreshTables = async () => {
        try {
            setLoading(true);
            const res = await fetchAPI('/tables');
            const tables = await res.json();
            setData(prev => ({ ...prev, tables }));
        } catch (err) {
            console.error("Failed to refresh tables", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshTables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = (table: any = null) => {
        if (table) {
            setFormData({
                id: table.id,
                name: table.name,
                seats: table.seats,
                status: table.status
            });
        } else {
            setFormData({
                id: '',
                name: '',
                seats: 1,
                status: 'Available'
            });
        }
        setShowModal(true);
    };

    const handleSaveTable = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            return alert('Table name is required.');
        }
        if (formData.seats < 1) {
            return alert('Number of seats must be at least 1.');
        }

        try {
            if (formData.id) {
                await fetchAPI(`/tables/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchAPI('/tables', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setShowModal(false);
            refreshTables();
        } catch (err) {
            alert('Failed to save table');
        }
    };

    const handleDeleteTable = async (id: number) => {
        if (!confirm('Are you sure you want to delete this table?')) return;
        try {
            await fetchAPI(`/tables/${id}`, { method: 'DELETE' });
            refreshTables();
        } catch (err) {
            alert('Failed to delete table');
        }
    };

    const handleCleanTable = async (id: number) => {
        try {
            await fetchAPI(`/tables/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'Available' })
            });
            refreshTables();
        } catch (err) {
            alert('Failed to mark table as ready');
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .tables-layout { display: flex; flex-direction: column; gap: 20px; height: 100%; }
                .tables-header { display: flex; justify-content: space-between; align-items: center; }
                .tables-legend { display: flex; gap: 16px; font-size: 13px; color: var(--text-muted); }
                .legend-item { display: flex; align-items: center; gap: 6px; }
                .legend-color { width: 12px; height: 12px; border-radius: 4px; }
                .legend-available { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; }
                .legend-occupied { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; }
                .legend-reserved { background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; }
                .legend-dirty { background: rgba(107, 114, 128, 0.2); border: 1px solid #6b7280; }
                
                .floor-plan { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 24px; padding: 30px; display: flex; flex-wrap: wrap; gap: 24px; min-height: 400px; align-content: start; }
                
                .table-obj { width: 120px; height: 120px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: transform 0.2s ease; border: 2px solid transparent; }
                .table-obj:hover { transform: translateY(-4px); }
                .status-available { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }
                .status-occupied { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444; }
                .status-reserved { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: #f59e0b; }
                .status-dirty { background: rgba(107, 114, 128, 0.1); border-color: rgba(107, 114, 128, 0.3); color: #9ca3af; }
                
                .table-actions { position: absolute; bottom: 8px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; }
                .table-obj:hover .table-actions { opacity: 1; }
                .t-action-btn { background: rgba(0,0,0,0.5); border: none; color: white; width: 24px; height: 24px; border-radius: 6px; cursor: pointer; display: flex; alignItems: center; justifyContent: center; font-size: 11px; transition: background 0.2s; }
                .t-action-btn:hover { background: var(--primary); color: #000; }
            `}} />
            
            <div className="tables-layout">
                <div className="tables-header">
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Manage Tables</h2>
                        <div className="tables-legend">
                            <div className="legend-item"><div className="legend-color legend-available"></div> Available</div>
                            <div className="legend-item"><div className="legend-color legend-occupied"></div> Occupied</div>
                            <div className="legend-item"><div className="legend-color legend-reserved"></div> Reserved</div>
                            <div className="legend-item"><div className="legend-color legend-dirty"></div> Dirty</div>
                        </div>
                    </div>
                    {isManager && (
                        <button className="btn btn-primary" onClick={() => openModal()} style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 700 }}>
                            <i className="fa-solid fa-plus"></i> Add New Table
                        </button>
                    )}
                </div>

                <div className="floor-plan">
                    {loading && data.tables.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)' }}>Loading tables...</div>
                    ) : data.tables.map(t => (
                        <div key={t.id} className={`table-obj status-${t.status.toLowerCase()}`}>
                            <span style={{ fontWeight: 800, fontSize: '24px' }}>{t.name}</span>
                            <span style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{t.seats} Seats</span>
                            
                            {t.status === 'Dirty' && (
                                <button onClick={() => handleCleanTable(t.id)} style={{ marginTop: '12px', background: 'var(--text-main)', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                    <i className="fa-solid fa-broom"></i> Ready
                                </button>
                            )}

                            {isManager && (
                                <div className="table-actions">
                                    <button className="t-action-btn" onClick={() => openModal(t)}><i className="fa-solid fa-pen"></i></button>
                                    <button className="t-action-btn" onClick={() => handleDeleteTable(t.id)}><i className="fa-solid fa-trash"></i></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <div className="modal-content" style={{ background: 'var(--bg-main)', padding: '30px', borderRadius: '24px', width: '400px' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>
                            {formData.id ? 'Edit Table' : 'Add New Table'}
                        </h3>
                        <form onSubmit={handleSaveTable} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Table Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Number of Seats</label>
                                <input type="number" min="1" value={formData.seats} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                            </div>
                            {formData.id && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }}>
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Reserved">Reserved</option>
                                        <option value="Dirty">Dirty</option>
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: '12px' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>Save Table</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
