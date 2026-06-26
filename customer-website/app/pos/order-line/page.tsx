'use client';

import React, { useState, useMemo } from 'react';
import { usePos } from '../PosContext';

export default function OrderLine() {
    const { data, addToCart, removeFromCart, clearCart, fetchAPI } = usePos();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [showItemModal, setShowItemModal] = useState(false);
    const [selectedDish, setSelectedDish] = useState<any>(null);
    const [modalQty, setModalQty] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const currency = data.settings?.currency_symbol || 'Rs.';

    const categories = data.categories || [];
    const allDishes = data.dishes || [];
    const cart = data.cart || [];

    const displayDishes = useMemo(() => {
        if (activeCategory === 'all') return allDishes;
        return allDishes.filter(d => d.category_id === activeCategory);
    }, [allDishes, activeCategory]);

    const subtotal = cart.reduce((sum, item) => sum + (item.dish.price * item.qty), 0);
    const taxRate = parseFloat(data.settings?.tax_rate || '10');
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const openItemModal = (dish: any) => {
        setSelectedDish(dish);
        setModalQty(1);
        setShowItemModal(true);
    };

    const handleAddToCart = () => {
        if (selectedDish) {
            addToCart(selectedDish, modalQty);
        }
        setShowItemModal(false);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return alert('Cart is empty');
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        try {
            await fetchAPI('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items: cart,
                    subtotal,
                    tax,
                    total,
                    orderType: 'Dine In',
                    paymentMethod,
                    status: 'Preparing'
                })
            });
            alert('Payment Successful!');
            clearCart();
            setShowPaymentModal(false);
        } catch (error) {
            alert('Payment failed');
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .order-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; height: 100%; }
                .order-main { display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
                .order-categories-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
                .category-btn { padding: 12px 24px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-main); font-weight: 600; cursor: pointer; white-space: nowrap; transition: var(--transition-normal); }
                .category-btn.active, .category-btn:hover { background: var(--primary); color: #000; border-color: var(--primary); }
                .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; overflow-y: auto; padding-right: 10px; }
                .dish-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px; cursor: pointer; transition: var(--transition-normal); text-align: center; }
                .dish-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.05); border-color: var(--primary); }
                .dish-img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; }
                .dish-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
                .dish-price { color: var(--primary); font-weight: 700; font-size: 15px; }
                
                .order-cart-panel { background: rgba(15, 23, 42, 0.4); border-radius: 20px; border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; }
                .cart-header { padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
                .cart-header h3 { font-size: 18px; font-weight: 700; }
                .cart-items { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
                .cart-item { display: flex; justify-content: space-between; align-items: center; }
                .cart-item-info { flex: 1; }
                .cart-item-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
                .cart-item-price { color: var(--text-muted); font-size: 13px; }
                .cart-item-qty { font-weight: 700; font-size: 14px; color: var(--primary); margin-left: 10px; }
                
                .cart-summary { padding: 20px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--border-color); }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: var(--text-muted); }
                .summary-total { display: flex; justify-content: space-between; margin: 16px 0; font-size: 18px; font-weight: 800; color: var(--primary); }
                .checkout-btn { width: 100%; padding: 16px; font-size: 16px; font-weight: 700; border-radius: 14px; }
            `}} />
            <div className="order-layout">
                <div className="order-main">
                    <div className="order-categories-scroll">
                        <button className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All Items</button>
                        {categories.map((cat: any) => (
                            <button key={cat.id} className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <div className="order-grid">
                        {displayDishes.map((dish: any) => (
                            <div key={dish.id} className="dish-card" onClick={() => openItemModal(dish)}>
                                <img src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={dish.name} className="dish-img" />
                                <div className="dish-title">{dish.name}</div>
                                <div className="dish-price">{currency}{dish.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="order-cart-panel">
                    <div className="cart-header">
                        <h3>Current Order</h3>
                    </div>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Cart is empty</div>
                        ) : cart.map((item: any, idx: number) => (
                            <div key={idx} className="cart-item">
                                <div className="cart-item-info">
                                    <div className="cart-item-title">{item.dish.name}</div>
                                    <div className="cart-item-price">{currency}{(item.dish.price * item.qty).toFixed(2)}</div>
                                </div>
                                <div className="cart-item-qty">x{item.qty}</div>
                                <button onClick={() => removeFromCart(item.dish.id)} style={{ marginLeft: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <div className="summary-row"><span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span></div>
                        <div className="summary-row"><span>Tax ({taxRate}%)</span><span>{currency}{tax.toFixed(2)}</span></div>
                        <div className="summary-total"><span>Total</span><span>{currency}{total.toFixed(2)}</span></div>
                        <button className="btn btn-primary checkout-btn" onClick={handleCheckout}><i className="fa-solid fa-wallet"></i> Pay Now</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showItemModal && selectedDish && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <div className="modal-content" style={{ background: 'var(--bg-main)', padding: '30px', borderRadius: '24px', width: '400px', textAlign: 'center' }}>
                        <h3>Add Item</h3>
                        <img src={selectedDish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '20px auto' }} />
                        <h4>{selectedDish.name}</h4>
                        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '16px', marginBottom: '24px' }}>{currency}{selectedDish.price.toFixed(2)}</div>
                        
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '30px', marginBottom: '30px' }}>
                            <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}><i className="fa-solid fa-minus"></i></button>
                            <span style={{ fontSize: '32px', fontWeight: 800 }}>{modalQty}</span>
                            <button onClick={() => setModalQty(modalQty + 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}><i className="fa-solid fa-plus"></i></button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" style={{ flex: 1, borderRadius: '20px' }} onClick={() => setShowItemModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1, borderRadius: '20px' }} onClick={handleAddToCart}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}

            {showPaymentModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <div className="modal-content" style={{ background: 'var(--bg-main)', padding: '30px', borderRadius: '24px', width: '480px' }}>
                        <h3>Finalize Payment</h3>
                        <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '12px', textAlign: 'center', margin: '24px 0' }}>
                            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{currency}{total.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {['Cash', 'Card', 'QR'].map(method => (
                                <button key={method} onClick={() => setPaymentMethod(method)} style={{ padding: '12px', background: paymentMethod === method ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: paymentMethod === method ? '#000' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>{method}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={processPayment}>Complete Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
