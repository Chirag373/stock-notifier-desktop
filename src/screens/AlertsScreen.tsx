import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { fetchAlerts, deleteAlert, AlertLog } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `Just now`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function AlertsScreen() {
    const navigate = useNavigate();
    const { colors, isDarkMode } = useTheme();
    const [alerts, setAlerts] = useState<AlertLog[]>([]);
    const [loading, setLoading] = useState(true);

    const styles = {
        container: { flex: 1, padding: '24px', backgroundColor: colors.background, height: '100vh', overflowY: 'auto' as const },
        contentWrapper: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column' as const
        },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
        title: { fontSize: '28px', fontWeight: '800' as const, margin: 0, color: colors.text },
        list: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
        alertItem: {
            backgroundColor: colors.card,
            padding: '20px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative' as const,
            cursor: 'pointer'
        },
        iconContainer: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: colors.primary + '15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px',
            flexShrink: 0
        },
        content: { flex: 1 },
        symbolRow: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
        symbol: { fontSize: '18px', fontWeight: '800' as const, marginRight: '12px', color: colors.text },
        timeTag: {
            fontSize: '12px',
            color: colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#2c2c2e' : '#f5f5f5',
            padding: '4px 8px',
            borderRadius: '6px'
        },
        message: { fontSize: '15px', color: colors.text, lineHeight: '1.5' },
        deleteButton: {
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: colors.textSecondary,
            transition: 'all 0.2s',
            marginLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        emptyState: {
            textAlign: 'center' as const,
            padding: '60px 20px',
            color: colors.textSecondary,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center'
        }
    };

    const loadData = useCallback(async () => {
        try {
            const data = await fetchAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            // Optimistic update
            setAlerts(prev => prev.filter(a => a.id !== id));
            await deleteAlert(id.toString());
            toast.success('Alert deleted');
        } catch (error) {
            console.error('Delete error', error);
            toast.error('Failed to delete alert');
            loadData(); // Revert on failure
        }
    };

    const handleItemClick = (symbol: string) => {
        navigate(`/stock/${symbol}`);
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>Loading alerts...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Alerts</h1>
                        <div style={{ color: colors.textSecondary, marginTop: '4px' }}>
                            {alerts.length > 0
                                ? `You have ${alerts.length} recent notifications`
                                : 'No new notifications'}
                        </div>
                    </div>
                </div>

                <div style={styles.list}>
                    {alerts.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '40px',
                                backgroundColor: isDarkMode ? '#2c2c2e' : '#f5f5f5', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', marginBottom: '20px'
                            }}>
                                <AlertCircle size={40} color={colors.textSecondary} />
                            </div>
                            <h3>All caught up!</h3>
                            <p>When stock prices cross your thresholds, they will appear here.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                style={styles.alertItem}
                                onClick={() => handleItemClick(alert.symbol)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                                }}
                            >
                                <div style={styles.iconContainer}>
                                    <AlertCircle size={24} color={colors.primary} />
                                </div>

                                <div style={styles.content}>
                                    <div style={styles.symbolRow}>
                                        <span style={styles.symbol}>{alert.symbol}</span>
                                        <div style={styles.timeTag} title={formatFullDate(alert.timestamp)}>
                                            <Clock size={12} style={{ marginRight: '4px' }} />
                                            {formatTimeAgo(alert.timestamp)}
                                        </div>
                                    </div>
                                    <div style={styles.message}>
                                        {alert.message}
                                    </div>
                                </div>

                                <button
                                    style={styles.deleteButton}
                                    onClick={(e) => handleDelete(e, alert.id)}
                                    title="Dismiss alert"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FFE5E5';
                                        e.currentTarget.style.color = colors.error;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = colors.textSecondary;
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div style={{
                                    display: 'flex', alignItems: 'center', opacity: 0.3,
                                    marginLeft: '12px', color: colors.text
                                }}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
