import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, TrendingUp, Activity, Bell } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { fetchWatchlist, fetchStockHistory, deleteWatchlistItem, WatchlistItem, StockHistoryItem } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const periods = ['1M', '6M', '1Y', '2Y', '5Y', 'Max'];

export default function StockDetailScreen() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const { colors, isDarkMode } = useTheme();
    const [stockData, setStockData] = useState<WatchlistItem | null>(null);
    const [history, setHistory] = useState<StockHistoryItem[]>([]);
    const [period, setPeriod] = useState('1Y');
    const [loading, setLoading] = useState(true);

    const styles = {
        container: { flex: 1, display: 'flex', flexDirection: 'column' as const, backgroundColor: colors.background, height: '100vh', overflowY: 'auto' as const },
        header: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px', backgroundColor: colors.card, borderBottom: `1px solid ${colors.border}`
        },
        backButton: {
            border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px',
            display: 'flex', alignItems: 'center', color: colors.text
        },
        titleSection: { flex: 1, marginLeft: '16px' },
        symbolTitle: { fontSize: '24px', fontWeight: '800' as const, margin: 0, color: colors.text },
        companyName: { fontSize: '14px', color: colors.textSecondary },
        priceSection: { textAlign: 'right' as const },
        currentPrice: { fontSize: '24px', fontWeight: '700' as const },
        deleteButton: {
            padding: '10px', backgroundColor: isDarkMode ? '#2c2c2e' : '#FFE5E5', borderRadius: '8px', color: colors.error,
            border: 'none', cursor: 'pointer', marginLeft: '20px'
        },
        chartContainer: {
            backgroundColor: colors.card, margin: '20px', padding: '20px', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '400px'
        },
        periodSelector: {
            display: 'flex', justifyContent: 'center', marginBottom: '16px', gap: '8px'
        },
        periodButton: {
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600' as const, transition: 'all 0.2s'
        },
        statsGrid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px', padding: '0 20px 20px 20px'
        },
        statCard: {
            backgroundColor: colors.card, padding: '16px', borderRadius: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        },
        statLabel: { fontSize: '13px', color: colors.textSecondary, marginBottom: '4px' },
        statValue: { fontSize: '18px', fontWeight: '700' as const, color: colors.text }
    };

    useEffect(() => {
        if (!symbol) return;

        const load = async () => {
            setLoading(true);
            try {
                // 1. Fetch Basic Info (from Watchlist for now, ideally a dedicated endpoint)
                const watchlist = await fetchWatchlist();
                const item = watchlist.find(w => w.symbol === symbol);
                if (item) setStockData(item);

                // 2. Fetch History
                const historyData = await fetchStockHistory(symbol, period);
                setHistory(historyData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [symbol, period]);

    const handleDelete = async () => {
        if (!symbol) return;
        if (confirm(`Are you sure you want to remove ${symbol} from your watchlist?`)) {
            try {
                await deleteWatchlistItem(symbol);
                navigate('/');
            } catch (e) {
                alert('Failed to delete');
            }
        }
    };

    if (!stockData && !loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
                <h2>Stock not found in watchlist</h2>
                <button onClick={() => navigate('/')} style={{ marginTop: 20 }}>Go Home</button>
            </div>
        );
    }

    const priceColor = (stockData?.change || 0) >= 0 ? colors.success : colors.error;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={styles.backButton} onClick={() => navigate(-1)} title="Go back">
                        <ArrowLeft size={24} />
                    </button>
                    <div style={styles.titleSection}>
                        <h1 style={styles.symbolTitle} title={symbol}>{symbol}</h1>
                        <span style={styles.companyName}>{stockData?.company_name || 'Stock Detail'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={styles.priceSection}>
                        <div style={{ ...styles.currentPrice, color: priceColor }}>
                            {stockData?.last_price.toFixed(2)}
                        </div>
                        <div style={{ color: priceColor, fontSize: '14px', fontWeight: '600' }}>
                            {(stockData?.change || 0) > 0 ? '+' : ''}{stockData?.change.toFixed(2)} ({stockData?.change_percent.toFixed(2)}%)
                        </div>
                    </div>
                    <button style={styles.deleteButton} onClick={handleDelete} title="Remove from Watchlist">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Chart Section */}
            <div style={styles.chartContainer}>
                <div style={styles.periodSelector}>
                    {periods.map(p => (
                        <button
                            key={p}
                            style={{
                                ...styles.periodButton,
                                backgroundColor: period === p ? (isDarkMode ? '#3a3a3c' : colors.text) : (isDarkMode ? '#1c1c1e' : '#eee'),
                                color: period === p ? '#FFF' : colors.text
                            }}
                            onClick={() => setPeriod(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#eee"} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: colors.textSecondary }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                minTickGap={30}
                            />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.textSecondary }} orientation="right" />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: colors.card }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Line type="monotone" dataKey="close" stroke={colors.primary} strokeWidth={2} dot={false} name="Price" />
                            <Line type="monotone" dataKey="dma50" stroke="#FF9500" strokeWidth={1.5} dot={false} name="50 DMA" />
                            <Line type="monotone" dataKey="dma200" stroke="#AF52DE" strokeWidth={1.5} dot={false} name="200 DMA" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <StatCard
                    label="Last Updated"
                    value={stockData?.last_checked ? new Date(stockData.last_checked).toLocaleString() : '-'}
                    icon={<Activity size={18} color={colors.primary} />}
                    styles={styles}
                />
                <StatCard
                    label="Alert Threshold"
                    value={`${stockData?.alert_threshold}%`}
                    icon={<Bell size={18} color="#FF9500" />}
                    styles={styles}
                />
                <StatCard
                    label="Monitoring"
                    value={`${stockData?.dma_period} DMA`}
                    icon={<TrendingUp size={18} color="#AF52DE" />}
                    styles={styles}
                />
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon, styles }: any) => (
    <div style={styles.statCard}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {icon}
            <span style={{ marginLeft: '8px', ...styles.statLabel, marginBottom: 0 }}>{label}</span>
        </div>
        <div style={styles.statValue}>{value}</div>
    </div>
);
