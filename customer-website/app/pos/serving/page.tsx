'use client';

import React, { useMemo } from 'react';
import { usePos } from '../PosContext';

export default function ReadyToServe() {
    const { data, fetchAPI } = usePos();

    const readyOrders = useMemo(() => {
        return (data.orders || [])
            .filter(o => o.status === 'Ready')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [data.orders]);

    const handleServe = async (id: number) => {
        try {
            await fetchAPI(`/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'Completed' })
            });
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    return (
        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Ready to Serve</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Orders waiting to be delivered to customers.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto', flex: 1, alignContent: 'start' }}>
                {readyOrders.length === 0 && (
                    <div style={{ gridColumn: '1/-1', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '60px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
                        <div style={{ fontSize: '48px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }}>
                            <i className="fa-solid fa-plate-wheat"></i>
                        </div>
                        <h3 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 700 }}>No Orders Ready</h3>
                        <p style={{ color: 'var(--text-muted)' }}>When the kitchen marks an order as ready, it will appear here.</p>
                    </div>
                )}

                {readyOrders.map(ord => {
                    const table = data.tables?.find((t: any) => t.id == ord.table_id);
                    const customer = ord.customer_id ? data.customers?.find((c: any) => c.id == ord.customer_id) : null;
                    
                    return (
                        <div key={ord.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <div style={{ padding: '16px', background: 'rgba(0, 242, 254, 0.1)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>#{ord.id}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {new Date(ord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{ padding: '16px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <i className={`fa-solid ${ord.order_type === 'Takeaway' ? 'fa-bag-shopping' : 'fa-chair'}`} style={{ color: 'var(--text-muted)', fontSize: '12px' }}></i>
                                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{ord.order_type || 'Dine In'}</span>
                                    {table && (
                                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                            {table.name}
                                        </span>
                                    )}
                                </div>
                                {customer && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                        <i className="fa-solid fa-user" style={{ marginRight: '6px' }}></i> {customer.name}
                                    </div>
                                )}
                                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                                    {ord.items.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: '24px' }}>{item.qty}x</span>
                                            <span style={{ flex: 1, fontWeight: 500 }}>{item.dish.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                <button className="btn btn-primary" onClick={() => handleServe(ord.id)} style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 700 }}>
                                    <i className="fa-solid fa-check-double" style={{ marginRight: '8px' }}></i> Serve Order
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
