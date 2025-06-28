const bcrypt = require('bcryptjs');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './public/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipe file tidak diizinkan. Gunakan JPEG, PNG, GIF, atau WebP.'));
        }
    }
});

const adminController = {
    // Halaman login admin
    loginPage(req, res) {
        res.render('admin/login', {
            title: 'Admin Login',
            error: null
        });
    },

    // Proses login admin
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.render('admin/login', {
                    title: 'Admin Login',
                    error: 'Username dan password harus diisi'
                });
            }

            // Cari admin di database
            db.get(
                "SELECT * FROM admins WHERE username = ?",
                [username],
                async (err, admin) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.render('admin/login', {
                            title: 'Admin Login',
                            error: 'Terjadi kesalahan sistem'
                        });
                    }

                    if (!admin) {
                        return res.render('admin/login', {
                            title: 'Admin Login',
                            error: 'Username atau password salah'
                        });
                    }

                    // Verifikasi password
                    const isValidPassword = await bcrypt.compare(password, admin.password);
                    if (!isValidPassword) {
                        return res.render('admin/login', {
                            title: 'Admin Login',
                            error: 'Username atau password salah'
                        });
                    }

                    // Set session
                    req.session.admin = {
                        id: admin.id,
                        username: admin.username,
                        email: admin.email
                    };

                    res.redirect('/admin/dashboard');
                }
            );
        } catch (error) {
            console.error('Login error:', error);
            res.render('admin/login', {
                title: 'Admin Login',
                error: 'Terjadi kesalahan sistem'
            });
        }
    },

    // Logout admin
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/admin/login');
        });
    },

    // Dashboard admin
    async dashboard(req, res) {
        try {
            // Ambil statistik
            const stats = await getAdminStats();
            
            // Ambil berita terbaru
            const recentNews = await getRecentNews(5);

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats: stats,
                recentNews: recentNews,
                admin: req.session.admin
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats: { newsCount: 0, commentsCount: 0 },
                recentNews: [],
                admin: req.session.admin,
                error: 'Gagal memuat data dashboard'
            });
        }
    },

    // Halaman daftar berita
    async newsList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const news = await getAllNews(limit, offset);
            const totalNews = await getTotalNewsCount();
            const totalPages = Math.ceil(totalNews / limit);

            res.render('admin/news-list', {
                title: 'Kelola Berita',
                news: news,
                currentPage: page,
                totalPages: totalPages,
                admin: req.session.admin
            });
        } catch (error) {
            console.error('News list error:', error);
            res.render('admin/news-list', {
                title: 'Kelola Berita',
                news: [],
                currentPage: 1,
                totalPages: 1,
                admin: req.session.admin,
                error: 'Gagal memuat daftar berita'
            });
        }
    },

    // Halaman tambah berita
    addNewsPage(req, res) {
        res.render('admin/news-add', {
            title: 'Tambah Berita',
            news: null,
            admin: req.session.admin,
            error: null
        });
    },

    // Proses tambah berita
    addNews: [
        upload.single('image'),
        async (req, res) => {
            try {
                const { title, content } = req.body;
                const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

                if (!title || !content) {
                    return res.render('admin/news-form', {
                        title: 'Tambah Berita',
                        news: null,
                        admin: req.session.admin,
                        error: 'Judul dan konten harus diisi'
                    });
                }

                db.run(
                    "INSERT INTO news (title, content, image_url, author_id) VALUES (?, ?, ?, ?)",
                    [title, content, imageUrl, req.session.admin.id],
                    function(err) {
                        if (err) {
                            console.error('Add news error:', err);
                            return res.render('admin/news-form', {
                                title: 'Tambah Berita',
                                news: null,
                                admin: req.session.admin,
                                error: 'Gagal menyimpan berita'
                            });
                        }

                        res.redirect('/admin/news');
                    }
                );
            } catch (error) {
                console.error('Add news error:', error);
                res.render('admin/news-form', {
                    title: 'Tambah Berita',
                    news: null,
                    admin: req.session.admin,
                    error: 'Terjadi kesalahan sistem'
                });
            }
        }
    ],

    // Halaman edit berita
    async editNewsPage(req, res) {
        try {
            const newsId = req.params.id;
            
            db.get(
                "SELECT * FROM news WHERE id = ?",
                [newsId],
                (err, news) => {
                    if (err) {
                        console.error('Get news error:', err);
                        return res.redirect('/admin/news');
                    }

                    if (!news) {
                        return res.redirect('/admin/news');
                    }

                    res.render('admin/news-form', {
                        title: 'Edit Berita',
                        news: news,
                        admin: req.session.admin,
                        error: null
                    });
                }
            );
        } catch (error) {
            console.error('Edit news page error:', error);
            res.redirect('/admin/news');
        }
    },

    // Proses edit berita
    editNews: [
        upload.single('image'),
        async (req, res) => {
            try {
                const newsId = req.params.id;
                const { title, content } = req.body;
                let imageUrl = req.body.existing_image;

                if (req.file) {
                    imageUrl = `/uploads/${req.file.filename}`;
                    
                    // Hapus gambar lama jika ada
                    if (req.body.existing_image) {
                        const oldImagePath = path.join('./public', req.body.existing_image);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                        }
                    }
                }

                if (!title || !content) {
                    return res.render('admin/news-form', {
                        title: 'Edit Berita',
                        news: { id: newsId, title, content, image_url: imageUrl },
                        admin: req.session.admin,
                        error: 'Judul dan konten harus diisi'
                    });
                }

                db.run(
                    "UPDATE news SET title = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [title, content, imageUrl, newsId],
                    function(err) {
                        if (err) {
                            console.error('Update news error:', err);
                            return res.render('admin/news-form', {
                                title: 'Edit Berita',
                                news: { id: newsId, title, content, image_url: imageUrl },
                                admin: req.session.admin,
                                error: 'Gagal mengupdate berita'
                            });
                        }

                        res.redirect('/admin/news');
                    }
                );
            } catch (error) {
                console.error('Edit news error:', error);
                res.redirect('/admin/news');
            }
        }
    ],

    // Hapus berita
    async deleteNews(req, res) {
        try {
            const newsId = req.params.id;

            // Ambil data berita untuk hapus gambar
            db.get(
                "SELECT image_url FROM news WHERE id = ?",
                [newsId],
                (err, news) => {
                    if (err) {
                        console.error('Get news for delete error:', err);
                        return res.redirect('/admin/news');
                    }

                    // Hapus berita dari database
                    db.run(
                        "DELETE FROM news WHERE id = ?",
                        [newsId],
                        function(err) {
                            if (err) {
                                console.error('Delete news error:', err);
                                return res.redirect('/admin/news');
                            }

                            // Hapus file gambar jika ada
                            if (news && news.image_url) {
                                const imagePath = path.join('./public', news.image_url);
                                if (fs.existsSync(imagePath)) {
                                    fs.unlinkSync(imagePath);
                                }
                            }

                            res.redirect('/admin/news');
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Delete news error:', error);
            res.redirect('/admin/news');
        }
    }
};

// Helper functions
function getAdminStats() {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT (SELECT COUNT(*) FROM news) as newsCount, (SELECT COUNT(*) FROM comments) as commentsCount",
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }
        );
    });
}

function getRecentNews(limit) {
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

function getAllNews(limit, offset) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset],
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

function getTotalNewsCount() {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT COUNT(*) as count FROM news",
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            }
        );
    });
}

module.exports = adminController;

