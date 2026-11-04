# 04 — Activity Diagram SATWA LYAR

Dokumen ini memuat tiga activity diagram berdasarkan alur aktual frontend Next.js, API client, route/controller backend, middleware, dan database. Data presentasi pada halaman landing/zona dibedakan dari detail satwa yang diambil melalui API.

## 1. Activity Diagram Aktivitas Pengunjung

```plantuml
@startuml
title Activity Diagram — Aktivitas Pengunjung SATWA LYAR
|Pengunjung|
start
:Membuka landing page atau halaman zona;
|Frontend Next.js|
:Merender halaman publik;
:Menampilkan konten presentasi zona (sebagian data lokal page);
|Pengunjung|
:Memilih zona atau melanjutkan eksplorasi;
|Frontend Next.js|
:Menjalankan pencarian/filter jika tersedia;
:Menampilkan hasil interaksi UI;
|Pengunjung|
:Memilih satwa atau membuka URL detail satwa;
|Frontend Next.js|
if (ID satwa berupa angka?) then (ya)
  :Set state loading;
  :Memanggil animalsApi.getPublicById;
else (tidak)
  :Set state not-found;
  :Menampilkan "Satwa tidak ditemukan";
  stop
endif
|Backend API|
:Menerima GET /api/animals/:id;
:Menjalankan guestContext dan optionalAuthenticate;
:Mengambil detail satwa, kategori, rekomendasi, dan status favorit opsional;
if (Data satwa ditemukan?) then (ya)
  :Mengembalikan response JSON 200;
else (tidak)
  :Menghasilkan error 404;
endif
|Frontend Next.js|
if (Response berhasil?) then (ya)
  :Menyimpan data detail pada state;
  :Menampilkan nama, kategori, deskripsi, habitat, makanan, ciri fisik, dan gambar;
  stop
elseif (Response 404?) then (404)
  :Menampilkan "Satwa tidak ditemukan";
  stop
else (request gagal)
  :Menampilkan pesan detail belum dapat dimuat;
  :Menyediakan tombol coba lagi;
  stop
endif
@enduml
```

### Penjelasan

Halaman detail memvalidasi ID agar berupa angka, menampilkan state loading, memanggil `animalsApi.getPublicById`, lalu membedakan kondisi 404 dari error request lain. Backend membaca detail dari MariaDB dan membentuk URL gambar publik dari `image_key` bila tersedia. Pencarian/filter pada landing dan halaman zona merupakan state/interaksi pada halaman frontend; diagram tidak menyatakan seluruhnya sebagai query API.

## 2. Activity Diagram Aktivitas Administrator

