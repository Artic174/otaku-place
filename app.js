const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const compression = require('compression');
require('dotenv').config();

// Import konfigurasi
const config = require('./config/api');
const db = require('./config/database');

// Import middleware
const { checkAdminStatus } = require('./middleware/auth');

// Import routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Inisialisasi Express app
const app = express();

// Trust proxy untuk deployment
app.set('trust proxy', 1);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://api.jikan.moe"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: config.session.cookie.maxAge,
        httpOnly: true
    }
}));

// Global middleware untuk template variables
app.use(checkAdminStatus);

// Global template variables
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('404', {
        title: 'Halaman Tidak Ditemukan',
        message: 'Halaman yang Anda cari tidak ditemukan.'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // API error response
        res.json({
            success: false,
            error: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan server'
        });
    } else {
        // Web page error response
        res.render('error', {
            title: 'Error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan server'
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
    console.log(`🚀 Anime Website Server running on http://${HOST}:${PORT}`);
    console.log(`📊 Admin panel: http://${HOST}:${PORT}/admin`);
    console.log(`🔑 Default admin login: username=admin, password=admin123`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

