# AnimeHub - Website Informasi Anime

Website informasi anime berbasis Node.js dengan fitur lengkap yang mengambil data dari Jikan API (MyAnimeList). Website ini dilengkapi dengan sistem admin untuk mengelola berita dan fitur interaktif untuk pengguna.

## 🚀 Fitur Utama

### Frontend
- **Halaman Beranda**: Menampilkan anime populer dan rilis terbaru
- **Jadwal Rilis**: Anime berdasarkan hari tayang (Senin-Minggu)
- **Pencarian**: Cari anime berdasarkan judul, genre, atau studio
- **Detail Anime**: Informasi lengkap anime dengan trailer dan rating
- **Watchlist**: Simpan anime favorit (berbasis session)
- **Berita Anime**: Berita terbaru yang dikelola admin
- **Forum/Komentar**: Sistem komentar sederhana per anime
- **Dark Theme**: Desain modern dengan tema gelap

### Backend & Admin
- **Dashboard Admin**: Statistik dan manajemen konten
- **CRUD Berita**: Tambah, edit, hapus berita dengan upload gambar
- **Autentikasi**: Sistem login admin dengan bcrypt
- **Database**: SQLite untuk penyimpanan lokal
- **API Integration**: Jikan API v4 untuk data anime
- **Session Management**: Pengelolaan session pengguna

## 🛠️ Teknologi

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Template Engine**: EJS
- **Database**: SQLite3
- **API**: Jikan API v4 (MyAnimeList)
- **Authentication**: bcrypt + express-session
- **File Upload**: Multer
- **Icons**: Bootstrap Icons

## 📦 Instalasi

### Prasyarat
- Node.js (v14 atau lebih baru)
- npm atau yarn

### Langkah Instalasi

1. **Clone atau download proyek**
   ```bash
   git clone <repository-url>
   cd anime-website-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` sesuai kebutuhan:
   ```env
   PORT=3000
   HOST=0.0.0.0
   NODE_ENV=development
   SESSION_SECRET=your-secret-key-here
   ```

4. **Jalankan aplikasi**
   ```bash
   npm start
   ```

5. **Akses website**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Login Admin: username=`admin`, password=`admin123`

## 📁 Struktur Proyek

```
anime-website-nodejs/
├── config/
│   ├── api.js              # Konfigurasi API
│   └── database.js         # Setup database SQLite
├── controllers/
│   ├── adminController.js  # Controller admin
│   ├── apiController.js    # Controller API endpoints
│   └── homeController.js   # Controller halaman utama
├── middleware/
│   └── auth.js            # Middleware autentikasi
├── models/                # (Reserved untuk model data)
├── public/
│   ├── css/
│   │   └── style.css      # Custom CSS
│   ├── js/
│   │   └── main.js        # JavaScript frontend
│   └── images/            # Asset gambar
├── routes/
│   ├── admin.js           # Routes admin
│   ├── api.js             # Routes API
│   └── index.js           # Routes utama
├── utils/
│   └── jikanApi.js        # Utility Jikan API
├── views/
│   ├── admin/             # Template admin
│   │   ├── dashboard.ejs
│   │   ├── login.ejs
│   │   ├── news-add.ejs
│   │   ├── news-edit.ejs
│   │   └── news-list.ejs
│   ├── partials/          # Template partial
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs          # Halaman beranda
│   ├── search.ejs         # Halaman pencarian
│   ├── schedules.ejs      # Halaman jadwal
│   ├── anime-detail.ejs   # Detail anime
│   ├── watchlist.ejs      # Watchlist pengguna
│   ├── 404.ejs           # Halaman 404
│   └── error.ejs         # Halaman error
├── app.js                 # Main application file
├── package.json
├── .env.example
└── README.md
```

## 🔧 Konfigurasi

### Environment Variables
```env
# Server Configuration
PORT=3000                    # Port server
HOST=0.0.0.0                # Host binding
NODE_ENV=development         # Environment mode

# Session Configuration
SESSION_SECRET=your-secret   # Secret key untuk session
SESSION_MAX_AGE=86400000    # Session timeout (24 jam)

# Database Configuration
DB_PATH=./database.sqlite    # Path database SQLite

# API Configuration
JIKAN_BASE_URL=https://api.jikan.moe/v4
JIKAN_RATE_LIMIT=1000       # Rate limit per detik
```

### Database Schema
Database SQLite akan dibuat otomatis dengan tabel:

- **admins**: Data admin (username, password hash)
- **news**: Berita anime (title, content, image_url, timestamps)
- **comments**: Komentar anime (anime_id, username, comment, timestamp)
- **watchlist**: Daftar tonton pengguna (session_id, anime_id, anime_title)

## 🚀 Deployment

### Hosting Gratis yang Didukung

1. **Vercel** (Recommended untuk frontend)
2. **Railway** (Untuk full-stack)
3. **Render** (Untuk backend)
4. **Heroku** (Dengan addon database)

### Deploy ke Vercel
```bash
npm install -g vercel
vercel
```

### Deploy ke Railway
1. Connect repository ke Railway
2. Set environment variables
3. Deploy otomatis

### Deploy ke Render
1. Connect repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set environment variables

## 📱 API Endpoints

### Public API
- `GET /` - Halaman beranda
- `GET /search` - Halaman pencarian
- `GET /schedules` - Jadwal anime
- `GET /anime/:id` - Detail anime
- `GET /news` - Daftar berita
- `GET /news/:id` - Detail berita
- `GET /watchlist` - Watchlist pengguna

### Admin API
- `POST /admin/login` - Login admin
- `GET /admin/dashboard` - Dashboard admin
- `GET /admin/news` - Kelola berita
- `POST /admin/news/add` - Tambah berita
- `PUT /admin/news/edit/:id` - Edit berita
- `DELETE /admin/news/delete/:id` - Hapus berita

### AJAX API
- `GET /api/anime/popular` - Anime populer
- `GET /api/anime/current-season` - Anime season saat ini
- `GET /api/anime/search?q=query` - Pencarian anime
- `GET /api/schedules/:day` - Jadwal per hari
- `POST /api/watchlist/add` - Tambah ke watchlist
- `DELETE /api/watchlist/remove` - Hapus dari watchlist

## 🎨 Customization

### Mengubah Tema
Edit file `public/css/style.css` untuk mengubah:
- Warna tema (CSS variables di `:root`)
- Layout dan spacing
- Animasi dan transisi

### Menambah Fitur
1. Buat controller baru di `controllers/`
2. Tambah routes di `routes/`
3. Buat template EJS di `views/`
4. Update navigation di `partials/header.ejs`

### Integrasi API Lain
Edit `utils/jikanApi.js` atau buat utility baru untuk API lain seperti:
- AniList API
- Kitsu API
- TMDB API

## 🔒 Keamanan

- Password admin di-hash dengan bcrypt
- Session management dengan express-session
- Input validation dan sanitization
- CSRF protection (dapat ditambahkan)
- Rate limiting untuk API calls

## 🐛 Troubleshooting

### Error Database
```bash
# Hapus database dan restart
rm database.sqlite
npm start
```

### Error Port
```bash
# Ubah port di .env
PORT=3001
```

### Error API Rate Limit
- Jikan API memiliki rate limit
- Implementasi caching untuk mengurangi API calls
- Gunakan delay antar request

## 📄 License

MIT License - Bebas digunakan untuk proyek personal dan komersial.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Jika mengalami masalah:
1. Cek dokumentasi ini
2. Lihat issues di repository
3. Buat issue baru dengan detail error

---

**Dibuat dengan ❤️ untuk komunitas anime Indonesia**