```plantuml
@startuml
title Activity Diagram — Aktivitas Administrator SATWA LYAR
|Administrator|
start
:Membuka /akses-admin atau /login;
:Mengisi email dan password;
|Frontend Next.js|
:Mengirim POST /api/auth/login;
|Backend API|
:Memvalidasi input, mencari user, dan membandingkan password bcrypt;
if (Kredensial valid dan is_admin = 1?) then (ya)
  :Membuat JWT admin;
  :Mencatat login_success;
  :Mengirim JWT dan data user;
else (tidak)
  :Mencatat login_failed;
  :Mengirim response error;
endif
|Frontend Next.js|
if (Login berhasil?) then (ya)
  :Menyimpan JWT dan user pada localStorage;
  :Mengirim GET /api/auth/me dengan Bearer JWT;
else (tidak)
  :Menampilkan pesan kesalahan login;
  stop
endif
|Backend API|
:Memverifikasi JWT dan memuat user dari database;
if (Sesi valid dan user admin?) then (ya)
  :Mengembalikan identitas admin;
else (tidak)
  :Mengembalikan 401/403;
endif
|Frontend Next.js|
if (Sesi terverifikasi?) then (ya)
  :AdminGuard mengizinkan panel admin;
  :Membuka dashboard;
else (tidak)
  :Menghapus sesi lokal dan redirect ke login;
  stop
endif
repeat
  |Administrator|
  :Memilih modul administrator;
  |Frontend Next.js|
  if (Modul?) then (dashboard)
    :Mengirim GET /api/admin/dashboard;
  elseif (fauna)
    :Mengirim GET, POST, PUT, atau DELETE /api/admin/animals;
  elseif (kategori)
    :Mengirim GET, POST, PUT, atau DELETE /api/admin/categories;
  elseif (kuis)
    :Mengirim request ke /api/admin/quiz dan endpoint /questions;
  elseif (akun administrator)
    :Mengirim GET, POST, PUT, atau DELETE /api/admin/users;
  else (activity log)
    :Mengirim GET /api/admin/logs atau /api/admin/logs/summary;
  endif
  |Backend API|
  :Memeriksa authenticate;
  :Memeriksa hak admin dengan requireAdmin;
  if (Akses diizinkan?) then (ya)
    :Memproses controller dan query/mutasi database;
    :Mengakses R2 bila operasi fauna memerlukan gambar;
    :Mencatat audit admin bila berlaku;
    :Mengirim response hasil operasi;
  else (tidak)
    :Mengirim response 401/403 dan mencatat access_denied;
  endif
  |Frontend Next.js|
  :Memproses response API;
  :Menampilkan data, notifikasi sukses, atau pesan kesalahan pada modul;
  |Administrator|
repeat while (Melanjutkan aktivitas admin?) is (ya) not (logout)
:Memilih logout;
|Frontend Next.js|
:Mengirim POST /api/auth/logout;
:Menghapus token dan user dari localStorage;
:Membersihkan state AuthContext;
stop
@enduml
```

### Penjelasan

Sesi frontend memakai JWT yang disimpan pada `localStorage`. Saat aplikasi dimuat, `AuthContext` mengambil token dan memanggil `/api/auth/me`; `AdminGuard` menampilkan spinner selama verifikasi dan mengarahkan ke `/login` jika sesi tidak valid. Setiap route admin backend juga menerapkan `authenticate` dan `requireAdmin`. Modul yang digambarkan sesuai halaman admin aktual: dashboard, animals, categories, quiz, users, dan logs.

## 3. Activity Diagram Pencatatan Page View

```plantuml
@startuml
title Activity Diagram — Pencatatan Page View SATWA LYAR
|Pengunjung|
start
:Membuka atau berpindah halaman;
|Frontend Next.js|
:usePathname membaca pathname;
if (Pathname tersedia?) then (ya)
  if (Path diawali /akses-admin atau /admin?) then (ya)
    :Tidak mengirim page view;
    stop
  else (tidak)
    :Membentuk body path dan document.referrer;
    :POST /api/track/page-view melalui apiRequest;
  endif
else (tidak)
  :Tidak melakukan apa-apa;
  stop
endif
|Backend API|
:guestContext membaca Bearer JWT atau cookie Guest;
if (Identitas Guest valid?) then (ya)
  :Menggunakan Guest yang sudah ada;
else (tidak)
  :Membuat record Guest pada users dan mengirim cookie;
endif
:trackPageView mengambil path/referrer sebagai string;
:Memotong masing-masing nilai maksimal 500 karakter;
:recordActivity menyimpan event page_view ke logs_activity;
if (Penyimpanan berhasil?) then (ya)
:Mengirim response berhasil;
else (gagal)
  :Meneruskan error ke error handler;
endif
|Frontend Next.js|
if (Request tracking berhasil?) then (ya)
  :Tracking selesai;
else (gagal)
  :catch mengabaikan error;
  :Halaman tetap berjalan (best-effort);
endif
stop
@enduml
```

### Penjelasan

`PageViewTracker` dipasang pada layout utama dan bereaksi terhadap perubahan pathname. Prefix `/akses-admin` dan `/admin` dikecualikan. Pada halaman publik, request tracking dikirim tanpa mengganggu rendering; error ditangkap dan tidak ditampilkan sebagai kegagalan halaman. `guestContext` membuat atau memulihkan Guest secara otomatis, bukan melalui proses login.

