# SATWA LYAR — Backend API (Express.js)

Backend API lengkap untuk project edukasi fauna **SATWA LYAR**. Dibangun menggunakan **Express.js + TypeScript + MariaDB Cloud + Cloudflare R2 + Upstash Redis**.

## Model Identitas: Guest & Admin

Semua pengunjung dapat menjelajahi situs **tanpa login**. Backend otomatis membuat
identitas **Guest** pada kunjungan pertama dan menerbitkannya sebagai cookie
(`satwa_guest`). Guest ID hanya untuk tracking — bukan password, bukan token akses.

| Jenis | Contoh ID | Login |
|---|---|---|
| Guest | `gst_a81f29c4d21f8b7c9e0a1234` | Tidak perlu |
| Admin | `adm_0001` | Wajib (email + password) |

Tabel `users` menyimpan kedua jenis identitas. Kolom `role` digantikan `is_admin`
(0 = guest, 1 = admin) dan `public_id` menjadi ID yang ditampilkan ke aplikasi.
Guest memiliki `name`, `email`, dan `password` bernilai `NULL` (dijaga oleh
CHECK constraint `chk_users_identity_fields`).

## Tech Stack

| Teknologi | Fungsi |
|---|---|
| Express.js | Core Web Framework |
| TypeScript | Type safety & maintainability |
| MariaDB Cloud | Database relasional utama |
| Cloudflare R2 | Object storage untuk aset gambar fauna (S3-compatible) |
| Upstash Redis | Caching performa tinggi (REST-based / Serverless) |
| Helmet | HTTP security headers |
| JWT (jsonwebtoken) | Session admin (stateless) |
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
│   │   ├── request-id.middleware.ts  # ID korelasi per request (X-Request-Id)
│   │   ├── guest-context.middleware.ts # Resolusi identitas (guest cookie / JWT admin)
│   │   ├── activity-logger.middleware.ts # Catat request + status + durasi
│   │   ├── auth.middleware.ts        # Guard identitas (authenticate & optionalAuthenticate)
│   │   ├── role.middleware.ts        # Guard is_admin + audit access_denied
│   │   ├── error.middleware.ts       # Global error & 404 handler + log application_error
│   │   └── validation.middleware.ts  # express-validator handler
│   ├── modules/
│   │   ├── auth/                     # Login admin, Logout, Me
│   │   ├── users/                    # Profil, ubah password, CRUD admin, penomoran adm_XXXX
│   │   ├── animals/                  # Public fauna browse/search & Admin CRUD fauna
│   │   ├── categories/               # Public 4 zona fauna & Admin CRUD kategori
│   │   ├── favorites/                # Bookmark / favorit fauna
│   │   ├── quiz/                     # Pengerjaan kuis, submit jawaban, riwayat nilai & Admin CRUD kuis
│   │   ├── logs/                     # Repository/service/controller log aktivitas
│   │   ├── track/                    # Tracking kunjungan halaman (page_view)
│   │   └── dashboard/                # Statistik dashboard admin
│   ├── database/
│   │   ├── schema.sql                # SQL schema MariaDB (tabel & seed)
│   │   ├── init-db.ts                # Skrip inisialisasi database otomatis
│   │   ├── migrate.ts                # Runner migration
│   │   └── migrations/               # 001_users_identity, 002_logs_activity
│   ├── types/express.d.ts            # Tipe Request (requestId, user, sessionIdHash)
│   ├── utils/                        # Cookie, public_id, hash session
│   ├── app.ts                        # Konfigurasi middleware & registrasi routes
│   └── server.ts                     # Server entry point & export untuk Vercel
├── api/index.ts                      # Entry point serverless function Vercel
├── .env.example
├── package.json
├── tsconfig.json
└── vercel.json
```

## Urutan Middleware

```
Request ID → Helmet + CORS + Rate Limit → Body Parser → Morgan
  → Guest Context (identitas) → Activity Logger → Route → Validation → Controller
  → Error Handler (log application_error)
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
- `GUEST_COOKIE_NAME`, `GUEST_COOKIE_SAMESITE` (Identitas guest)

> **Catatan SameSite cookie:** bila frontend dan API berada di domain berbeda
> (mis. dua project Vercel), set `GUEST_COOKIE_SAMESITE=none` agar cookie guest
> ikut terkirim. Nilai default production sudah `none` + `Secure`.

