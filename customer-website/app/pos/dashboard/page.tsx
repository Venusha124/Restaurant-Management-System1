'use client';

import React, { useEffect, useState } from 'react';
import { usePos } from '../PosContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
    const { data, fetchAPI } = usePos();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const res = await fetchAPI('/analytics');
                const result = await res.json();
                setAnalytics(result);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div className="status-pulse" style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Syncing Enterprise Data...</div>
            </div>
        );
    }

    if (!analytics) return null;

    const popularity = analytics.popularity || [];
    const weeklyTrends = analytics.weeklyTrends || [];
    const lowStockAlerts = analytics.lowStockAlerts || [];
    const currency = data.settings.currency_symbol || 'Rs.';

    const trend = weeklyTrends.length >= 2 
        ? (((weeklyTrends[0].revenue - weeklyTrends[1].revenue) / weeklyTrends[1].revenue) * 100).toFixed(1)
        : 0;
    
    const chartData = {
        labels: [...weeklyTrends].reverse().map(t => new Date(t.date).toLocaleDateString([], {month: 'short', day: 'numeric'})),
        datasets: [{
            label: 'Daily Revenue',
            data: [...weeklyTrends].reverse().map(t => t.revenue),
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.1)',
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#00f2fe',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: '#111827',
                titleColor: '#9ca3af',
                bodyColor: '#fff',
                bodyFont: { weight: 'bold', size: 14 },
                padding: 12,
                borderRadius: 10,
                displayColors: false,
                callbacks: {
                    label: (context: any) => `${currency}${context.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            x: { 
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#9ca3af', font: { size: 12 } }
            },
            y: { 
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { 
                    color: '#9ca3af', 
                    font: { size: 12 },
                    callback: (val: any) => `${currency}${val/1000}k`
                }
            }
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .dashboard-layout { display: flex; flex-direction: column; gap: 32px; height: 100%; overflow-y: auto; padding-right: 12px; animation: fadeIn 0.5s ease-out; }
                .dashboard-layout::-webkit-scrollbar { width: 6px; }
                .dashboard-layout::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .dash-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .stats-grid { display: grid; gap: 24px; }
                .stat-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border-radius: 24px; padding: 28px; display: flex; align-items: center; gap: 24px; border: 1px solid var(--glass-border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .stat-card:hover { transform: translateY(-5px); border-color: var(--primary); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
                .stat-icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); }
                .stat-info .stat-value { font-weight: 800; color: var(--text-main); letter-spacing: -1px; }
                .stat-trend.positive { color: #10b981; }
                .stat-trend.negative { color: #ef4444; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            `}} />
            <div className="dashboard-layout">
            <div className="dash-header">
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>Business Intelligence</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Real-time performance analytics for your restaurant.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {lowStockAlerts.length > 0 && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '12px' }}>
                            <i className="fa-solid fa-triangle-exclamation"></i> {lowStockAlerts.length} STOCK ALERTS
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(0,0,0,0) 100%)', borderLeft: '4px solid var(--primary)' }}>
                    <div className="stat-icon" style={{ background: 'var(--primary)', color: '#000' }}><i className="fa-solid fa-dollar-sign"></i></div>
                    <div className="stat-info">
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Revenue</h4>
                        <div className="stat-value" style={{ fontSize: '32px' }}>{currency}{Number(analytics.totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <div className={`stat-trend ${Number(trend) >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <i className={`fa-solid fa-arrow-trend-${Number(trend) >= 0 ? 'up' : 'down'}`}></i> {trend}% <span style={{ fontWeight: 500, opacity: 0.7 }}>vs last week</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 100%)', borderLeft: '4px solid #6366f1' }}>
                    <div className="stat-icon" style={{ background: '#6366f1', color: '#fff' }}><i className="fa-solid fa-chart-simple"></i></div>
                    <div className="stat-info">
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>Today's Sales</h4>
                        <div className="stat-value" style={{ fontSize: '32px' }}>{currency}{Number(analytics.todayRevenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '13px', color: '#6366f1', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 2s infinite' }}></span> LIVE TRACKING
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(0,0,0,0) 100%)', borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-icon" style={{ background: '#f59e0b', color: '#fff' }}><i className="fa-solid fa-users"></i></div>
                    <div className="stat-info">
                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>Customer Base</h4>
                        <div className="stat-value" style={{ fontSize: '32px' }}>{data.customers.length}</div>
                        <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
                            LOYALTY MEMBERS
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash-bottom" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
                <div className="card" style={{ padding: '32px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Sales Performance</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Revenue trends over the last 14 days</p>
                        </div>
                        <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                            <i className="fa-solid fa-calendar-days"></i> 14 DAY VIEW
                        </div>
                    </div>
                    <div style={{ height: '350px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '28px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Top Performers</h3>
                            <i className="fa-solid fa-crown" style={{ color: '#f59e0b' }}></i>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {popularity.slice(0, 5).map((item: any, idx: number) => {
                                const maxRev = Math.max(...popularity.map((p: any) => p.revenue), 1);
                                const percentage = (item.revenue / maxRev) * 100;
                                return (
                                    <div key={idx} style={{ display: 'grid', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>{idx + 1}</span>
                                                {item.name}
                                            </div>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>{currency}{(item.revenue || 0).toFixed(2)}</div>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, var(--primary) 0%, #6366f1 100%)', borderRadius: '10px' }}></div>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.units_sold} orders today</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '28px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Operational Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '18px' }}>
                                    <i className="fa-solid fa-clock"></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Prep Time</div>
                                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-main)' }}>14.2 min <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}><i className="fa-solid fa-caret-down"></i> 2.1m</span></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '18px' }}>
                                    <i className="fa-solid fa-utensils"></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Table Turnover</div>
                                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-main)' }}>48 min <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}><i className="fa-solid fa-caret-up"></i> 4m</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
