export const environment = {
    production: true,
    apiBaseUrl: 'https://lipari-house.duckdns.org',
    REFRESH_STATUS_THRESHOLD: 600000,   // 10min
    NO_AUTH_PATHS: [
        '/health'
    ]
};
