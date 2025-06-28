const JikanAPI = require('../utils/jikanApi');
const db = require('../config/database');

const homeController = {
    // Halaman beranda
    async index(req, res) {
        try {
            // Ambil data anime populer dan terbaru secara paralel
            const [topAnime, currentSeason, recentNews] = await Promise.all([
                JikanAPI.getTopAnime('anime', 1, 12),
                JikanAPI.getCurrentSeason(1),
                getRecentNews(6)
            ]);

            res.render('index', {
                title: 'Beranda - Anime Website',
                topAnime: topAnime.data || [],
                currentSeason: currentSeason.data || [],
                recentNews: recentNews,
                error: null
            });
        } catch (error) {
            console.error('Error loading homepage:', error);
            res.render('index', {
                title: 'Beranda - Anime Website',
                topAnime: [],
                currentSeason: [],
                recentNews: [],
                error: 'Gagal memuat data anime. Silakan coba lagi nanti.'
            });
        }
    },

    // Halaman jadwal rilis
    async schedules(req, res) {
        try {
            const day = req.query.day || null;
            const page = parseInt(req.query.page) || 1;

            const scheduleData = await JikanAPI.getSchedules(day, page);
            
            // Organize data by days if no specific day is requested
            let organizedData = {};
            if (!day && scheduleData.data) {
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                days.forEach(dayName => {
                    organizedData[dayName] = [];
                });

                scheduleData.data.forEach(anime => {
                    if (anime.broadcast && anime.broadcast.day) {
                        const animeDay = anime.broadcast.day.toLowerCase();
                        if (organizedData[animeDay]) {
                            organizedData[animeDay].push(anime);
                        }
                    }
                });
            }

            res.render('schedules', {
                title: 'Jadwal Rilis Anime',
                schedules: day ? scheduleData.data : organizedData,
                currentDay: day,
                pagination: scheduleData.pagination || null,
                error: null
            });
        } catch (error) {
            console.error('Error loading schedules:', error);
            res.render('schedules', {
                title: 'Jadwal Rilis Anime',
                schedules: {},
                currentDay: null,
                pagination: null,
                error: 'Gagal memuat jadwal anime. Silakan coba lagi nanti.'
            });
        }
    },

    // Halaman detail anime
    async animeDetail(req, res) {
        try {
            const animeId = req.params.id;
            
            // Ambil data anime dan komentar secara paralel
            const [animeData, comments] = await Promise.all([
                JikanAPI.getAnime(animeId),
                getAnimeComments(animeId)
            ]);

            if (!animeData.data) {
                return res.status(404).render('404', {
                    title: 'Anime Tidak Ditemukan',
                    message: 'Anime yang Anda cari tidak ditemukan.'
                });
            }

            res.render('anime-detail', {
                title: `${animeData.data.title} - Detail Anime`,
                anime: animeData.data,
                comments: comments,
                error: null
            });
        } catch (error) {
            console.error('Error loading anime detail:', error);
            if (error.response && error.response.status === 404) {
                return res.status(404).render('404', {
                    title: 'Anime Tidak Ditemukan',
                    message: 'Anime yang Anda cari tidak ditemukan.'
                });
            }
            
            res.status(500).render('error', {
                title: 'Error',
                error: 'Gagal memuat detail anime. Silakan coba lagi nanti.'
            });
        }
    },

    // Halaman pencarian
    async search(req, res) {
        try {
            const query = req.query.q || '';
            const genre = req.query.genre || '';
            const page = parseInt(req.query.page) || 1;

            let searchResults = { data: [], pagination: null };
            
            if (query.trim()) {
                searchResults = await JikanAPI.searchAnime(query, page, 20);
            } else if (genre) {
                searchResults = await JikanAPI.getAnimeByGenre(genre, page, 20);
            }

            // Ambil daftar genre untuk filter
            const genresData = await JikanAPI.getAnimeGenres();

            res.render('search', {
                title: 'Pencarian Anime',
                results: searchResults.data || [],
                pagination: searchResults.pagination || null,
                query: query,
                selectedGenre: genre,
                genres: genresData.data || [],
                error: null
            });
        } catch (error) {
            console.error('Error in search:', error);
            res.render('search', {
                title: 'Pencarian Anime',
                results: [],
                pagination: null,
                query: req.query.q || '',
                selectedGenre: req.query.genre || '',
                genres: [],
                error: 'Gagal melakukan pencarian. Silakan coba lagi nanti.'
            });
        }
    }
};

// Helper functions
function getRecentNews(limit = 6) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM news ORDER BY created_at DESC LIMIT ?",
            [limit],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
}

function getAnimeComments(animeId) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM comments WHERE anime_id = ? ORDER BY created_at DESC",
            [animeId],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
}

module.exports = homeController;

