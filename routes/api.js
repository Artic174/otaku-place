const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const rateLimit = require('express-rate-limit');

// Rate limiting untuk API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Terlalu banyak request. Silakan coba lagi nanti.'
    }
});

// Rate limiting untuk komentar (lebih ketat)
const commentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 10 comments per 5 minutes
    message: {
        success: false,
        error: 'Terlalu banyak komentar. Silakan tunggu beberapa menit.'
    }
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Anime endpoints
router.get('/anime/popular', apiController.getPopularAnime);
router.get('/anime/schedules', apiController.getAnimeSchedules);
router.get('/anime/search', apiController.searchAnime);
router.get('/anime/:id', apiController.getAnimeDetail);
router.get('/anime/:id/comments', apiController.getAnimeComments);

// Genre endpoints
router.get('/genres', apiController.getAnimeGenres);

// Comment endpoints (dengan rate limiting khusus)
router.post('/comments', commentLimiter, apiController.addComment);

// Watchlist endpoints
router.get('/watchlist', apiController.getWatchlist);
router.post('/watchlist', apiController.addToWatchlist);
router.delete('/watchlist/:id', apiController.removeFromWatchlist);

// Error handling middleware untuk API
router.use((err, req, res, next) => {
    console.error('API Error:', err);
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON format'
        });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File terlalu besar'
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Terjadi kesalahan server'
    });
});

module.exports = router;

