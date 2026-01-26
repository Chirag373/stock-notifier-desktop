import React, { useState } from 'react';
import { Bell, Moon, Sun, ChevronRight, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const [notifications, setNotifications] = useState(true);

    const styles = {
        container: { flex: 1, padding: '24px', backgroundColor: colors.background, height: '100vh', overflowY: 'auto' as const },
        contentWrapper: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column' as const
        },
        header: { marginBottom: '32px' },
        title: { fontSize: '28px', fontWeight: '800' as const, margin: 0, color: colors.text },
        section: { marginBottom: '32px' },
        sectionTitle: { fontSize: '14px', fontWeight: 'bold' as const, color: colors.textSecondary, marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
        card: {
            backgroundColor: colors.card,
            borderRadius: '16px',
            overflow: 'hidden' as const,
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        },
        row: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
        },
        rowContent: { display: 'flex', alignItems: 'center' },
        iconContainer: {
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '16px'
        },
        label: { fontSize: '16px', fontWeight: '500' as const, color: colors.text },
        subLabel: { fontSize: '13px', color: colors.textSecondary, marginTop: '2px' },
        value: { fontSize: '14px', color: colors.textSecondary, display: 'flex', alignItems: 'center' },
        toggle: {
            width: '44px', height: '24px', borderRadius: '12px',
            backgroundColor: isDarkMode ? '#3a3a3c' : '#e5e5ea', position: 'relative' as const,
            cursor: 'pointer', transition: 'background-color 0.2s'
        },
        toggleActive: { backgroundColor: colors.primary },
        toggleHandle: {
            width: '20px', height: '20px', borderRadius: '10px',
            backgroundColor: 'white', position: 'absolute' as const, top: '2px', left: '2px',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        toggleHandleActive: { transform: 'translateX(20px)' }
    };

    const SettingRow = ({ icon, label, subLabel, type = 'arrow', value, isActive, onToggle, color = colors.primary }: any) => {
        const [hover, setHover] = useState(false);

        return (
            <div
                style={{ ...styles.row, backgroundColor: hover ? (isDarkMode ? '#2c2c2e' : '#f9f9f9') : colors.card }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={type === 'toggle' ? onToggle : (onToggle as any)} // Using onToggle as generic click handler for 'arrow' type if provided
            >
                <div style={styles.rowContent}>
                    <div style={{ ...styles.iconContainer, backgroundColor: color + '15' }}>
                        {React.cloneElement(icon, { size: 20, color: color })}
                    </div>
                    <div>
                        <div style={styles.label}>{label}</div>
                        {subLabel && <div style={styles.subLabel}>{subLabel}</div>}
                    </div>
                </div>

                <div>
                    {type === 'arrow' && <ChevronRight size={20} color="#ccc" />}
                    {type === 'value' && (
                        <div style={styles.value}>
                            {value} <ChevronRight size={16} style={{ marginLeft: '8px' }} color="#ccc" />
                        </div>
                    )}
                    {type === 'toggle' && (
                        <div style={{ ...styles.toggle, ...(isActive ? styles.toggleActive : {}) }}>
                            <div style={{ ...styles.toggleHandle, ...(isActive ? styles.toggleHandleActive : {}) }} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleClearCache = () => {
        if (window.confirm('This will reset your local preferences (e.g. theme). Are you sure?')) {
            localStorage.clear();
            // Optionally clear session storage
            sessionStorage.clear();

            // If using a service worker, unregister it (optional, but good for "Clear Cache")
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
            }

            // Force reload to apply changes
            window.location.reload();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Settings</h1>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Preferences</div>
                    <div style={styles.card}>
                        <SettingRow
                            icon={isDarkMode ? <Moon /> : <Sun />}
                            label="Dark Mode"
                            type="toggle"
                            isActive={isDarkMode}
                            onToggle={toggleTheme}
                            color="#5856D6"
                        />
                        <SettingRow
                            icon={<Bell />}
                            label="Notifications"
                            subLabel="Receive alerts for stock changes"
                            type="toggle"
                            isActive={notifications}
                            onToggle={() => setNotifications(!notifications)}
                            color="#FF9500"
                        />
                    </div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Data & Sync</div>
                    <div style={styles.card}>
                        <SettingRow
                            icon={<Trash2 />}
                            label="Clear Cache"
                            type="arrow"
                            color={colors.error}
                            subLabel="Clear local app data"
                            onToggle={handleClearCache} // Reusing onToggle for click action since row handles onClick
                        />
                    </div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>App Info</div>
                    <div style={styles.card}>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>Stock Notifier</div>
                            <div style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '4px' }}>Version 1.0.0</div>
                            <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '16px' }}>
                                Built with Electron, React & Python
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