### 3. Inisialisasi / Migrasi Database
```bash
# Database baru: membuat seluruh tabel
npm run db:init

# Database lama: migrasi users (role -> is_admin + public_id), logs_activity, admin_counters
npm run db:migrate
```

### 4. Menjalankan Server Lokal
```bash
npm run dev
```
Akses API di `http://localhost:5000/api`

### 5. Validasi
```bash
npm run validate
```
Menjalankan 24 pengujian otomatis: koneksi database, identitas guest otomatis,
penolakan akses admin untuk guest, login admin, CRUD admin, penomoran `adm_XXXX`,
dan endpoint log.

### 6. Retensi Log
```bash
npm run db:prune-logs          # hapus log lebih tua dari 90 hari
npm run db:prune-logs -- 30    # hapus log lebih tua dari 30 hari
npm run db:prune-logs -- 30 dry  # hanya menghitung, tidak menghapus
```

---

## Cache Upstash Redis

Cache memakai **Upstash Redis REST API**. Konfigurasi dibaca dari environment
variable dengan dua skema nama yang sama-sama didukung:

| Nama standar (Utama) | Alias lama |
|---|---|
| `UPSTASH_REDIS_REST_URL` | `REDIS_URL` |
| `UPSTASH_REDIS_REST_TOKEN` | `REDIS_TOKEN` |

Kalau keduanya tidak terisi, cache otomatis dinonaktifkan (tanpa error) dan
aplikasi tetap berjalan normal.

| Endpoint | Cache key | TTL |
|---|---|---|
| `GET /api/categories` | `v{versi}:public_categories_list` | 10 menit |
| `GET /api/animals` (tanpa filter, page 1) | `v{versi}:public_animals_p1_limit_{limit}_sort_{sort}` | 3 menit |

`limit` dan `sort` ikut masuk key agar hasil cache tidak pernah berbeda dengan
hasil query database.

**Invalidasi:** setiap admin mengubah fauna/kategori, versi cache dinaikkan
(`INCR satwa_cache_version`), sehingga seluruh key versi lama langsung tidak
dipakai lagi. Data yang diedit admin langsung terlihat tanpa menunggu TTL habis.

---

## Tabel `logs_activity`

Pusat pencatatan aktivitas Guest, audit Admin, error aplikasi, dan monitoring
payload kuis.

| Field | Fungsi |
|---|---|
| `request_id` | Menghubungkan log dari request yang sama |
| `user_id` | Relasi internal ke identitas di tabel `users` |
| `actor_public_id` | Menyimpan `gst_...` atau `adm_...` untuk audit |
| `actor_type` | Membedakan Guest, Admin, dan sistem |
| `event_type` | Kategori log (lihat tabel di bawah) |
| `endpoint` | Endpoint yang diakses |
| `ip_address` / `user_agent` | Informasi koneksi & perangkat |
| `session_id_hash` | Hash sesi, bukan token mentah |
| `payload_json` | Data request yang sudah disaring |
| `http_status` / `duration_ms` | Status respons & durasi pemrosesan |
| `error_code` / `error_message` | Detail error aplikasi |

Event type: `page_view`, `api_request`, `quiz_payload`, `admin_action`,
`login_success`, `login_failed`, `logout`, `access_denied`, `application_error`,
`security_event`.

Kebijakan payload: password, token, header autentikasi, cookie mentah, dan kunci
jawaban benar **tidak pernah** disimpan. Ukuran payload dibatasi (8 KB) dan
dipotong otomatis bila terlalu besar.

---

## Daftar Lengkap API Endpoints

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | Publik | Login **admin** (email + password). Guest otomatis dibuat oleh middleware. |
| POST | `/api/auth/logout` | Identitas | Logout sesi admin (audit `ADMIN_LOGOUT`) |
| GET | `/api/auth/me` | Identitas | Identitas aktif (admin atau guest) + statistik favorit & kuis |

> Endpoint `POST /api/auth/register` dihapus. Pengunjung tidak perlu mendaftar;
> identitas guest dibuat otomatis oleh backend.

### 2. Profil (`/api/users`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/users/profile` | Identitas | Profil & ringkasan statistik (kuis, favorit) |
| PUT | `/api/users/profile` | Admin | Memperbarui nama profil (guest ditolak) |
| PUT | `/api/users/password` | Admin | Mengganti kata sandi dengan verifikasi password lama |

