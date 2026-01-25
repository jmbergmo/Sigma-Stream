export const formatAxisNumber = (val: number): string => {
    if (val === 0) return '0';
    const abs = Math.abs(val);

    // Tiny numbers: Scientific notation (e.g., 1.2E-4)
    if (abs < 0.001) {
        return new Intl.NumberFormat('en-US', {
            notation: 'scientific',
            maximumSignificantDigits: 2
        }).format(val);
    }

    // Large numbers: Compact notation (e.g., 1.2M)
    if (abs >= 1000000) {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumSignificantDigits: 3
        }).format(val);
    }

    // Standard range: 3 sig figs (e.g. 123, 0.045)
    return new Intl.NumberFormat('en-US', {
        maximumSignificantDigits: 3
    }).format(val);
};
