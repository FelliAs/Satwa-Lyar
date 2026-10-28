# SATWA LYAR 🦎

**SATWA LYAR** adalah platform website edukasi fauna interaktif berbasis monorepo yang dirancang untuk memperkenalkan keanekaragaman satwa berdasarkan 4 zona fauna Indonesia dan dunia:
- 🐟 **Zona Air Tawar**
- 🦋 **Zona Serangga**
- 🦎 **Zona Reptil**
- 🦅 **Zona Burung**

Pengguna dapat menjelajahi informasi fauna secara mendalam, melakukan pencarian dan filter satwa, menyimpan fauna favorit, serta menguji pengetahuan fauna melalui kuis interaktif berbobot nilai.

---

## Model Identitas: Guest & Admin

Semua pengunjung dapat menjelajahi situs **tanpa login**. Backend otomatis membuat
identitas **Guest** (`gst_...`) pada kunjungan pertama dan menerbitkannya sebagai
cookie. Guest ID tersebut tetap dipakai selama cookie masih tersedia.

| Jenis | Contoh ID | Login |
|---|---|---|
| Guest | `gst_a81f29c4d21f8b7c9e0a1234` | Tidak perlu |
| Admin | `adm_0001` | Wajib (email + password) |

Autentikasi (JWT) hanya diwajibkan untuk **Admin**. Seluruh aktivitas — pengunjung,
audit admin, error aplikasi, serta payload kuis yang telah disaring — tercatat pada
satu tabel `logs_activity`.

| Halaman | Rute | Keterangan |
|---|---|---|
| Publik | `/` | Landing page, tidak memerlukan login |
| Login Admin | `/akses-admin` | Alamat internal tim, tidak ditampilkan di navigasi publik |
| Dashboard Admin | `/admin/dashboard` | Hanya untuk `is_admin = 1`, endpoint API dilindungi backend |

---

## Arsitektur Monorepo & Teknologi

```
SATWA-LYAR/
├── apps/
│   ├── api/             # Backend REST API (Express.js + TypeScript)
│   └── web/             # Frontend Client (Next.js App Router)
├── .gitignore
├── package.json         # Workspace Monorepo Root
└── README.md
```

### Tech Stack Utama
- **Frontend:** Next.js (App Router, Responsive UI, SSR/SSG)
- **Backend:** Express.js (TypeScript, REST API)
- **Database:** MariaDB Cloud (Database Relasional) + migration versioning
- **Cache:** Upstash Redis (Serverless Caching)
- **Object Storage:** Cloudflare R2 (S3-compatible Media Storage)
- **Security:** Helmet, CORS, JWT, bcryptjs, express-rate-limit, express-validator
- **Observability:** Request ID korelasi, `logs_activity` (aktivitas, audit, error, payload kuis)
- **Deployment:** Vercel (Pola Multi-Project Monorepo via Root Directory)

---

## Pembagian Kerja Tim

1. **Backend Admin:**
   - Autentikasi & Otorisasi Admin (`is_admin`) dengan penomoran `adm_XXXX` transaksional
   - CRUD Fauna (+ Upload / Hapus Gambar Cloudflare R2)
   - CRUD Kategori (4 Zona)
   - CRUD Kuis & Bank Soal
   - Manajemen Administrator
   - Dashboard Statistik API
   - Audit log (`admin_action`, `login_success`, `login_failed`, `access_denied`)
   - Endpoint pembaca log (`GET /api/admin/logs`, `/api/admin/logs/summary`)

2. **Backend User:**
   - Identitas Guest otomatis (tanpa nama/email/password), Login Admin, Logout, Profil, Ganti Password
   - Eksplorasi Fauna (Browse, Search, Filter Zona & Status Konservasi, Sorting)
   - Eksplorasi 4 Zona Fauna
   - Manajemen Favorit (Bookmark fauna, Cek status favorit)
   - Pengerjaan Kuis (Ambil soal aman tanpa bocor kunci jawaban, Submit & Hitung Skor, Riwayat Hasil Kuis)
   - Monitoring payload kuis yang telah disaring (`quiz_payload`)

3. **Frontend Admin:**
   - Halaman login `/akses-admin`, Dashboard Admin `/admin/dashboard`, Ringkasan Aktivitas Terakhir.

4. **Frontend User:**
   - Homepage, Halaman 4 Zona Fauna, Detail Satwa, Fitur Pencarian & Filter, Antarmuka Kuis, Riwayat Nilai, Profil Pengguna & Daftar Favorit.

---

## Menjalankan Project

### 1. Backend API
```bash
# Inisialisasi tabel database MariaDB Cloud (database baru)
npm run db:init

# Migrasi database lama (role -> is_admin + public_id, logs_activity, admin_counters)
npm run db:migrate

# Jalankan server Express development (port 5000)
npm run dev:api

# Validasi otomatis 22 pengujian (koneksi, guest, login admin, CRUD, log)
npm run validate
```

### 2. Frontend Web
```bash
# Salin konfigurasi API lalu jalankan Next.js (port 3000)
cp apps/web/.env.example apps/web/.env.local
npm run dev:web
```

Dokumentasi detail endpoint API tersedia di [apps/api/README.md](apps/api/README.md).