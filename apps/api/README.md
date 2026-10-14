# SATWA LYAR — Backend API (Express.js)

Backend API lengkap untuk project edukasi fauna **SATWA LYAR**. Dibangun menggunakan **Express.js + TypeScript + MariaDB Cloud + Cloudflare R2 + Upstash Redis**.

## Tech Stack

| Teknologi | Fungsi |
|---|---|
| Express.js | Core Web Framework |
| TypeScript | Type safety & maintainability |
| MariaDB Cloud | Database relasional utama |
| Cloudflare R2 | Object storage untuk aset gambar fauna (S3-compatible) |
| Upstash Redis | Caching performa tinggi (REST-based / Serverless) |
| Helmet | HTTP security headers |
| JWT (jsonwebtoken) | Stateless Authentication & Session |
| bcryptjs | One-way password hashing (salt 12 rounds) |
| express-validator | Request input validation & sanitization |
| express-rate-limit | Proteksi brute force & DDoS |
| Vercel | Serverless Deployment |

## Struktur Folder

```
apps/api/
├── src/
│   ├── config/
│   │   ├── database.ts               # MariaDB connection pool
│   │   ├── r2.ts                     # Cloudflare R2 S3 client
│   │   └── redis.ts                  # Upstash Redis REST cache client
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT verify (authenticate & optionalAuthenticate)
│   │   ├── role.middleware.ts        # Admin role guard
│   │   ├── error.middleware.ts       # Global error & 404 handler
│   │   └── validation.middleware.ts  # express-validator handler
│   ├── modules/
│   │   ├── auth/                     # Register, Login, Logout, Me
│   │   ├── users/                    # Profil user, ubah password, & Admin user CRUD
│   │   ├── animals/                  # Public fauna browse/search & Admin CRUD fauna
│   │   ├── categories/               # Public 4 zona fauna & Admin CRUD kategori
│   │   ├── favorites/                # Bookmark / favorit fauna oleh user
│   │   ├── quiz/                     # Pengerjaan kuis, submit jawaban, riwayat nilai & Admin CRUD kuis
│   │   └── dashboard/                # Statistik dashboard admin
│   ├── database/
│   │   ├── schema.sql                # SQL schema MariaDB (tabel & seed)
│   │   └── init-db.ts                # Skrip inisialisasi database otomatis
│   ├── app.ts                        # Konfigurasi middleware & registrasi routes
│   └── server.ts                     # Server entry point & export untuk Vercel
├── .env.example
├── package.json
├── tsconfig.json
└── vercel.json
```

## Setup & Instalasi

### 1. Install dependencies
Dari root repository:
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin template `.env.example` ke `.env`:
```bash
cp apps/api/.env.example apps/api/.env
```
Isi variabel berikut:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Kredensial MariaDB Cloud)
- `JWT_SECRET` (Minimal 32 karakter acak)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- `REDIS_URL`, `REDIS_TOKEN` (Opsional untuk caching Upstash)

### 3. Inisialisasi Database
Jalankan skrip inisialisasi untuk membuat tabel otomatis di MariaDB Cloud:
```bash
npm run db:init
```

### 4. Menjalankan Server Lokal
```bash
npm run dev
```
Akses API di `http://localhost:5000/api`

---

## Daftar Lengkap API Endpoints

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | Publik | Pendaftaran akun user baru |
| POST | `/api/auth/login` | Publik | Login akun (user / admin) |
| POST | `/api/auth/logout` | Publik | Logout sesi user |
| GET | `/api/auth/me` | User | Cek token & data user login beserta statistik |

### 2. Profil User (`/api/users`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/users/profile` | User | Mengambil profil user & ringkasan statistik (kuis, favorit) |
| PUT | `/api/users/profile` | User | Memperbarui nama profil |
| PUT | `/api/users/password` | User | Mengganti kata sandi dengan verifikasi password lama |

### 3. Fauna / Satwa Edukasi (`/api/animals`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/animals` | Publik | Browse satwa, pagination (`page`, `limit`), search (`search`), filter zona (`zone` / `category_id`), filter konservasi (`status`), sorting (`sort`). Otomatis mendeteksi status `is_favorite` jika user login. |
| GET | `/api/animals/:id` | Publik | Detail lengkap satwa, status favorit personal, dan rekomendasi satwa sejenis |

