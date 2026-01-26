import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Outlet } from 'react-router-dom';
import { Home, Bell, Heart, Settings } from 'lucide-react';
import HomeScreen from './screens/HomeScreen';

import SearchScreen from './screens/SearchScreen';

import StockDetailScreen from './screens/StockDetailScreen';

import WatchlistScreen from './screens/WatchlistScreen';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import SettingsScreen from './screens/SettingsScreen';
import AlertsScreen from './screens/AlertsScreen';

// Placeholder components
const Placeholder = ({ title }: { title: string }) => <div style={{ padding: 20 }}><h1>{title}</h1></div>;

// Layout component to keep the Sidebar/Navbar persistent
const Layout = () => {
    const { colors, isDarkMode } = useTheme();
    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: colors.background, color: colors.text }}>
            {/* Sidebar */}
            <nav style={{ width: '80px', borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', backgroundColor: colors.sidebar, transition: 'background-color 0.2s, border-color 0.2s' }}>
                <NavItem to="/" icon={<Home size={24} />} label="Home" />
                <NavItem to="/alerts" icon={<Bell size={24} />} label="Alerts" />
                <NavItem to="/watchlist" icon={<Heart size={24} />} label="Watch" />
                <NavItem to="/settings" icon={<Settings size={24} />} label="Set" />
            </nav>
            {/* Main Content Area */}
            <main style={{ flex: 1, overflow: 'hidden' }}>
                <Outlet />
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label }: any) => {
    const { colors } = useTheme();
    return (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px', textDecoration: 'none', marginBottom: '10px',
                color: isActive ? colors.primary : colors.textSecondary,
                borderRadius: '8px',
                transition: 'color 0.2s'
            })}
        >
            {icon}
            <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 500 }}>{label}</span>
        </NavLink>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomeScreen />} />
                        <Route path="alerts" element={<AlertsScreen />} />
                        <Route path="watchlist" element={<WatchlistScreen />} />
                        <Route path="settings" element={<SettingsScreen />} />
                        <Route path="search" element={<SearchScreen />} />
                        <Route path="stock/:symbol" element={<StockDetailScreen />} />
                    </Route>
                </Routes>
                <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            </Router>
        </ThemeProvider>
    );
}
