'use client';

import React, { useMemo } from 'react';
import { usePos } from '../PosContext';

export default function OrderHistory() {
    const { data } = usePos();
    const currency = data.settings?.currency_symbol || 'Rs.';

    const historyOrders = useMemo(() => {
        return (data.orders || [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [data.orders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Preparing': return '#f59e0b';
            case 'Ready': return '#3b82f6';
            case 'Cancelled': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Order History</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>View past transactions and regenerate receipts.</p>
            </div>

            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Order ID</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Date & Time</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Type</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Total</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyOrders.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No order history found.</td></tr>
                        ) : historyOrders.map(ord => (
                            <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', fontWeight: 700 }}>#{ord.id}</td>
                                <td style={{ padding: '16px' }}>{new Date(ord.date).toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>{ord.order_type || 'Dine In'}</td>
                                <td style={{ padding: '16px', color: 'var(--primary)', fontWeight: 700 }}>{currency}{ord.total.toFixed(2)}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px', 
                                        fontWeight: 700, 
                                        background: getStatusColor(ord.status) + '33', 
                                        color: getStatusColor(ord.status) 
                                    }}>
                                        {ord.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
