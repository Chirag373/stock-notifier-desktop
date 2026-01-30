import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, ArrowRight, Trash2 } from 'lucide-react';
import { fetchWatchlist, WatchlistItem, deleteWatchlistItem } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `Just now`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function WatchlistScreen() {
    const navigate = useNavigate();
    const { colors } = useTheme();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const styles = {
        container: { flex: 1, padding: '24px', paddingBottom: '100px', backgroundColor: colors.background, height: '100vh', overflowY: 'auto' as const },
        contentWrapper: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column' as const
        },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
        title: { fontSize: '28px', fontWeight: '800' as const, margin: 0, color: colors.text },
        addButton: {
            backgroundColor: colors.primary, color: '#FFF', border: 'none',
            padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' as const,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(0,122,255,0.2)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
        },
        card: {
            backgroundColor: colors.card, padding: '20px', borderRadius: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)', cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' as const
        },
        deleteButton: {
            position: 'absolute' as const,
            top: '8px',
            right: '8px',
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: colors.card,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'pointer',
            color: colors.error,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s, transform 0.2s',
            zIndex: 10
        },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
        symbol: { fontSize: '18px', fontWeight: '800' as const, color: colors.text },
        companyName: { fontSize: '13px', color: colors.textSecondary, marginTop: '4px', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, maxWidth: '140px' },
        priceContainer: { textAlign: 'right' as const, paddingTop: '16px' },
        price: { fontSize: '20px', fontWeight: '700' as const, marginBottom: '4px' },
        changeBadge: {
            fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' as const,
            display: 'inline-flex', alignItems: 'center', gap: '4px'
        },
        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${colors.border}` },
        statLabel: { fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
        statValue: { fontSize: '13px', fontWeight: '600' as const, color: colors.text }
    };

    const loadData = useCallback(async () => {
        try {
            const data = await fetchWatchlist();
            setWatchlist(data);
        } catch (error) {
            console.error('Failed to load watchlist', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCardClick = (symbol: string) => {
        navigate(`/stock/${symbol}`);
    };

    const handleDelete = async (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation();
        if (window.confirm(`Remove ${symbol} from watchlist?`)) {
            try {
                await deleteWatchlistItem(symbol);
                toast.success(`${symbol} removed from watchlist`);
                loadData(); // Reload list
            } catch (error) {
                toast.error(`Failed to remove ${symbol}`);
            }
        }
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>Loading watchlist...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Watchlist</h1>
                        <div style={{ color: colors.textSecondary, marginTop: '4px' }}>
                            {watchlist.length} stocks are being monitored
                        </div>
                    </div>
                    <button style={styles.addButton} onClick={() => navigate('/search')} title="Add new stock">
                        <Plus size={18} /> Add Stock
                    </button>
                </div>

                {watchlist.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '60px', color: colors.textSecondary }}>
                        <p>Your watchlist is empty.</p>
                        <button style={{ ...styles.addButton, margin: '20px auto' }} onClick={() => navigate('/search')}>
                            Start building your portfolio
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {watchlist.map((item) => {
                            const isPositive = item.change >= 0;
                            const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
                            const color = isPositive ? colors.success : colors.error;

                            return (
                                <div
                                    key={item.symbol}
                                    style={styles.card}
                                    onClick={() => handleCardClick(item.symbol)}
                                    className="watchlist-card"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                                        const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                                        if (btn) btn.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                                        const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                                        if (btn) btn.style.opacity = '0';
                                    }}
                                >
                                    <button
                                        className="delete-btn"
                                        style={styles.deleteButton}
                                        onClick={(e) => handleDelete(e, item.symbol)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.card}
                                        title="Remove from watchlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div style={styles.cardHeader}>
                                        <div>
                                            <div style={styles.symbol}>{item.symbol}</div>
                                            <div style={styles.companyName} title={item.company_name || ''}>{item.company_name || 'N/A'}</div>
                                        </div>
                                        <div style={styles.priceContainer}>
                                            <div style={{ ...styles.price, color }}>
                                                {item.last_price.toFixed(2)}
                                            </div>
                                            <div style={{
                                                ...styles.changeBadge,
                                                backgroundColor: color + '15',
                                                color: color
                                            }}>
                                                <ChangeIcon size={12} />
                                                {isPositive ? '+' : ''}{item.change.toFixed(2)} ({item.change_percent.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.footer}>
                                        <div>
                                            <div style={styles.statLabel}>Next Alert</div>
                                            <div style={styles.statValue}>
                                                {item.last_dma
                                                    ? `${Math.abs((item.last_price - item.last_dma) / item.last_dma * 100).toFixed(2)}% away`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={styles.statLabel}>Updated</div>
                                            <div style={styles.statValue}>{formatTimeAgo(item.last_checked)}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={styles.statLabel}>Market</div>
                                            <div style={styles.statValue}>{item.country || 'Unknown'}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
