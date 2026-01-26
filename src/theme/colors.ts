export const lightColors = {
    background: '#F5F5F7',
    white: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    primary: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
    border: '#E5E5EA',
    card: '#FFFFFF',
    sidebar: '#FFFFFF'
};

export const darkColors = {
    background: '#000000',
    white: '#1C1C1E', // Using 'white' key for card background to minimize refactor if mapped dynamically, but explicit 'card' is better.
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    primary: '#0A84FF',
    success: '#30D158',
    error: '#FF453A',
    border: '#38383A',
    card: '#1C1C1E',
    sidebar: '#1C1C1E'
};

// Default export for backward compatibility during refactor (Points to light)
export const colors = lightColors;
