const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, redirectIfAuthenticated } = require('../middleware/auth');

// Halaman login admin (redirect jika sudah login)
router.get('/login', redirectIfAuthenticated, adminController.loginPage);

// Proses login admin
router.post('/login', redirectIfAuthenticated, adminController.login);

// Logout admin
router.post('/logout', adminController.logout);
router.get('/logout', adminController.logout);

// Middleware untuk semua route admin yang memerlukan autentikasi
router.use(requireAuth);

// Dashboard admin
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);

// Kelola berita
router.get('/news', adminController.newsList);
router.get('/news/add', adminController.addNewsPage);
router.post('/news/add', adminController.addNews);
router.get('/news/edit/:id', adminController.editNewsPage);
router.post('/news/edit/:id', adminController.editNews);
router.post('/news/delete/:id', adminController.deleteNews);
router.get('/news/delete/:id', adminController.deleteNews); // Untuk kemudahan testing

module.exports = router;

