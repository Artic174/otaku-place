// Konfigurasi API dan settings aplikasi
module.exports = {
    // Jikan API Configuration
    jikan: {
        baseURL: 'https://api.jikan.moe/v4',
        timeout: 10000,
        rateLimit: {
            requestsPerMinute: 60,
            requestsPerSecond: 2
        }
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0'
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET || 'anime-website-secret-key-2024',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Upload Configuration
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        destination: './public/uploads/'
    },

    // Cache Configuration
    cache: {
        animeDetails: 24 * 60 * 60 * 1000, // 24 hours
        schedules: 60 * 60 * 1000, // 1 hour
        topAnime: 6 * 60 * 60 * 1000, // 6 hours
        search: 30 * 60 * 1000 // 30 minutes
    },

    // Pagination
    pagination: {
        defaultLimit: 20,
        maxLimit: 50
    },

    // Days mapping for schedules
    days: {
        monday: 'monday',
        tuesday: 'tuesday', 
        wednesday: 'wednesday',
        thursday: 'thursday',
        friday: 'friday',
        saturday: 'saturday',
        sunday: 'sunday'
    }
};

