// Middleware untuk autentikasi admin
function requireAuth(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    } else {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Admin login required'
        });
    }
}

// Middleware untuk redirect jika sudah login
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.admin) {
        return res.redirect('/admin/dashboard');
    } else {
        return next();
    }
}

// Middleware untuk mengecek apakah user adalah admin di views
function checkAdminStatus(req, res, next) {
    res.locals.isAdmin = !!(req.session && req.session.admin);
    res.locals.adminUser = req.session ? req.session.admin : null;
    next();
}

module.exports = {
    requireAuth,
    redirectIfAuthenticated,
    checkAdminStatus
};

