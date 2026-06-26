'use client';

import React, { useState, useEffect } from 'react';
import { useReservations } from '../ReservationsContext';

const MENU_CATEGORIES = [
    'Action Station (Live Cooking Station)',
    'Appetizers / Starters',
    'Main Course',
    'Desserts / Sweet / Dessert Live Station',
    'Beverage Station',
    'Bakery / Bread Station',
    'Salad Bar',
    'Soup Station',
    'Live Grill / BBQ Station'
];

const DEFAULT_MENU_ITEMS: any = {
    'Action Station (Live Cooking Station)': ['Pasta (Alfredo / Bolognese / Carbonara)', 'Fried noodles (Chicken / Seafood / Vegetable)', 'Omelette (cheese, mushroom, onion, chili options)', 'Dosa / Hoppers (Sri Lankan live station)', 'Stir-fried rice (egg / chicken / mixed)', 'Carving roast chicken / beef slices'],
    'Appetizers / Starters': ['Chicken spring rolls', 'Vegetable samosas', 'Garlic bread bites', 'Devilled chicken / fish', 'Prawn cocktail', 'Mini sliders (beef or chicken)', 'Stuffed mushrooms'],
    'Main Course': ['Chicken curry (Sri Lankan / Indian style)', 'Beef curry', 'Fish ambul thiyal', 'Vegetable korma', 'Fried rice / steamed rice', 'Pasta with sauces', 'Grilled chicken steak', 'Lamb stew'],
    'Desserts / Sweet / Dessert Live Station': ['Chocolate fountain with fruits', 'Ice cream (vanilla, chocolate, strawberry)', 'Watalappan (Sri Lankan dessert)', 'Cheesecake slices', 'Fruit salad', 'Pancakes with toppings (live station)', 'Chocolate mousse'],
    'Beverage Station': ['Fresh lime juice', 'Orange juice', 'Mango juice', 'Soft drinks (cola, sprite)', 'Tea (black / milk tea)', 'Coffee (espresso / cappuccino)', 'Mocktails (mojito, sunrise)'],
    'Bakery / Bread Station': ['Croissants', 'Dinner rolls', 'Garlic bread', 'Baguette slices', 'Muffins (chocolate / blueberry)', 'Danish pastries', 'Butter & jam spreads'],
    'Salad Bar': ['Lettuce, cucumber, tomato mix', 'Beetroot salad', 'Coleslaw', 'Pasta salad', 'Potato salad', 'Corn salad', 'Dressings (vinaigrette, mayo, yogurt)'],
    'Soup Station': ['Chicken clear soup', 'Cream of mushroom soup', 'Sweet corn soup', 'Pumpkin soup', 'Seafood soup', 'Lentil soup (dal soup)'],
    'Live Grill / BBQ Station': ['Grilled chicken skewers', 'Beef steak slices', 'Grilled prawns', 'BBQ sausages', 'Grilled fish fillets', 'Vegetable skewers (capsicum, mushroom, onion)']
};

const MENU_SELECTION_LIMIT = 3;
const MENU_APPROVAL_THRESHOLD = 4;

