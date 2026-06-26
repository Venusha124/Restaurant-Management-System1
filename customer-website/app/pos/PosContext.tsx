'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:301/api';

type StoreData = {
    currentUser: any | null;
    categories: any[];
    dishes: any[];
    cart: any[];
    orders: any[];
    inventory: any[];
    customers: any[];
    tables: any[];
    unsyncedOrders: any[];
    isOnline: boolean;
    selectedTableId: any | null;
    selectedCustomerId: any | null;
    currentOrderType: string;
    settings: any;
    audit_logs?: any[];
};

interface PosContextType {
    data: StoreData;
    setData: React.Dispatch<React.SetStateAction<StoreData>>;
    fetchAPI: (endpoint: string, options?: any) => Promise<Response>;
    addToCart: (dish: any, qty?: number) => void;
    removeFromCart: (dishId: any) => void;
    clearCart: () => void;
    socket: Socket | null;
    login: (username: string, password: string) => Promise<{success: boolean, error?: string}>;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<StoreData>({
        currentUser: null, // Will load from localStorage
        categories: [],
        dishes: [],
        cart: [],
        orders: [],
        inventory: [],
        customers: [],
        tables: [],
        unsyncedOrders: [],
        isOnline: true,
        selectedTableId: null,
        selectedCustomerId: null,
        currentOrderType: 'Dine In',
        settings: {
            business_name: 'TASTY OF ASCENDIA',
            currency_symbol: 'Rs.',
            tax_rate: '10'
        }
    });

    const [socket, setSocket] = useState<Socket | null>(null);

    // Initialize Store
    useEffect(() => {
        const storedUser = localStorage.getItem('tasty_user');
        const storedCart = localStorage.getItem('tasty_cart');
        const storedUnsynced = localStorage.getItem('tasty_unsynced');

        let currentUser = null;
        if (storedUser) currentUser = JSON.parse(storedUser);

        setData(prev => ({
            ...prev,
            currentUser,
            cart: storedCart ? JSON.parse(storedCart) : [],
            unsyncedOrders: storedUnsynced ? JSON.parse(storedUnsynced) : []
        }));

        loadData(currentUser);

        // Init Socket
        const newSocket = io('http://localhost:301');
        setSocket(newSocket);
        
        newSocket.on('new_order', (order: any) => {
            setData(prev => {
                if (!prev.orders.find(o => o.id === order.id)) {
                    return { ...prev, orders: [order, ...prev.orders] };
                }
                return prev;
            });
        });

        newSocket.on('order_updated', (updatedData: any) => {
            setData(prev => ({
                ...prev,
                orders: prev.orders.map(o => o.id === updatedData.id ? { ...o, ...updatedData } : o)
            }));
        });

        return () => { newSocket.disconnect(); };
    }, []);

    const fetchAPI = async (endpoint: string, options: any = {}) => {
        const url = `${API_URL}${endpoint}`;
        const headers: any = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Get user from state or fallback to localStorage (solves reload race condition)
        let user = data.currentUser;
        if (!user && typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('tasty_user');
            if (storedUser) user = JSON.parse(storedUser);
        }

        if (user) {
            headers['x-user-id'] = user.id;
            headers['x-user-role'] = user.role;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            if (response.status === 401 || response.status === 403) {
                const errorData = await response.json();
                if (response.status === 401) {
                    localStorage.removeItem('tasty_user');
                    window.location.href = '/pos/login';
                }
                throw new Error(errorData.error);
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const loadData = async (user: any) => {
        try {
            const endpoints = [
                fetchAPI('/categories').then(r => r.json()),
                fetchAPI('/dishes').then(r => r.json()),
                fetchAPI('/orders').then(r => r.json()),
                fetchAPI('/customers').then(r => r.json()),
                fetchAPI('/tables').then(r => r.json()),
                fetchAPI('/settings').then(r => r.json())
            ];

            if (user && user.role === 'admin') {
                endpoints.push(fetchAPI('/inventory').then(r => r.json()).catch(() => []));
                endpoints.push(fetchAPI('/audit-logs').then(r => r.json()).catch(() => []));
            } else {
                endpoints.push(Promise.resolve([]));
                endpoints.push(Promise.resolve([]));
            }

            const [categories, dishes, orders, customers, tables, settings, inventory, auditLogs] = await Promise.all(endpoints);

            setData(prev => ({
                ...prev,
                categories: categories.map((c: any) => ({
                    ...c,
                    count: dishes.filter((d: any) => d.category_id === c.id).length
                })),
                dishes,
                orders,
                customers,
                tables,
                settings,
                inventory,
                audit_logs: auditLogs
            }));
        } catch (err) {
            console.error('Failed to load initial data', err);
        }
    };

    const addToCart = (dish: any, qty = 1) => {
        setData(prev => {
            const cart = [...prev.cart];
            const existing = cart.find(item => item.dish.id === dish.id);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ dish, qty });
            }
            localStorage.setItem('tasty_cart', JSON.stringify(cart));
            return { ...prev, cart };
        });
    };

    const removeFromCart = (dishId: any) => {
        setData(prev => {
            const cart = prev.cart.filter(item => item.dish.id !== dishId);
            localStorage.setItem('tasty_cart', JSON.stringify(cart));
            return { ...prev, cart };
        });
    };

    const clearCart = () => {
        setData(prev => {
            localStorage.removeItem('tasty_cart');
            return { ...prev, cart: [] };
        });
    };

    const login = async (username: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            if (res.ok && result.user) {
                localStorage.setItem('tasty_user', JSON.stringify(result.user));
                setData(prev => ({ ...prev, currentUser: result.user }));
                await loadData(result.user);
                return { success: true };
            }
            return { success: false, error: result.error || 'Login failed' };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    return (
        <PosContext.Provider value={{ data, setData, fetchAPI, addToCart, removeFromCart, clearCart, socket, login }}>
            {children}
        </PosContext.Provider>
    );
}

export function usePos() {
    const context = useContext(PosContext);
    if (context === undefined) {
        throw new Error('usePos must be used within a PosProvider');
    }
    return context;
}
