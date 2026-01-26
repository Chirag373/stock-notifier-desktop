import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react'; // Web version of Lucide
import { fetchWatchlist, fetchAlerts, WatchlistItem, AlertLog } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const TODAY_DATE = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
});

const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function HomeScreen() {
    const navigate = useNavigate();
    const { colors } = useTheme();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [alerts, setAlerts] = useState<AlertLog[]>([]);

    const styles = {
        container: { flex: 1, padding: '20px', backgroundColor: colors.background, height: '100vh', overflowY: 'auto' as const },
        contentWrapper: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column' as const
        },
        header: { marginBottom: '20px' },
        dateLabel: { fontSize: '14px', color: colors.textSecondary, textTransform: 'uppercase' as const, fontWeight: '600' },
        headerTitle: { fontSize: '32px', fontWeight: '800', color: colors.text, margin: 0 },
        searchBar: {
            backgroundColor: colors.card,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            cursor: 'pointer'
        },
        searchPlaceholder: { marginLeft: '12px', color: colors.textSecondary },
        sectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', marginTop: '10px' },
        sectionTitle: { fontSize: '20px', fontWeight: '700', color: colors.text },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '32px'
        },
        card: {
            backgroundColor: colors.card, padding: '20px', borderRadius: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)', cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' as const,
            display: 'flex', flexDirection: 'column' as const
        },
        alertRow: {
            backgroundColor: colors.card, padding: '16px', borderRadius: '14px',
            marginBottom: '10px', display: 'flex', alignItems: 'center',
            cursor: 'pointer', transition: 'background-color 0.2s'
        },
        avatar: {
            width: '40px', height: '40px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 'bold', marginRight: '16px'
        }
    };

    const loadData = useCallback(async () => {
        try {
            const [wData, aData] = await Promise.all([fetchWatchlist(), fetchAlerts()]);
            setWatchlist(wData);
            setAlerts(aData);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        loadData();
        // Optional: Set up an interval to refresh data in Electron
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleStockPress = (symbol: string) => {
        navigate(`/stock/${symbol}`);
    };

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <div style={styles.dateLabel}>{TODAY_DATE}</div>
                    <h1 style={styles.headerTitle}>Overview</h1>
                </div>

                {/* Search Bar */}
                <div style={styles.searchBar} onClick={() => navigate('/search')} title="Click to search stocks">
                    <Search size={20} color={colors.textSecondary} />
                    <span style={styles.searchPlaceholder}>Search stocks, indices...</span>
                </div>

                {/* Watchlist */}
                <div style={styles.sectionHeader}>
                    <span style={styles.sectionTitle}>Your Watchlist</span>
                </div>

                <div style={styles.grid}>
                    {watchlist.length > 0 ? watchlist.map((item) => {
                        const color = item.change >= 0 ? colors.success : colors.error;
                        return (
                            <div
                                key={item.symbol}
                                style={styles.card}
                                onClick={() => handleStockPress(item.symbol)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: colors.text }}>{item.symbol}</div>
                                        <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                                            {item.company_name || 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color }}>
                                            {item.last_price.toFixed(2)}
                                        </div>
                                        <div style={{
                                            fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: '600',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            backgroundColor: color + '15', color: color
                                        }}>
                                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.change_percent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${colors.border}` }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Alert</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{item.alert_threshold}% away</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Market</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{item.country || 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <div style={{ color: colors.textSecondary }}>No watchlist data</div>}
                </div>

                {/* Recent Alerts */}
                <div style={styles.sectionHeader}>
                    <span style={styles.sectionTitle}>Recent Alerts</span>
                    <span style={{ color: colors.primary, cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/alerts')} title="View all alerts">See All</span>
                </div>

                <div>
                    {alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} style={styles.alertRow} onClick={() => handleStockPress(alert.symbol)}>
                            <div style={{ ...styles.avatar, backgroundColor: colors.primary + '15', color: colors.primary }}>
                                {alert.symbol.substring(0, 1)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold', color: colors.text }}>{alert.symbol}</span>
                                    <span style={{ fontSize: '12px', color: colors.textSecondary }}>{formatTimeAgo(alert.timestamp)}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {alert.message}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
