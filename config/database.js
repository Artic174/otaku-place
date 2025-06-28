const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path ke file database
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Buat koneksi database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeTables();
    }
});

// Inisialisasi tabel dan data default
function initializeTables() {
    // Buat tabel admins
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating admins table:', err);
            return;
        }
        
        // Cek apakah sudah ada admin
        db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
            if (err) {
                console.error('Error checking admin count:', err);
                return;
            }
            
            // Jika belum ada admin, buat admin default
            if (row.count === 0) {
                const bcrypt = require('bcrypt');
                const defaultPassword = bcrypt.hashSync('admin123', 10);
                
                db.run(
                    'INSERT INTO admins (username, password) VALUES (?, ?)',
                    ['admin', defaultPassword],
                    (err) => {
                        if (err) {
                            console.error('Error creating default admin:', err);
                        } else {
                            console.log('✅ Default admin created: username=admin, password=admin123');
                        }
                    }
                );
            }
        });
    });

    // Buat tabel news
    db.run(`
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating news table:', err);
        } else {
            console.log('✅ News table ready');
        }
    });

    // Buat tabel comments
    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anime_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating comments table:', err);
        } else {
            console.log('✅ Comments table ready');
        }
    });

    // Buat tabel watchlist
    db.run(`
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            anime_id INTEGER NOT NULL,
            anime_title TEXT NOT NULL,
            anime_image TEXT,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(session_id, anime_id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating watchlist table:', err);
        } else {
            console.log('✅ Watchlist table ready');
        }
    });
}

module.exports = db;

