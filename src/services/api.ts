// src/services/api.ts

// Electron typically runs on localhost or accesses a remote URL. 
// We removed the Android emulator IP check (10.0.2.2).
export const API_BASE_URL = '/api';

export interface WatchlistItem {
    symbol: string;
    dma_period: number;
    alert_threshold: number;
    country?: string;
    last_price: number;
    change: number;
    change_percent: number;
    company_name: string | null;
    last_checked: string;
    last_dma?: number;
}

export interface AlertLog {
    id: number;
    timestamp: string;
    symbol: string;
    message: string;
    alert_type: string;
}

export interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    country: string;
    currency: string;
    instrument_name?: string;
    instrument_type?: string;
    mic_code?: string;
    last_price?: number;
    change?: number;
    change_percent?: number;
}

export interface StockHistoryItem {
    date: string;
    close: number;
    dma50?: number;
    dma100?: number;
    dma200?: number;
}

export const fetchWatchlist = async (): Promise<WatchlistItem[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/watchlist`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch watchlist error:', error);
        throw error;
    }
};

export const deleteWatchlistItem = async (symbol: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/watchlist/${symbol}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Delete failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Delete watchlist item error:', error);
        throw error;
    }
};

export const addToWatchlist = async (symbol: string, country?: string): Promise<void> => {
    try {
        // Explicitly typing payload as any to match original logic, or you could define an interface
        const payload: any = {
            symbol: symbol,
            dma_period: 200,    // Default value
            alert_threshold: 5.0 // Default value
        };
        if (country) {
            payload.country = country;
        }

        const response = await fetch(`${API_BASE_URL}/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Add to watchlist failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Add to watchlist error:', error);
        throw error;
    }
};

export const fetchStockHistory = async (symbol: string, period: string = '1M'): Promise<StockHistoryItem[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stock/${symbol}/history?period=${period}`);
        if (!response.ok) {
            throw new Error(`History fetch failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch stock history error:', error);
        return [];
    }
};

export const searchStocks = async (query: string): Promise<SearchResult[]> => {
    if (!query) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Search failed with status ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error('Search stocks error:', error);
        return [];
    }
};

export const fetchAlerts = async (): Promise<AlertLog[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/logs`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        // Sort by timestamp descending
        const sorted = data.sort((a: AlertLog, b: AlertLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sorted;
    } catch (error) {
        console.error('Fetch alerts error:', error);
        throw error;
    }
};

export const normalizeCountry = (country?: string): 'USA' | 'India' => {
    if (!country) return 'India';
    if (country.toLowerCase() === 'united states' || country.toLowerCase() === 'usa') {
        return 'USA';
    }
    return 'India';
};

// Helper for safer inference
export const inferCountry = (symbol: string, country?: string): 'USA' | 'India' => {
    if (country) return normalizeCountry(country);

    // Heuristic for known US big tech
    const US_STOCKS = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'NVDA', 'META', 'NFLX', 'SPY', 'QQQ', 'AMD', 'INTC', 'CSCO', 'CMCSA', 'PEP', 'ADBE', 'AVGO', 'TXN'];
    if (US_STOCKS.includes(symbol.toUpperCase())) return 'USA';

    return 'India';
};

export const deleteAlert = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/logs/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Delete log failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Delete alert error:', error);
        throw error;
    }
};

export const fetchServerStatus = async (): Promise<{ status: string; service: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) {
            throw new Error(`Status check failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch server status error:', error);
        throw error;
    }
};