export default function EventsPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { reservations, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';

    const [activeTab, setActiveTab] = useState('events');
    const [menuCollection, setMenuCollection] = useState<any>({});
    const [newItems, setNewItems] = useState<any>({});

    useEffect(() => {
        try {
            const raw = settings?.menu_collection;
            if (!raw) {
                const copy: any = {};
                for (let cat in DEFAULT_MENU_ITEMS) { copy[cat] = [...DEFAULT_MENU_ITEMS[cat]]; }
                setMenuCollection(copy);
            } else {
                setMenuCollection(JSON.parse(raw));
            }
        } catch (e) {
            const copy: any = {};
            for (let cat in DEFAULT_MENU_ITEMS) { copy[cat] = [...DEFAULT_MENU_ITEMS[cat]]; }
            setMenuCollection(copy);
        }
    }, [settings]);

    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

    const getStatusBadge = (status: string) => {
        let cls = 'badge-info';
        if (status === 'Confirmed') cls = 'badge-success';
        if (status === 'Pending') cls = 'badge-warning';
        if (status === 'Cancelled') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    const updateReservationStatus = async (id: number, status: string) => {
        try {
            await fetchAPI(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            await refreshData();
        } catch (e: any) { alert('Failed to update: ' + e.message); }
    };

    const deleteReservation = async (id: number) => {
        if (!confirm('Delete this reservation?')) return;
        try {
            await fetchAPI(`/reservations/${id}`, { method: 'DELETE' });
            await refreshData();
        } catch (e: any) { alert('Error: ' + e.message); }
    };

    const handleAddMenuItem = (cat: string) => {
        const val = newItems[cat]?.trim();
        if (!val) return alert('Enter a menu item name');

        const items = menuCollection[cat] || [];
        const currentCount = items.length;

        if (currentCount >= MENU_APPROVAL_THRESHOLD) {
            const approved = confirm(`⚠️ Warning: You are adding item #${currentCount + 1} to "${cat}".\n\nOnly ${MENU_SELECTION_LIMIT} items are typically selected per station.\nItems beyond ${MENU_SELECTION_LIMIT} require manager approval.\n\nContinue adding "${val}"?`);
            if (!approved) return;
        }

        setMenuCollection({ ...menuCollection, [cat]: [...items, val] });
        setNewItems({ ...newItems, [cat]: '' });
    };

    const handleRemoveMenuItem = (cat: string, index: number) => {
        const items = [...(menuCollection[cat] || [])];
        items.splice(index, 1);
        setMenuCollection({ ...menuCollection, [cat]: items });
    };

    const saveMenuCollection = async () => {
        try {
            await fetchAPI('/settings', { method: 'PUT', body: JSON.stringify({ menu_collection: JSON.stringify(menuCollection) }) });
            await refreshData();
            alert('Menu collection saved successfully!');
        } catch (e: any) { alert('Failed to save menu: ' + e.message); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                                <i className="fa-solid fa-champagne-glasses" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                                Event Management
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{reservations.length} events in database</p>
                        </div>
                    </div>
                    
                    <div className="tabs" style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
                        <button className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Menu Collection</button>
                    </div>
                </div>

                {activeTab === 'events' && (
                    <div style={{ marginTop: '16px' }}>
                        {reservations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                                <h3>No Records Found</h3>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Event</th><th>Customer</th><th>Venue</th><th>Guests</th><th>From</th><th>To</th><th>Value</th><th>Status</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map(r => (
                                            <tr key={r.id}>
                                                <td>
                                                    <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>{r.booking_no || `BKG-${String(r.id).padStart(4,'0')}`}</div>
                                                    <div style={{ fontWeight: 700 }}>{r.event_name}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{r.customer_name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.customer_phone}</div>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)' }}>{r.room_name || '—'}</td>
                                                <td>{r.num_guests || '—'}</td>
                                                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(r.date_start)}</td>
                                                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(r.date_end)}</td>
                                                <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(r.total_price)}</td>
                                                <td>{getStatusBadge(r.status)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {r.status === 'Pending' && <button className="btn btn-primary btn-sm" onClick={() => updateReservationStatus(r.id, 'Confirmed')}><i className="fa-solid fa-check"></i></button>}
                                                        {r.status === 'Pending' && <button className="btn btn-danger btn-sm" onClick={() => updateReservationStatus(r.id, 'Cancelled')}><i className="fa-solid fa-xmark"></i></button>}
                                                        <button className="btn btn-danger btn-sm" onClick={() => deleteReservation(r.id)}><i className="fa-solid fa-trash"></i></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                                <i className="fa-solid fa-utensils" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>Menu Collection
                            </h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button className="btn btn-primary" onClick={saveMenuCollection} style={{ padding: '8px 16px' }}>Save Menu</button>
                            </div>
                        </div>
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-info-circle" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                            <strong>Selection Limit:</strong> Max 3 items per category • Items 4+ require manager approval
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                            {MENU_CATEGORIES.map(cat => {
                                const items = menuCollection[cat] || [];
                                const itemCount = items.length;
                                const requiresApproval = itemCount > MENU_APPROVAL_THRESHOLD;

                                return (
                                    <div key={cat} className="card" style={requiresApproval ? { border: '2px solid var(--warning)' } : {}}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <strong style={{ display: 'block' }}>{cat}</strong>
                                            <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>{itemCount} items</div>
                                        </div>
                                        {requiresApproval && (
                                            <div style={{ background: 'var(--warning)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '12px', marginBottom: '8px' }}>
                                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '4px' }}></i>⚠️ Requires approval ({itemCount} items)
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                                            {items.map((it: string, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--glass-bg)', borderRadius: '4px', opacity: i >= MENU_SELECTION_LIMIT ? 0.6 : 1, border: i >= MENU_SELECTION_LIMIT ? '1px dashed var(--warning)' : 'none' }}>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-bright)', flex: 1 }}>
                                                        {i + 1}. {it} {i >= MENU_SELECTION_LIMIT && <span style={{ color: 'var(--warning)', fontWeight: 600 }}>[PENDING]</span>}
                                                    </div>
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleRemoveMenuItem(cat, i)} style={{ flexShrink: 0 }}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input 
                                                value={newItems[cat] || ''} 
                                                onChange={e => setNewItems({ ...newItems, [cat]: e.target.value })} 
                                                placeholder="Add new item..." 
                                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} 
                                            />
                                            <button className="btn btn-primary btn-sm" onClick={() => handleAddMenuItem(cat)}>Add</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
