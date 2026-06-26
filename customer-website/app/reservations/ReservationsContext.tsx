'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:302/api'; // Reservation API on port 302

type StoreData = {
    customers: any[];
    eventRooms: any[];
    reservations: any[];
    inquiries: any[];
    waitlist: any[];
    maintenanceTasks: any[];
    settings: any;
    currentUser: any;
    isOnline: boolean;
};

type ReservationsContextType = {
    data: StoreData;
    setData: React.Dispatch<React.SetStateAction<StoreData>>;
    fetchAPI: (endpoint: string, options?: any) => Promise<any>;
    refreshData: () => Promise<void>;
};

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<StoreData>({
        customers: [],
        eventRooms: [],
        reservations: [],
        inquiries: [],
        waitlist: [],
        maintenanceTasks: [],
        settings: { business_name: 'ASCENDIA', currency_symbol: 'Rs.' },
        currentUser: { id: 1, name: 'Admin User', role: 'admin' }, // Mocking for now, similar to POS initial setup
        isOnline: true
    });

    const fetchAPI = async (endpoint: string, options: any = {}) => {
        const url = `${API_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response;
    };

    const refreshData = async () => {
        try {
            const [customers, eventRooms, reservations, inquiries, waitlist, maintenanceTasks, settings] = await Promise.all([
                fetchAPI('/customers').then(r => r.json()).catch(() => []),
                fetchAPI('/event-rooms').then(r => r.json()).catch(() => []),
                fetchAPI('/reservations').then(r => r.json()).catch(() => []),
                fetchAPI('/inquiries').then(r => r.json()).catch(() => []),
                fetchAPI('/waitlist').then(r => r.json()).catch(() => []),
                fetchAPI('/maintenance-tasks').then(r => r.json()).catch(() => []),
                fetchAPI('/settings').then(r => r.json()).catch(() => ({ business_name: 'ASCENDIA', currency_symbol: 'Rs.' }))
            ]);

            setData(prev => ({
                ...prev,
                customers,
                eventRooms,
                reservations,
                inquiries,
                waitlist,
                maintenanceTasks,
                settings
            }));
        } catch (error) {
            console.error('Store refresh error:', error);
        }
    };

    useEffect(() => {
        refreshData();
        
        // Handle online/offline
        const handleOnline = () => setData(prev => ({ ...prev, isOnline: true }));
        const handleOffline = () => setData(prev => ({ ...prev, isOnline: false }));
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ReservationsContext.Provider value={{ data, setData, fetchAPI, refreshData }}>
            {children}
        </ReservationsContext.Provider>
    );
}

export function useReservations() {
    const context = useContext(ReservationsContext);
    if (context === undefined) {
        throw new Error('useReservations must be used within a ReservationsProvider');
    }
    return context;
}
