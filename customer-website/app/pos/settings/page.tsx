'use client';

import React, { useState, useEffect } from 'react';
import { usePos } from '../PosContext';
import { useRouter } from 'next/navigation';

export default function Settings() {
    const { data, fetchAPI, setData } = usePos();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        business_name: '',
        currency_symbol: '',
        tax_rate: ''
    });

    const isAdmin = data.currentUser?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) {
            router.push('/pos/dashboard');
            return;
        }
        setFormData({
            business_name: data.settings?.business_name || '',
            currency_symbol: data.settings?.currency_symbol || '',
            tax_rate: data.settings?.tax_rate || ''
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, data.settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await fetchAPI('/settings', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            setData(prev => ({
                ...prev,
                settings: formData
            }));
            alert('Settings saved successfully!');
        } catch (err: any) {
            alert(`Failed to save settings: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Global Settings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Configure business details and POS rules.</p>
            </div>

            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Business Name</label>
                        <input 
                            type="text" 
                            value={formData.business_name} 
                            onChange={e => setFormData({...formData, business_name: e.target.value})} 
                            required 
                            style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '15px' }} 
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Currency Symbol</label>
                            <input 
                                type="text" 
                                value={formData.currency_symbol} 
                                onChange={e => setFormData({...formData, currency_symbol: e.target.value})} 
                                required 
                                style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '15px' }} 
                            />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Tax Rate (%)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0"
                                value={formData.tax_rate} 
                                onChange={e => setFormData({...formData, tax_rate: e.target.value})} 
                                required 
                                style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '15px' }} 
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', fontWeight: 700, borderRadius: '12px' }} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