### 3. Fauna / Satwa Edukasi (`/api/animals`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/animals` | Publik | Browse satwa, pagination (`page`, `limit`), search (`search`), filter zona (`zone` / `category_id`), filter konservasi (`status`), sorting (`sort`). Status `is_favorite` mengikuti identitas aktif. |
| GET | `/api/animals/:id` | Publik | Detail lengkap satwa, status favorit personal, dan rekomendasi satwa sejenis |

### 4. Zona / Kategori (`/api/categories`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/categories` | Publik | Daftar 4 zona fauna (Air Tawar, Serangga, Reptil, Burung) & total satwa per zona |
| GET | `/api/categories/:identifier` | Publik | Detail zona berdasarkan ID atau slug (misal: `air-tawar`) beserta daftar satwanya |

### 5. Favorit Satwa (`/api/favorites`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/favorites` | Identitas | Daftar satwa favorit identitas aktif (paginasi) |
| GET | `/api/favorites/check/:animalId` | Identitas | Mengecek apakah satwa sudah difavoritkan |
| POST | `/api/favorites/:animalId` | Identitas | Menambahkan satwa ke favorit |
| POST | `/api/favorites` | Identitas | Menambahkan satwa via request body `{ animal_id }` |
| DELETE | `/api/favorites/:animalId` | Identitas | Menghapus satwa dari favorit |

### 6. Kuis Edukasi (`/api/quiz`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/quiz` | Publik | Daftar kuis aktif & total soal (bisa difilter per zona) |
| GET | `/api/quiz/:id` | Publik | Mengambil soal kuis untuk dikerjakan (**kunci jawaban disembunyikan**) |
| POST | `/api/quiz/:id/submit` | Identitas | Mengirim jawaban kuis, kalkulasi skor otomatis, menyimpan hasil, dan mencatat payload kuis (`quiz_payload`) |
| GET | `/api/quiz/history` | Identitas | Riwayat nilai & pengerjaan kuis |
| GET | `/api/quiz/results/:id` | Identitas | Detail lembar hasil pengerjaan kuis tertentu |

### 7. Tracking (`/api/track`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/track/page-view` | Publik | Mencatat kunjungan halaman (`page_view`) |

### 8. Admin Endpoints (`/api/admin/...`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Statistik fauna, kategori, kuis, jumlah guest & admin, aktivitas log 24 jam |
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
| GET | `/api/admin/users` | Admin | Daftar identitas (`scope=admin\|guest\|all`, `search`) |
| GET | `/api/admin/users/:id` | Admin | Detail identitas & statistik |
| POST | `/api/admin/users` | Admin | Buat akun admin baru (public_id `adm_XXXX` otomatis & berurutan) |
| PUT | `/api/admin/users/:id` | Admin | Update data admin |
| DELETE | `/api/admin/users/:id` | Admin | Hapus akun admin |
| GET | `/api/admin/logs` | Admin | Baca & filter log aktivitas (`event_type`, `actor_type`, `actor_public_id`, `action`, `endpoint`, `from`, `to`, `q`) |
| GET | `/api/admin/logs/summary` | Admin | Ringkasan log per event type & actor type (`days=7`) |

Semua aksi admin tercatat pada `logs_activity` dengan `event_type = 'admin_action'`
beserta ringkasan perubahan sebelum/sesudah (tanpa password hash atau token).

---

## Deployment ke Vercel Monorepo

Project ini memakai **zero-config Express** (pola resmi Vercel): file
`src/server.ts` mengekspor aplikasi Express sebagai default export, sehingga
seluruh path request diteruskan apa adanya ke Express (tidak ada rewrite yang
memotong path).

1. Hubungkan repository GitHub ke project Vercel baru.
2. Atur **Root Directory** ke `apps/api`.
3. Framework Preset: **Other** (deteksi otomatis Express).
4. Masukkan seluruh environment variable yang ada di `.env.example` ke dashboard Vercel
   (`PORT`, `DB_*`, `JWT_SECRET`, `R2_*`, `REDIS_*`, `CORS_ORIGIN`,
   `GUEST_COOKIE_NAME`, `GUEST_COOKIE_SAMESITE`).
5. Deploy. Express app menjadi satu Vercel Function; `src/server.ts` otomatis
   melewati `app.listen()` karena `process.env.VERCEL` terisi.

Catatan: jangan menambahkan `api/index.ts` + `rewrites: /(.*) → /api`.
Rewrite tersebut mengganti path request, sehingga endpoint seperti
`/api/animals` tidak akan sampai ke Express dan berakhir 404.
