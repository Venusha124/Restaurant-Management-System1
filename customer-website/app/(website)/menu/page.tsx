'use client';

import React, { useEffect, useState } from 'react';

export default function MenuPage() {
    const [dishes, setDishes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const [dishesRes, categoriesRes] = await Promise.all([
                    fetch('http://localhost:301/api/dishes'),
                    fetch('http://localhost:301/api/categories')
                ]);
                
                const dishesData = await dishesRes.json();
                const categoriesData = await categoriesRes.json();
                
                setDishes(dishesData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching menu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const filteredDishes = activeFilter === 'all' 
        ? dishes 
        : dishes.filter(d => String(d.category_id) === String(activeFilter));

    const getCategoryName = (id: string | number) => {
        const cat = categories.find(c => String(c.id) === String(id));
        return cat ? cat.name : id;
    };

    return (
        <div>
            {/* Page Header */}
            <header className="page-header" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
                <div className="page-header-overlay"></div>
                <div className="page-header-content">
                    <h1 className="fade-in-up">Our Menu</h1>
                    <p className="fade-in-up delay-1">Culinary masterpieces crafted with passion.</p>
                </div>
            </header>

            {/* Menu Section */}
            <section className="section-container">
                <div className="section-header text-center fade-in-up">
                    <h5 className="subtitle">Discover</h5>
                    <h2>Culinary Delights</h2>
                    <p>Our seasonal menu features the finest ingredients locally sourced and expertly prepared by our award-winning culinary team.</p>
                </div>

                <div className="category-filters fade-in-up delay-1" id="categoryFilters">
                    <button 
                        className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            className={`filter-btn ${String(activeFilter) === String(cat.id) ? 'active' : ''}`}
                            onClick={() => setActiveFilter(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading menu...</div>
                ) : (
                    <div className="menu-grid" id="menuGrid">
                        {filteredDishes.length === 0 ? (
                            <p>No dishes found for this category.</p>
                        ) : (
                            filteredDishes.map(dish => (
                                <div key={dish.id} className="dish-card fade-in-up">
                                    {dish.image ? (
                                        <img src={dish.image} alt={dish.name} className="dish-img" onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<div class="dish-img-placeholder"><i class="fa-solid fa-utensils"></i></div>' }} />
                                    ) : (
                                        <div className="dish-img-placeholder"><i className="fa-solid fa-utensils"></i></div>
                                    )}
                                    <div className="dish-content">
                                        <div className="dish-header">
                                            <h3 className="dish-title">{dish.name}</h3>
                                            <span className="dish-price">${dish.price?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <span className="dish-category">{getCategoryName(dish.category_id)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
