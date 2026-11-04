# 01 — Business Workflow SATWA LYAR

Diagram berikut memisahkan workflow yang terlihat pada frontend dan workflow yang tersedia pada backend. Page view tidak berlaku pada `/akses-admin` dan `/admin` karena `PageViewTracker` mengecualikan prefix tersebut.

## Workflow pengunjung

```mermaid
flowchart TD
    A[Pengunjung membuka website] --> B[Next.js merender halaman publik]
    B --> C[PageViewTracker membaca pathname]
    C --> D{Path admin?}
    D -- Ya --> E[Tidak mengirim page view]
    D -- Tidak --> F[POST /api/track/page-view]
    F --> G[Backend menyimpan event page_view]
    B --> H[Menjelajah konten publik]
    H --> I[Halaman zona, landing, atau detail satwa]
```

## Workflow administrator

```mermaid
flowchart TD
    A[Buka /akses-admin atau /login] --> B[Isi email dan password]
    B --> C[POST /api/auth/login]
    C --> D{Valid dan is_admin = 1?}
    D -- Tidak --> E[Tampilkan error login]
    D -- Ya --> F[Terima JWT dan data user]
    F --> G[Simpan sesi pada localStorage frontend]
    G --> H[AdminGuard + GET /api/auth/me]
    H --> I{Sesi valid?}
    I -- Tidak --> J[Hapus sesi dan redirect login]
    I -- Ya --> K[Buka panel admin]
    K --> L[Dashboard / fauna / kategori / kuis / users / logs]
    L --> M[Request API memakai Bearer JWT]
    M --> N[authenticate + requireAdmin]
    N --> O[Proses bisnis dan audit log]
```

## Workflow eksplorasi fauna

```mermaid
flowchart TD
    A[Pilih zona atau pencarian] --> B{UI mengambil data API?}
    B -- Halaman publik tertentu --> C[Data presentasi lokal pada page source]
    B -- Client API --> D[GET /api/animals atau /api/categories]
    D --> E[Optional authentication untuk status favorit]
    E --> F[Query MariaDB dan cache Redis bila aktif]
    F --> G[JSON data + pagination]
    G --> H[Render daftar/filter]
    H --> I[Pilih satwa]
    I --> J[GET /api/animals/:id]
    J --> K[Render detail, kategori, gambar R2, rekomendasi]
```

## Workflow pengelolaan data fauna

```mermaid
flowchart TD
    A[Admin membuka modul fauna] --> B[GET /api/admin/animals]
    B --> C[Isi form fauna dan opsional gambar]
    C --> D[POST atau PUT multipart/form-data]
    D --> E[Multer memvalidasi tipe dan batas file 5 MB]
    E --> F[authenticate + requireAdmin + express-validator]
    F --> G{Ada gambar?}
    G -- Ya --> H[Upload/replace file pada Cloudflare R2]
    G -- Tidak --> I[Pertahankan atau kosongkan image_key sesuai aksi]
    H --> J[Simpan/update record animals di MariaDB]
    I --> J
    J --> K[Naikkan versi cache]
    K --> L[Catat admin_action]
    L --> M[Kirim response JSON]
    M --> N[DELETE dapat menghapus record dan file R2]
```

## Workflow kuis

Backend mendukung workflow ini. UI frontend pengguna untuk alur tersebut belum terverifikasi; UI yang teridentifikasi adalah manajemen kuis admin.

```mermaid
flowchart TD
    A[GET /api/quiz] --> B[Daftar kuis aktif]
    B --> C[GET /api/quiz/:id]
    C --> D[Soal dikirim tanpa correct_answer]
    D --> E[Pengguna mengirim jawaban]
    E --> F[POST /api/quiz/:id/submit]
    F --> G[authenticate dan validasi jawaban]
    G --> H[Backend mengambil kunci jawaban dari DB]
    H --> I[Hitung skor]
    I --> J[Simpan quiz_results]
    I --> K[Simpan quiz_payload yang disaring]
    J --> L[GET /api/quiz/history atau /results/:id]
```

## Catatan validasi

- Backend menyediakan fitur guest, favorit, kuis, profil, dan tracking.
- Frontend yang dapat diverifikasi jelas menyediakan panel admin, detail satwa, page-view tracker, dan client API admin/public animals.
- Halaman zona dan landing mengandung data presentasi lokal; keterhubungan setiap kartu zona ke endpoint publik tidak seragam.
- `/farmhouse` ada sebagai route frontend, tetapi tidak termasuk empat kategori seed pada schema SQL.
