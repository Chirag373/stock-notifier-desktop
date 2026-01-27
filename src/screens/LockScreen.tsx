import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface LockScreenProps {
    onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
    const { colors, isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const EXPECTED_EMAIL = 'csp.stoploss@gmail.com';
    const EXPECTED_PASS = 'cyruspatel0299';

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() === EXPECTED_EMAIL && password === EXPECTED_PASS) {
            onUnlock();
        } else {
            setError('Invalid credentials');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '5px',
        border: `1px solid ${colors.border}`,
        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
        color: colors.text,
        fontSize: '14px',
        boxSizing: 'border-box' as const,
        outline: 'none'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(240,240,240,0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        }}>
            <div style={{
                backgroundColor: colors.card,
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: '300px',
                textAlign: 'center',
                border: `1px solid ${colors.border}`
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: colors.text }}>Login</h3>

                <form onSubmit={handleUnlock}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        placeholder="Email"
                        autoFocus
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        placeholder="Password"
                    />

                    {error && (
                        <div style={{ color: 'red', marginBottom: '10px', fontSize: '12px' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: colors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Unlock
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LockScreen;
