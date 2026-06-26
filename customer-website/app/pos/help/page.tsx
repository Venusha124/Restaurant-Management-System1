'use client';

import React from 'react';

export default function HelpCenter() {
    return (
        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Help Center</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Documentation and user guide for Tasty of Ascendia POS.</p>
            </div>

            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '18px' }}><i className="fa-solid fa-cash-register"></i> Order Line</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        Use the Order Line to create new transactions. Click on menu items to add them to the cart. You can assign tables, link loyalty customers, and submit the order either as cash or card. Orders are automatically synced to the Kitchen Display System (KDS).
                    </p>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                    <h3 style={{ color: '#10b981', marginBottom: '12px', fontSize: '18px' }}><i className="fa-solid fa-fire-burner"></i> Kitchen Display System (KDS)</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        The KDS automatically lists all pending orders. As time passes, the ticket header will turn orange (10+ mins) and red (20+ mins). The Kitchen staff should mark items as "Ready" when done, which pushes them to the Serving queue.
                    </p>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '18px' }}><i className="fa-solid fa-chair"></i> Table Management</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        Admins and Managers can design the restaurant floor plan by adding tables. When customers leave, tables are marked as "Dirty" and must be cleared by clicking the "Ready" broom icon to make them Available again.
                    </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Need more help? Contact Ascendia Solutions Support at support@ascendiasolutions.com
                </div>
            </div>
        </div>
    );
}