## 4. File sumber pendukung

### Aktivitas pengunjung dan detail satwa

- `apps/web/app/page.tsx`
- `apps/web/app/airtawar/page.tsx`
- `apps/web/app/serangga/page.tsx`
- `apps/web/app/reptils/page.tsx`
- `apps/web/app/burung/page.tsx`
- `apps/web/app/farmhouse/page.tsx`
- `apps/web/app/satwa/[id]/page.tsx`
- `apps/web/lib/api.ts`
- `apps/api/src/modules/animals/animals.public.routes.ts`
- `apps/api/src/modules/animals/animals.public.controller.ts`
- `apps/api/src/middleware/guest-context.middleware.ts`

### Aktivitas administrator

- `apps/web/app/akses-admin/page.tsx`
- `apps/web/app/login/page.tsx`
- `apps/web/context/AuthContext.tsx`
- `apps/web/components/AdminGuard.tsx`
- `apps/web/components/AdminLayout.tsx`
- `apps/web/app/admin/dashboard/*`
- `apps/web/app/admin/animals/page.tsx`
- `apps/web/app/admin/categories/page.tsx`
- `apps/web/app/admin/quiz/page.tsx`
- `apps/web/app/admin/users/page.tsx`
- `apps/web/app/admin/logs/page.tsx`
- `apps/api/src/modules/auth/*`
- `apps/api/src/middleware/auth.middleware.ts`
- `apps/api/src/middleware/role.middleware.ts`
- `apps/api/src/modules/dashboard/*`
- `apps/api/src/modules/animals/*`
- `apps/api/src/modules/categories/*`
- `apps/api/src/modules/quiz/*`
- `apps/api/src/modules/users/*`
- `apps/api/src/modules/logs/*`

### Pencatatan page view dan database

- `apps/web/app/layout.tsx`
- `apps/web/components/PageViewTracker.tsx`
- `apps/web/lib/api.ts`
- `apps/api/src/modules/track/track.routes.ts`
- `apps/api/src/modules/track/track.controller.ts`
- `apps/api/src/middleware/guest-context.middleware.ts`
- `apps/api/src/middleware/activity-logger.middleware.ts`
- `apps/api/src/modules/logs/logs.service.ts`
- `apps/api/src/database/schema.sql`

## 5. Catatan validasi

- Diagram tidak memasukkan favorit, kuis pengguna, atau profil sebagai aktivitas frontend karena tidak ditemukan halaman frontend pengguna yang memanggil endpoint tersebut.
- Detail satwa dibedakan dari halaman zona: detail menggunakan request `GET /api/animals/:id`, sedangkan beberapa halaman zona memiliki konten presentasi lokal.
- Ketiga diagram menggunakan PlantUML dan masing-masing memiliki pasangan `@startuml`/`@enduml`.
- Tidak ada source code aplikasi yang diubah.

## 6. Tabel audit akhir