### 4. Zona / Kategori (`/api/categories`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/categories` | Publik | Daftar 4 zona fauna (Air Tawar, Serangga, Reptil, Burung) & total satwa per zona |
| GET | `/api/categories/:identifier` | Publik | Detail zona berdasarkan ID atau slug (misal: `air-tawar`) beserta daftar satwanya |

### 5. Favorit Satwa (`/api/favorites`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/favorites` | User | Daftar satwa favorit user yang sedang login (paginasi) |
| GET | `/api/favorites/check/:animalId` | User | Mengecek apakah satwa sudah difavoritkan |
| POST | `/api/favorites/:animalId` | User | Menambahkan satwa ke favorit |
| POST | `/api/favorites` | User | Menambahkan satwa via request body `{ animal_id }` |
| DELETE | `/api/favorites/:animalId` | User | Menghapus satwa dari favorit |

### 6. Kuis Edukasi (`/api/quiz`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/quiz` | Publik | Daftar kuis aktif & total soal (bisa difilter per zona) |
| GET | `/api/quiz/:id` | Publik | Mengambil soal kuis untuk dikerjakan (**kunci jawaban disembunyikan**) |
| POST | `/api/quiz/:id/submit` | User | Mengirim jawaban kuis, kalkulasi skor otomatis, dan menyimpan hasil |
| GET | `/api/quiz/history` | User | Riwayat nilai & pengerjaan kuis user login |
| GET | `/api/quiz/results/:id` | User | Detail lembar hasil pengerjaan kuis tertentu |

### 7. Admin Endpoints (`/api/admin/...`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Statistik keseluruhan sistem |
| GET | `/api/admin/categories` | Admin | List semua kategori |
| POST | `/api/admin/categories` | Admin | Tambah kategori baru |
| PUT | `/api/admin/categories/:id` | Admin | Edit kategori |
| DELETE | `/api/admin/categories/:id` | Admin | Hapus kategori |
| GET | `/api/admin/animals` | Admin | List semua fauna admin |
| POST | `/api/admin/animals` | Admin | Tambah satwa + upload gambar R2 |
| PUT | `/api/admin/animals/:id` | Admin | Update satwa + replace gambar R2 |
| DELETE | `/api/admin/animals/:id` | Admin | Hapus satwa & hapus file di R2 |
| DELETE | `/api/admin/animals/:id/image` | Admin | Hapus hanya file gambar satwa di R2 |
| GET | `/api/admin/quiz` | Admin | Manajemen kuis |
| POST | `/api/admin/quiz` | Admin | Buat kuis baru beserta bank soal |
| PUT | `/api/admin/quiz/:id` | Admin | Update info kuis |
| DELETE | `/api/admin/quiz/:id` | Admin | Hapus kuis |
| POST | `/api/admin/quiz/:id/questions` | Admin | Tambah butir pertanyaan |
| PUT | `/api/admin/quiz/:id/questions/:qid` | Admin | Edit pertanyaan |
| DELETE | `/api/admin/quiz/:id/questions/:qid` | Admin | Hapus pertanyaan |
| GET | `/api/admin/users` | Admin | Daftar seluruh user terdaftar |
| GET | `/api/admin/users/:id` | Admin | Detail user & statistik |
| POST | `/api/admin/users` | Admin | Buat user baru secara manual |
| PUT | `/api/admin/users/:id` | Admin | Update data / role user |
| DELETE | `/api/admin/users/:id` | Admin | Hapus akun user |

---

## Deployment ke Vercel Monorepo

Project ini dikonfigurasi untuk deployment monorepo di Vercel:
1. Hubungkan repository GitHub ke project Vercel baru.
2. Atur **Root Directory** ke `apps/api`.
3. Framework Preset: **Other**.
4. Masukkan seluruh environment variable yang ada di `.env.example` ke dashboard Vercel.
5. Deploy. Express app otomatis dijalankan sebagai Vercel Serverless Function via `vercel.json`.
