# SATWA LYAR — Backend API (Express.js)

Backend Admin API untuk project SATWA LYAR. Dibangun menggunakan **Express.js + TypeScript + MariaDB Cloud + Cloudflare R2**.

## Tech Stack

| Teknologi | Fungsi |
|---|---|
| Express.js | Web framework |
| TypeScript | Type safety |
| MariaDB Cloud | Database utama |
| Cloudflare R2 | Penyimpanan gambar |
| Helmet | HTTP security headers |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |

## Struktur Folder

```
src/
├── config/
│   ├── database.ts      # MariaDB connection pool
│   └── r2.ts            # Cloudflare R2 S3 client
├── middleware/
│   ├── auth.middleware.ts       # JWT verification
│   ├── role.middleware.ts       # Admin role guard
│   ├── error.middleware.ts      # Global error handler
│   └── validation.middleware.ts # express-validator results
├── modules/
│   ├── auth/            # Login, GET /me
│   ├── animals/         # CRUD fauna + R2 upload
│   ├── categories/      # CRUD kategori
│   ├── quiz/            # CRUD quiz + pertanyaan
│   ├── users/           # User management
│   └── dashboard/       # Statistik admin
├── database/
│   └── schema.sql       # SQL schema MariaDB
├── app.ts               # Express app setup
└── server.ts            # Entry point
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file .env

```bash
cp .env.example .env
```

Isi semua environment variable di `.env` dengan credential asli kamu.

### 3. Inisialisasi Database

Jalankan perintah otomatis berikut:

```bash
npm run db:init
```

Perintah ini akan membuat database `animal-kaiser-satwa-lyar` di MariaDB Cloud (jika belum ada), mengeksekusi tabel dari [schema.sql](file:///d:/Hasil_Coding/Satwa-Lyar/apps/api/src/database/schema.sql), dan memasukkan data seed kategori + akun admin awal.

> **Catatan:** Admin default dibuat dengan email `admin@satwalyar.com` dan password `Admin1234`. **Ganti segera setelah setup!**

### 4. Jalankan development server

Dari folder root monorepo atau `apps/api`:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000` (API endpoint: `http://localhost:5000/api`)

## API Endpoints

### Auth
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/login` | Login admin/user |
| GET | `/api/auth/me` | Data user yang login |

### Admin — Dashboard
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/admin/dashboard` | Statistik keseluruhan |

### Admin — Categories
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/admin/categories` | List semua kategori |
| GET | `/api/admin/categories/:id` | Detail kategori |
| POST | `/api/admin/categories` | Buat kategori baru |
| PUT | `/api/admin/categories/:id` | Update kategori |
| DELETE | `/api/admin/categories/:id` | Hapus kategori |

### Admin — Animals (Fauna)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/admin/animals` | List fauna (pagination + search) |
| GET | `/api/admin/animals/:id` | Detail fauna |
| POST | `/api/admin/animals` | Tambah fauna (+ upload gambar) |
| PUT | `/api/admin/animals/:id` | Update fauna (+ ganti gambar) |
| DELETE | `/api/admin/animals/:id` | Hapus fauna (+ hapus gambar R2) |
| DELETE | `/api/admin/animals/:id/image` | Hapus hanya gambar |

### Admin — Quiz
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/admin/quiz` | List semua quiz |
| GET | `/api/admin/quiz/:id` | Detail quiz + pertanyaan |
| POST | `/api/admin/quiz` | Buat quiz (+ pertanyaan sekaligus) |
| PUT | `/api/admin/quiz/:id` | Update info quiz |
| DELETE | `/api/admin/quiz/:id` | Hapus quiz |
| POST | `/api/admin/quiz/:id/questions` | Tambah pertanyaan |
| PUT | `/api/admin/quiz/:id/questions/:qid` | Update pertanyaan |
| DELETE | `/api/admin/quiz/:id/questions/:qid` | Hapus pertanyaan |

### Admin — Users
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/admin/users` | List user (pagination + search) |
| GET | `/api/admin/users/:id` | Detail user + statistik |
| POST | `/api/admin/users` | Buat user baru |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Hapus user |

## Security Flow

```
Request
  ↓
Helmet (security headers)
  ↓
CORS
  ↓
Rate Limiting
  ↓
authenticate (JWT verify)
  ↓
requireAdmin (role check)
  ↓
Validation
  ↓
Controller → Service → DB
```

## Deployment ke Vercel

Pastikan semua environment variable sudah diset di Vercel dashboard, kemudian deploy dari folder `apps/api/`.
