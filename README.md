# SATWA LYAR 🦎

**SATWA LYAR** adalah platform website edukasi fauna interaktif berbasis monorepo yang dirancang untuk memperkenalkan keanekaragaman satwa berdasarkan 4 zona fauna Indonesia dan dunia:
- 🐟 **Zona Air Tawar**
- 🦋 **Zona Serangga**
- 🦎 **Zona Reptil**
- 🦅 **Zona Burung**

Pengguna dapat menjelajahi informasi fauna secara mendalam, melakukan pencarian dan filter satwa, menyimpan fauna favorit, serta menguji pengetahuan fauna melalui kuis interaktif berbobot nilai.

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
- **Database:** MariaDB Cloud (Database Relasional)
- **Cache:** Upstash Redis (Serverless Caching)
- **Object Storage:** Cloudflare R2 (S3-compatible Media Storage)
- **Security:** Helmet, CORS, JWT, bcryptjs, express-rate-limit, express-validator
- **Deployment:** Vercel (Pola Multi-Project Monorepo via Root Directory)

---

## Pembagian Kerja Tim

1. **Backend Admin:**
   - Autentikasi & Otorisasi Admin
   - CRUD Fauna (+ Upload / Hapus Gambar Cloudflare R2)
   - CRUD Kategori (4 Zona)
   - CRUD Kuis & Bank Soal
   - Manajemen Pengguna
   - Dashboard Statistik API

2. **Backend User:**
   - Registrasi, Login, Logout, Profil Pengguna, Ganti Password
   - Eksplorasi Fauna (Browse, Search, Filter Zona & Status Konservasi, Sorting)
   - Eksplorasi 4 Zona Fauna
   - Manajemen Favorit (Bookmark fauna, Cek status favorit)
   - Pengerjaan Kuis (Ambil soal aman tanpa bocor kunci jawaban, Submit & Hitung Skor, Riwayat Hasil Kuis)

3. **Frontend Admin:**
   - Dashboard Admin, Tabel Data Fauna & Kategori, Form Upload Satwa R2, Manajemen Kuis, Manajemen User.

4. **Frontend User:**
   - Homepage, Halaman 4 Zona Fauna, Detail Satwa, Fitur Pencarian & Filter, Antarmuka Kuis, Riwayat Nilai, Profil Pengguna & Daftar Favorit.

---

## Menjalankan Project

### 1. Backend API
```bash
# Inisialisasi tabel database MariaDB Cloud
npm run db:init

# Jalankan server Express development (port 5000)
npm run dev:api
```

Dokumentasi detail endpoint API tersedia di [apps/api/README.md](file:///e:/pkl/Satwa-Lyar/Satwa-Lyar/apps/api/README.md).