| Aktivitas yang diperiksa | File dan fungsi sumber | Hasil verifikasi | Perubahan yang dilakukan |
|---|---|---|---|
| Validasi ID detail satwa | `apps/web/app/satwa/[id]/page.tsx` — `loadAnimal` | ID harus cocok dengan `/^\d+$/`; jika tidak, state menjadi `not-found`. | Dipertahankan pada diagram pengunjung. |
| Request detail satwa | `apps/web/lib/api.ts` — `animalsApi.getPublicById`; `apps/api/src/modules/animals/animals.public.routes.ts` — `GET /:id` | Frontend memanggil `GET /api/animals/:id`; route memakai `optionalAuthenticate`. | Dipertahankan dan dijelaskan sebagai alur API detail. |
| Data detail satwa | `animals.public.controller.ts` — `getPublicAnimalById` | Controller mengambil field satwa, kategori, URL gambar, rekomendasi satwa sejenis, dan `is_favorite`. | Status favorit tetap dicantumkan karena terbukti dikembalikan controller. |
| Error detail satwa | `page.tsx` — `catch` pada `loadAnimal`; `animals.public.controller.ts` | HTTP 404 menjadi state `not-found`; error lain menjadi state `error` dengan opsi coba lagi; abort request diabaikan. | Percabangan 404 dan request gagal dipertahankan. |
| Login admin berhasil/gagal | `apps/api/src/modules/auth/auth.controller.ts` — `login` | Kredensial salah dicatat `login_failed`; admin valid dicatat `login_success`; akun non-admin dicatat `access_denied`. | Tetap dicantumkan pada alur login. |
| Penyimpanan dan verifikasi sesi | `apps/web/context/AuthContext.tsx` — `login`, `initAuth`; `apps/web/components/AdminGuard.tsx` | JWT dan user disimpan di `localStorage`; sesi diverifikasi melalui `GET /api/auth/me`; sesi tidak valid dibersihkan dan diarahkan ke login. | Dipertahankan sesuai frontend aktual. |
| Akses modul admin | `apps/api/src/modules/*/*.routes.ts`; `auth.middleware.ts` — `authenticate`; `role.middleware.ts` — `requireAdmin` | Dashboard, fauna, kategori, kuis, users, dan logs menerapkan autentikasi serta pemeriksaan admin pada route. | Diagram diubah menjadi request → validasi → proses → response per modul. |
| Operasi endpoint admin | `apps/web/lib/api.ts`; seluruh halaman `apps/web/app/admin/*` | Endpoint yang digambarkan sesuai client: dashboard, animals, categories, quiz/questions, users, logs. | Endpoint modul ditulis langsung pada cabang aktivitas administrator. |
| Integrasi Cloudflare R2 | `apps/api/src/modules/animals/animals.controller.ts` — create/update/delete image; `apps/api/src/config/r2.ts` | R2 digunakan pada operasi gambar fauna, bukan pada dashboard, kategori, kuis, users, atau logs. | Diagram membatasi R2 pada operasi fauna yang memerlukan gambar. |
| Audit akses admin | `role.middleware.ts` — `requireAdmin`; `auth.controller.ts` — penolakan akun non-admin | Akses ditolak dicatat sebagai `access_denied` sebelum response 403 pada role guard dan saat login akun non-admin. | Dipertahankan pada cabang akses ditolak. |
| PageViewTracker | `apps/web/components/PageViewTracker.tsx` | Membaca pathname; mengabaikan pathname kosong dan prefix `/akses-admin`/`/admin`; mengirim POST tracking untuk halaman lain; error ditangkap. | Pengecualian dan sifat best-effort dipertahankan. |
| Resolusi Guest | `apps/api/src/app.ts` — urutan middleware; `guest-context.middleware.ts` — `guestContext` | `guestContext` berjalan sebelum `activityLogger` dan route; memeriksa Bearer JWT, cookie Guest, atau membuat Guest baru serta cookie. | Urutan dan mekanisme cookie dipertahankan tanpa memodelkan login Guest. |
| Penyimpanan page view | `apps/api/src/modules/track/track.controller.ts` — `trackPageView`; `logs.service.ts` — `recordActivity` | Path/referrer dinormalisasi dan dipotong maksimal 500 karakter, lalu disimpan sebagai event `page_view`; kegagalan diteruskan ke error handler. | Diagram memakai istilah response berhasil tanpa mengandalkan kode status tertentu. |

### Kesimpulan audit

Tidak ditemukan ketidaksesuaian material antara tiga diagram dan source code yang diperiksa. Status favorit pada detail satwa memiliki bukti langsung pada controller. Perubahan utama audit adalah memperjelas request–response setiap modul administrator, membatasi integrasi R2 pada operasi gambar fauna, serta mendokumentasikan status tracking secara generik sebagai response berhasil dan best-effort.
