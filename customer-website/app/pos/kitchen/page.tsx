'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePos } from '../PosContext';

export default function KitchenDisplay() {
    const { data, fetchAPI } = usePos();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const pendingOrders = useMemo(() => {
        return (data.orders || [])
            .filter(o => o.status === 'Preparing' || o.status === 'Ready')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [data.orders]);

    const prepMap = useMemo(() => {
        const map: Record<string, number> = {};
        pendingOrders.forEach(ord => {
            if (ord.status === 'Preparing') {
                ord.items.forEach((item: any) => {
                    map[item.dish.name] = (map[item.dish.name] || 0) + item.qty;
                });
            }
        });
        return map;
    }, [pendingOrders]);

    const handleMarkReady = async (id: number) => {
        try {
            await fetchAPI(`/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'Ready' })
            });
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .kitchen-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; height: 100%; }
                .kitchen-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .kitchen-header h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                .tickets-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; align-content: start; overflow-y: auto; padding-right: 10px; }
                .ticket-card { background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; transition: all 0.3s ease; }
                .ticket-header { padding: 16px; display: flex; justify-content: space-between; align-items: center; color: #fff; font-weight: 700; }
                .urgency-normal { background: linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%); }
                .urgency-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
                .urgency-urgent { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); animation: pulse-border 2s infinite; }
                @keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
                .ticket-context { padding: 12px 16px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border-color); display: flex; gap: 10px; font-size: 13px; color: var(--text-muted); align-items: center; }
                .ticket-items { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
                .ticket-item { display: flex; gap: 12px; font-size: 15px; }
                .t-item-qty { font-weight: 800; color: var(--primary); min-width: 24px; }
                .ticket-actions { padding: 16px; border-top: 1px solid var(--border-color); }
                .btn-kitchen { width: 100%; padding: 12px; font-size: 15px; font-weight: 700; border-radius: 10px; }
                .prep-sidebar { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; }
                .prep-list { list-style: none; padding: 0; margin: 20px 0 0 0; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex: 1; }
                .prep-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 10px; font-size: 14px; font-weight: 600; }
                .prep-qty { background: var(--primary); color: #000; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 800; font-size: 13px; }
            `}} />
            
            <div className="kitchen-layout">
                <div className="kitchen-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div className="kitchen-header">
                        <h2>Kitchen Display System (KDS)</h2>
                        <div style={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-pulse" style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></span> 
                            Live Sync Active
                        </div>
                    </div>
                    
                    <div className="tickets-container">
                        {pendingOrders.length === 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                                No active orders in kitchen.
                            </div>
                        )}
                        
                        {pendingOrders.map(ord => {
                            const table = data.tables?.find(t => t.id == ord.table_id);
                            const diffMs = now.getTime() - new Date(ord.date).getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffSecs = Math.floor((diffMs % 60000) / 1000);
                            const urgencyClass = diffMins >= 20 ? 'urgency-urgent' : diffMins >= 10 ? 'urgency-warning' : 'urgency-normal';

                            return (
                                <div key={ord.id} className="ticket-card">
                                    <div className={`ticket-header ${urgencyClass}`}>
                                        <span style={{ fontSize: '18px' }}>#{ord.id}</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '18px' }}>
                                            {diffMins.toString().padStart(2, '0')}:{diffSecs.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="ticket-context">
                                        <i className={`fa-solid ${ord.order_type === 'Takeaway' ? 'fa-bag-shopping' : 'fa-chair'}`}></i>
                                        <span>{ord.order_type || 'Dine In'}</span>
                                        {table && (
                                            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                                {table.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ticket-items">
                                        {ord.items.map((item: any, idx: number) => (
                                            <div key={idx} className="ticket-item">
                                                <div className="t-item-qty">{item.qty}x</div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.dish.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="ticket-actions">
                                        {ord.status === 'Preparing' ? (
                                            <button className="btn btn-primary btn-kitchen" onClick={() => handleMarkReady(ord.id)}>
                                                Mark as Ready
                                            </button>
                                        ) : (
                                            <button className="btn btn-outline btn-kitchen" style={{ borderColor: '#10b981', color: '#10b981' }} disabled>
                                                Serve (Completed)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="prep-sidebar">
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}><i className="fa-solid fa-fire-burner" style={{ color: 'var(--primary)', marginRight: '10px' }}></i> Batch Prep Summary</h3>
                    <ul className="prep-list">
                        {Object.entries(prepMap).length > 0 ? Object.entries(prepMap).map(([name, qty]) => (
                            <li key={name} className="prep-item">
                                <span>{name}</span>
                                <span className="prep-qty">{qty}</span>
                            </li>
                        )) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '20px' }}>Nothing to prep yet.</p>
                        )}
                    </ul>
                    <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
                        Total items to cook: {Object.values(prepMap).reduce((a, b) => a + b, 0)}
                    </div>
                </div>
            </div>
        </>
    );
}
