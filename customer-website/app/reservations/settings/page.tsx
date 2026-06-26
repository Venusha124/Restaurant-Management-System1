'use client';

import React, { useState, useEffect } from 'react';
import { useReservations } from '../ReservationsContext';

export default function SettingsPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { settings } = data;

    const [businessName, setBusinessName] = useState('');
    const [currencySymbol, setCurrencySymbol] = useState('');

    useEffect(() => {
        if (settings) {
            setBusinessName(settings.business_name || '');
            setCurrencySymbol(settings.currency_symbol || '');
        }
    }, [settings]);

    const saveSettings = async () => {
        if (!businessName.trim()) {
            return alert('Business name cannot be empty');
        }
        try {
            await fetchAPI('/settings', {
                method: 'PUT',
                body: JSON.stringify({ business_name: businessName.trim(), currency_symbol: currencySymbol.trim() })
            });
            await refreshData();
            alert('Settings saved successfully!');
        } catch (e: any) {
            alert('Failed to save settings: ' + e.message);
        }
    };

    const forceSync = async () => {
        await refreshData();
        alert('All data synced from pos_data.db ✓');
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="section-header" style={{ marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
                            <i className="fa-solid fa-gear" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                            System Settings
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configure the Reservation Module</p>
                    </div>
                </div>
                
                <div style={{ maxWidth: '600px' }}>
                    <div className="form-group">
                        <label>Business Name</label>
                        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Currency Symbol</label>
                        <input type="text" value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)} style={{ maxWidth: '100px' }} />
                    </div>
                    <div className="form-group">
                        <label>Default Reservation Status</label>
                        <select defaultValue="Confirmed">
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-primary" onClick={saveSettings}>
                            <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>Save Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>
                    <i className="fa-solid fa-database" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                    Database & Connections
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>POS Module</div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>http://localhost:301</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Shared SQLite database</div>
                    </div>
                    <div style={{ padding: '16px', border: '1px solid var(--primary)', borderRadius: '16px', background: 'var(--primary-light)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reservation Module</div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>http://localhost:302</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Active — pos_data.db</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="http://localhost:301" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-cash-register" style={{ marginRight: '8px' }}></i>Open POS Module
                    </a>
                    <button className="btn btn-outline" onClick={forceSync}>
                        <i className="fa-solid fa-rotate-right" style={{ marginRight: '8px' }}></i>Force DB Sync
                    </button>
                </div>
                
                <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                    Both modules share the same <code style={{ color: 'var(--primary)' }}>pos_data.db</code> SQLite file. All CRUD operations are persisted in real-time.
                </p>
            </div>
        </div>
    );
}
