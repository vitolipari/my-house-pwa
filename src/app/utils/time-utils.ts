export const timestampInMilliseconds = ( value: number | string | null | undefined ): number | null => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const numericTimestamp = Number(value);
    if (Number.isFinite(numericTimestamp)) {
        return numericTimestamp;
    }

    const parsedTimestamp = Date.parse(value);
    return Number.isNaN(parsedTimestamp) ? null : parsedTimestamp;
};
