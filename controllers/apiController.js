const JikanAPI = require('../utils/jikanApi');
const db = require('../config/database');

const apiController = {
    // API untuk mendapatkan anime populer
    async getPopularAnime(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const data = await JikanAPI.getTopAnime('anime', page, limit);
            
            res.json({
                success: true,
                data: data.data || [],
                pagination: data.pagination || null
            });
        } catch (error) {
            console.error('Get popular anime error:', error);
            res.status(500).json({
                success: false,
                error: 'Gagal mengambil data anime populer'
            });
        }
    },

    // API untuk mendapatkan jadwal anime
    async getAnimeSchedules(req, res) {
        try {
            const day = req.query.day || null;
            const page = parseInt(req.query.page) || 1;

            const data = await JikanAPI.getSchedules(day, page);
            
            res.json({
                success: true,
                data: data.data || [],
                pagination: data.pagination || null
            });
        } catch (error) {
            console.error('Get schedules error:', error);
            res.status(500).json({
                success: false,
                error: 'Gagal mengambil jadwal anime'
            });
        }
    },

    // API untuk pencarian anime
    async searchAnime(req, res) {
        try {
            const query = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            if (!query.trim()) {
                return res.json({
                    success: false,
                    error: 'Query pencarian tidak boleh kosong'
                });
            }

            const data = await JikanAPI.searchAnime(query, page, limit);
            
            res.json({
                success: true,
                data: data.data || [],
                pagination: data.pagination || null
            });
        } catch (error) {
            console.error('Search anime error:', error);
            res.status(500).json({
                success: false,
                error: 'Gagal melakukan pencarian anime'
            });
        }
    },

    // API untuk mendapatkan detail anime
    async getAnimeDetail(req, res) {
        try {
            const animeId = req.params.id;
            
            const data = await JikanAPI.getAnime(animeId);
            
            if (!data.data) {
                return res.status(404).json({
                    success: false,
                    error: 'Anime tidak ditemukan'
                });
            }

            res.json({
                success: true,
                data: data.data
            });
        } catch (error) {
            console.error('Get anime detail error:', error);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    error: 'Anime tidak ditemukan'
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Gagal mengambil detail anime'
            });
        }
    },

    // API untuk mendapatkan genre anime
    async getAnimeGenres(req, res) {
        try {
            const data = await JikanAPI.getAnimeGenres();
            
            res.json({
                success: true,
                data: data.data || []
            });
        } catch (error) {
            console.error('Get genres error:', error);
            res.status(500).json({
                success: false,
                error: 'Gagal mengambil daftar genre'
            });
        }
    },

    // API untuk menambah komentar
    async addComment(req, res) {
        try {
            const { anime_id, username, comment } = req.body;

            if (!anime_id || !username || !comment) {
                return res.status(400).json({
                    success: false,
                    error: 'Semua field harus diisi'
                });
            }

            // Validasi panjang komentar
            if (comment.length > 1000) {
                return res.status(400).json({
                    success: false,
                    error: 'Komentar terlalu panjang (maksimal 1000 karakter)'
                });
            }

            db.run(
                "INSERT INTO comments (anime_id, username, comment) VALUES (?, ?, ?)",
                [anime_id, username.trim(), comment.trim()],
                function(err) {
                    if (err) {
                        console.error('Add comment error:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Gagal menyimpan komentar'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Komentar berhasil ditambahkan',
                        commentId: this.lastID
                    });
                }
            );
        } catch (error) {
            console.error('Add comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Terjadi kesalahan sistem'
            });
        }
    },

    // API untuk mendapatkan komentar anime
    async getAnimeComments(req, res) {
        try {
            const animeId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;

            db.all(
                "SELECT * FROM comments WHERE anime_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
                [animeId, limit, offset],
                (err, comments) => {
                    if (err) {
                        console.error('Get comments error:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Gagal mengambil komentar'
                        });
                    }

                    // Hitung total komentar
                    db.get(
                        "SELECT COUNT(*) as total FROM comments WHERE anime_id = ?",
                        [animeId],
                        (err, countResult) => {
                            if (err) {
                                console.error('Count comments error:', err);
                                return res.status(500).json({
                                    success: false,
                                    error: 'Gagal mengambil komentar'
                                });
                            }

                            const totalComments = countResult.total;
                            const totalPages = Math.ceil(totalComments / limit);

                            res.json({
                                success: true,
                                data: comments,
                                pagination: {
                                    currentPage: page,
                                    totalPages: totalPages,
                                    totalItems: totalComments,
                                    hasNextPage: page < totalPages,
                                    hasPrevPage: page > 1
                                }
                            });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Get anime comments error:', error);
            res.status(500).json({
                success: false,
                error: 'Terjadi kesalahan sistem'
            });
        }
    },

    // API untuk menambah ke watchlist
    async addToWatchlist(req, res) {
        try {
            const { anime_id, anime_title, anime_image } = req.body;
            const userSession = req.sessionID;

            if (!anime_id || !anime_title) {
                return res.status(400).json({
                    success: false,
                    error: 'Data anime tidak lengkap'
                });
            }

            // Cek apakah sudah ada di watchlist
            db.get(
                "SELECT id FROM watchlist WHERE user_session = ? AND anime_id = ?",
                [userSession, anime_id],
                (err, existing) => {
                    if (err) {
                        console.error('Check watchlist error:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Gagal mengecek watchlist'
                        });
                    }

                    if (existing) {
                        return res.status(400).json({
                            success: false,
                            error: 'Anime sudah ada di watchlist'
                        });
                    }

                    // Tambah ke watchlist
                    db.run(
                        "INSERT INTO watchlist (user_session, anime_id, anime_title, anime_image) VALUES (?, ?, ?, ?)",
                        [userSession, anime_id, anime_title, anime_image || null],
                        function(err) {
                            if (err) {
                                console.error('Add to watchlist error:', err);
                                return res.status(500).json({
                                    success: false,
                                    error: 'Gagal menambah ke watchlist'
                                });
                            }

                            res.json({
                                success: true,
                                message: 'Anime berhasil ditambahkan ke watchlist'
                            });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Add to watchlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Terjadi kesalahan sistem'
            });
        }
    },

    // API untuk mendapatkan watchlist
    async getWatchlist(req, res) {
        try {
            const userSession = req.sessionID;

            db.all(
                "SELECT * FROM watchlist WHERE user_session = ? ORDER BY added_at DESC",
                [userSession],
                (err, watchlist) => {
                    if (err) {
                        console.error('Get watchlist error:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Gagal mengambil watchlist'
                        });
                    }

                    res.json({
                        success: true,
                        data: watchlist
                    });
                }
            );
        } catch (error) {
            console.error('Get watchlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Terjadi kesalahan sistem'
            });
        }
    },

    // API untuk menghapus dari watchlist
    async removeFromWatchlist(req, res) {
        try {
            const animeId = req.params.id;
            const userSession = req.sessionID;

            db.run(
                "DELETE FROM watchlist WHERE user_session = ? AND anime_id = ?",
                [userSession, animeId],
                function(err) {
                    if (err) {
                        console.error('Remove from watchlist error:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Gagal menghapus dari watchlist'
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            success: false,
                            error: 'Anime tidak ditemukan di watchlist'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Anime berhasil dihapus dari watchlist'
                    });
                }
            );
        } catch (error) {
            console.error('Remove from watchlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Terjadi kesalahan sistem'
            });
        }
    }
};

module.exports = apiController;

