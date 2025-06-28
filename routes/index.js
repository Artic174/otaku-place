const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const db = require('../config/database');

// Halaman utama
router.get('/', homeController.index);

// Halaman jadwal rilis
router.get('/schedules', homeController.schedules);

// Halaman detail anime
router.get('/anime/:id', homeController.animeDetail);

// Halaman pencarian
router.get('/search', homeController.search);

// Halaman berita
router.get('/news', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Ambil berita dengan pagination
        db.all(
            "SELECT * FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset],
            (err, news) => {
                if (err) {
                    console.error('Get news error:', err);
                    return res.render('news', {
                        title: 'Berita Anime',
                        news: [],
                        currentPage: 1,
                        totalPages: 1,
                        error: 'Gagal memuat berita'
                    });
                }

                // Hitung total halaman
                db.get(
                    "SELECT COUNT(*) as total FROM news",
                    (err, countResult) => {
                        if (err) {
                            console.error('Count news error:', err);
                            return res.render('news', {
                                title: 'Berita Anime',
                                news: news,
                                currentPage: page,
                                totalPages: 1,
                                error: null
                            });
                        }

                        const totalPages = Math.ceil(countResult.total / limit);

                        res.render('news', {
                            title: 'Berita Anime',
                            news: news,
                            currentPage: page,
                            totalPages: totalPages,
                            error: null
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('News page error:', error);
        res.render('news', {
            title: 'Berita Anime',
            news: [],
            currentPage: 1,
            totalPages: 1,
            error: 'Terjadi kesalahan sistem'
        });
    }
});

// Halaman detail berita
router.get('/news/:id', (req, res) => {
    const newsId = req.params.id;

    db.get(
        "SELECT * FROM news WHERE id = ?",
        [newsId],
        (err, news) => {
            if (err) {
                console.error('Get news detail error:', err);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: 'Gagal memuat detail berita'
                });
            }

            if (!news) {
                return res.status(404).render('404', {
                    title: 'Berita Tidak Ditemukan',
                    message: 'Berita yang Anda cari tidak ditemukan.'
                });
            }

            res.render('news-detail', {
                title: `${news.title} - Berita Anime`,
                news: news
            });
        }
    );
});

// Halaman watchlist
router.get('/watchlist', (req, res) => {
    res.render('watchlist', {
        title: 'My Watchlist'
    });
});

// Halaman forum/komentar
router.get('/forum', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        // Ambil komentar terbaru dari semua anime
        db.all(
            `SELECT c.*, 
                    (SELECT COUNT(*) FROM comments c2 WHERE c2.anime_id = c.anime_id) as total_comments
             FROM comments c 
             ORDER BY c.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset],
            (err, comments) => {
                if (err) {
                    console.error('Get forum comments error:', err);
                    return res.render('forum', {
                        title: 'Forum Diskusi',
                        comments: [],
                        currentPage: 1,
                        totalPages: 1,
                        error: 'Gagal memuat forum'
                    });
                }

                // Hitung total halaman
                db.get(
                    "SELECT COUNT(*) as total FROM comments",
                    (err, countResult) => {
                        if (err) {
                            console.error('Count forum comments error:', err);
                            return res.render('forum', {
                                title: 'Forum Diskusi',
                                comments: comments,
                                currentPage: page,
                                totalPages: 1,
                                error: null
                            });
                        }

                        const totalPages = Math.ceil(countResult.total / limit);

                        res.render('forum', {
                            title: 'Forum Diskusi',
                            comments: comments,
                            currentPage: page,
                            totalPages: totalPages,
                            error: null
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Forum page error:', error);
        res.render('forum', {
            title: 'Forum Diskusi',
            comments: [],
            currentPage: 1,
            totalPages: 1,
            error: 'Terjadi kesalahan sistem'
        });
    }
});

module.exports = router;

