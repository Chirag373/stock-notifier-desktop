import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Plus, Check } from 'lucide-react';
import { searchStocks, addToWatchlist, fetchWatchlist, SearchResult } from '../services/api';
import _ from 'lodash';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

export default function SearchScreen() {
    const navigate = useNavigate();
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});

    const styles = {
        container: { flex: 1, padding: '24px', backgroundColor: colors.background, height: '100vh', display: 'flex', flexDirection: 'column' as const },
        header: { display: 'flex', alignItems: 'center', marginBottom: '24px' },
        backButton: {
            border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px', marginRight: '16px',
            display: 'flex', alignItems: 'center', color: colors.text
        },
        inputWrapper: {
            flex: 1, position: 'relative' as const, display: 'flex', alignItems: 'center'
        },
        input: {
            width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: 'none',
            backgroundColor: colors.card, fontSize: '16px', outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)', color: colors.text
        },
        searchIcon: { position: 'absolute' as const, left: '16px', color: colors.textSecondary },
        list: { flex: 1, overflowY: 'auto' as const, paddingBottom: '20px' },
        item: {
            backgroundColor: colors.card, padding: '16px 20px', borderRadius: '12px', marginBottom: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s', cursor: 'pointer'
        },
        symbol: { fontSize: '16px', fontWeight: '700' as const, color: colors.text },
        name: { fontSize: '14px', color: colors.textSecondary, marginTop: '4px' },
        exchangeTag: {
            fontSize: '11px', backgroundColor: colors.background, color: colors.textSecondary,
            padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: '600' as const
        },
        addButton: {
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600' as const, display: 'flex', alignItems: 'center',
            transition: 'all 0.2s'
        }
    };

    // Debounced search logic
    const debouncedSearch = useCallback(
        _.debounce(async (q: string) => {
            if (!q.trim()) {
                setResults([]);
                return;
            }
            try {
                const data = await searchStocks(q);
                setResults(data);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
        // Cancel debounce on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [query, debouncedSearch]);

    // Check what is already in watchlist to show added state
    useEffect(() => {
        fetchWatchlist().then(list => {
            const map: Record<string, boolean> = {};
            list.forEach(item => map[item.symbol] = true);
            setAddingMap(map);
        });
    }, []);

    const handleAdd = async (e: React.MouseEvent, item: SearchResult) => {
        e.stopPropagation();

        // Append suffix for specific exchanges to help Yahoo Finance
        let symbol = item.symbol;
        if (item.exchange === 'NSE') symbol += '.NS';
        else if (item.exchange === 'BSE') symbol += '.BO';
        else if (item.exchange === 'IDX') symbol += '.JK'; // Jakarta

        if (addingMap[symbol]) return;

        setAddingMap(prev => ({ ...prev, [symbol]: true }));
        try {
            await addToWatchlist(symbol, item.country);
            toast.success(`Added ${symbol}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add stock');
            setAddingMap(prev => ({ ...prev, [symbol]: false }));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backButton} onClick={() => navigate(-1)} title="Go back">
                    <ArrowLeft size={24} />
                </button>
                <div style={styles.inputWrapper}>
                    <Search style={styles.searchIcon} size={20} />
                    <input
                        style={styles.input}
                        placeholder="Search for stocks (e.g. AAPL, Reliance)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div style={styles.list}>
                {results.map((item) => (
                    <div
                        key={`${item.symbol}-${item.exchange}`}
                        style={styles.item}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div onClick={() => navigate(`/stock/${item.symbol}`)} style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={styles.symbol}>{item.symbol}</span>
                                <span style={styles.exchangeTag}>{item.exchange}</span>
                            </div>
                            <div style={styles.name}>{item.name || item.instrument_name || item.instrument_type}</div>
                        </div>

                        <button
                            style={{
                                ...styles.addButton,
                                backgroundColor: (addingMap[item.symbol] || (item.exchange === 'NSE' && addingMap[item.symbol + '.NS']) || (item.exchange === 'BSE' && addingMap[item.symbol + '.BO'])) ? colors.success + '20' : colors.primary + '15',
                                color: (addingMap[item.symbol] || (item.exchange === 'NSE' && addingMap[item.symbol + '.NS']) || (item.exchange === 'BSE' && addingMap[item.symbol + '.BO'])) ? colors.success : colors.primary
                            }}
                            onClick={(e) => handleAdd(e, item)}
                            title={(addingMap[item.symbol] || (item.exchange === 'NSE' && addingMap[item.symbol + '.NS']) || (item.exchange === 'BSE' && addingMap[item.symbol + '.BO'])) ? "Already added" : "Add straight to watchlist"}
                        >
                            {(addingMap[item.symbol] || (item.exchange === 'NSE' && addingMap[item.symbol + '.NS']) || (item.exchange === 'BSE' && addingMap[item.symbol + '.BO'])) ? <Check size={16} /> : <Plus size={16} />}
                            <span style={{ marginLeft: '6px' }}>{(addingMap[item.symbol] || (item.exchange === 'NSE' && addingMap[item.symbol + '.NS']) || (item.exchange === 'BSE' && addingMap[item.symbol + '.BO'])) ? 'Added' : 'Add'}</span>
                        </button>
                    </div>
                ))}
                {query && results.length === 0 && (
                    <div style={{ textAlign: 'center', color: colors.textSecondary, marginTop: '40px' }}>
                        No results found
                    </div>
                )}
            </div>
        </div>
    );
}
