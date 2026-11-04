# 10 — Sequence Diagram Pengelolaan Kuis dan Pertanyaan

Dokumen ini menggambarkan pengelolaan kuis oleh Administrator berdasarkan halaman `apps/web/app/admin/quiz/page.tsx`, API client `quizApi`, route/controller admin kuis, validasi request, dan schema MariaDB. Alur pengerjaan kuis oleh pengunjung tidak termasuk dalam diagram ini.

## Sequence Diagram — Administrator Mengelola Kuis dan Pertanyaan

Route admin kuis berada di bawah `/api/admin/quiz`. Seluruh route tersebut menggunakan middleware `authenticate` dan `requireAdmin`. Middleware global dijalankan sebelum request diteruskan ke route admin.

```plantuml
@startuml
title Sequence Diagram — Administrator Mengelola Kuis dan Pertanyaan
autonumber

actor "Administrator" as Admin
participant "Browser / Frontend Next.js\nadmin/quiz/page.tsx" as Web
participant "API Client\nquizApi" as Client
participant "Middleware global\nrequestId, security, parser, guestContext, activityLogger" as GlobalMW
participant "Route admin\n/api/admin/quiz" as Route
participant "Middleware admin\nauthenticate + requireAdmin" as AdminMW
participant "Validation\nexpress-validator" as Validation
participant "Quiz Controller\nquiz.controller.ts" as Controller
database "MariaDB" as DB
participant "Audit log\nrecordAdminAction" as Audit

== Memuat daftar kuis ==
Admin -> Web: Membuka /admin/quiz
Web -> Web: AdminLayout/AdminGuard memeriksa sesi pada UI
Web -> Client: quizApi.list()
Client -> GlobalMW: GET /api/admin/quiz
GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route admin
Route -> AdminMW: authenticate lalu requireAdmin
alt Sesi tidak valid atau bukan administrator
    AdminMW --> Route: Response 401/403
    Route --> Client: Response 401/403
    Client --> Web: ApiError
    Web --> Admin: Menampilkan error pemuatan
else Akses administrator diizinkan
    AdminMW -> Controller: getAllQuizzes
    Controller -> DB: SELECT quizzes LEFT JOIN categories\nLEFT JOIN quiz_questions, COUNT(qq.id)\nGROUP BY q.id ORDER BY q.created_at DESC
    DB --> Controller: Daftar kuis, kategori, total_questions
    Controller --> Route: Response 200
    Route --> Client: Response berhasil
    Client --> Web: Quiz[]
    Web --> Admin: Menampilkan tabel kuis
end

== Menambah kuis ==
Admin -> Web: Memilih Tambah Quiz
Web -> Web: Membuka form kuis
Admin -> Web: Mengisi judul, deskripsi, kategori, dan status aktif
Web -> Web: Validasi HTML required dan maxLength
alt Validasi frontend gagal
    Web --> Admin: Browser menampilkan pesan validasi
else Input frontend dapat dikirim
    Web -> Client: quizApi.create(payload)
    Client -> GlobalMW: POST /api/admin/quiz dengan JSON
    GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
    GlobalMW -> Route: Meneruskan request ke route admin
    Route -> AdminMW: authenticate lalu requireAdmin
    alt Sesi tidak valid atau bukan administrator
        AdminMW --> Route: Response 401/403
        Route --> Client: Response 401/403
        Client --> Web: ApiError
        Web --> Admin: Menampilkan kegagalan penyimpanan
    else Akses administrator diizinkan
        AdminMW -> Validation: createQuizValidation lalu validate
        alt Validasi backend gagal
            Validation --> Route: Response 422 Validasi gagal
            Route --> Client: Response 422
            Client --> Web: ApiError
            Web --> Admin: Menampilkan pesan validasi
        else Input valid
            Validation -> Controller: createQuiz
            Controller -> DB: INSERT INTO quizzes
            DB --> Controller: quizId
            Controller -> DB: SELECT kuis baru dan kategori
            DB --> Controller: Data kuis baru
            Controller -> DB: SELECT quiz_questions untuk quizId
            DB --> Controller: Daftar pertanyaan kosong
            Controller -> Audit: recordAdminAction CREATE_QUIZ
            Controller --> Route: Response 201 dan data kuis
            Route --> Client: Response berhasil
            Client --> Web: Pesan sukses
            Web -> Web: Menutup form dan memuat ulang daftar
            Web --> Admin: Menampilkan kuis baru
        end
    end
end

note over Web,Controller
Frontend mengirim payload kuis tanpa field questions pada alur tambah yang diperiksa.
Backend createQuiz mendukung questions opsional, tetapi tidak dipakai oleh form tambah
frontend; pertanyaan ditambahkan melalui endpoint nested setelah kuis tersedia.
end note

== Membuka dan mengubah kuis ==
Admin -> Web: Memilih tombol edit pada kuis
Web -> Client: quizApi.getById(id)
Client -> GlobalMW: GET /api/admin/quiz/:id
GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route admin
Route -> AdminMW: authenticate lalu requireAdmin
alt Sesi tidak valid atau bukan administrator
    AdminMW --> Route: Response 401/403
    Route --> Client: Response 401/403
    Client --> Web: ApiError
    Web --> Admin: Menampilkan gagal memuat detail kuis
else Akses administrator diizinkan
    AdminMW -> Controller: getQuizById
    Controller -> DB: SELECT quizzes JOIN categories berdasarkan id
    alt Kuis tidak ditemukan
        Controller --> Route: Error 404
        Route --> Client: Response 404
        Client --> Web: ApiError
        Web --> Admin: Menampilkan kuis tidak ditemukan
    else Kuis tersedia
        Controller -> DB: SELECT quiz_questions berdasarkan quiz_id\nORDER BY order_num ASC
        DB --> Controller: Detail kuis dan pertanyaan
        Controller --> Route: Response 200 dengan questions
        Route --> Client: Response berhasil
        Client --> Web: Detail kuis dan pertanyaan
        Web --> Admin: Menampilkan form kuis dan daftar pertanyaan
    end
end

Admin -> Web: Mengubah informasi kuis
Web -> Web: Validasi HTML pada form edit
Web -> Client: quizApi.update(id, payload)
Client -> GlobalMW: PUT /api/admin/quiz/:id dengan JSON
GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route admin
Route -> AdminMW: authenticate lalu requireAdmin
alt Sesi atau hak akses tidak valid
    AdminMW --> Route: Response 401/403
    Route --> Client: Response 401/403
    Client --> Web: ApiError
    Web --> Admin: Menampilkan kegagalan pembaruan
else Akses administrator diizinkan
    AdminMW -> Validation: updateQuizValidation lalu validate
    alt Validasi backend gagal
        Validation --> Route: Response 422 Validasi gagal
        Route --> Client: Response 422
        Client --> Web: ApiError
        Web --> Admin: Menampilkan pesan validasi
    else Input valid
        Validation -> Controller: updateQuiz
        Controller -> DB: SELECT id kuis berdasarkan id
        alt Kuis tidak ditemukan
            Controller --> Route: Error 404
            Route --> Client: Response 404
            Client --> Web: ApiError
            Web --> Admin: Menampilkan kuis tidak ditemukan
        else Kuis tersedia
            Controller -> DB: UPDATE quizzes dan updated_at
            Controller -> DB: SELECT kuis hasil pembaruan
            DB --> Controller: Data kuis terbaru
            Controller -> Audit: recordAdminAction UPDATE_QUIZ
            Controller --> Route: Response 200
            Route --> Client: Response berhasil
            Client --> Web: Pesan sukses
            Web -> Client: quizApi.getById(id) untuk menyegarkan detail
            Client -> GlobalMW: GET /api/admin/quiz/:id
            GlobalMW -> GlobalMW: Middleware global
            GlobalMW -> Route: Meneruskan request ke route admin
            Route -> AdminMW: authenticate lalu requireAdmin
            AdminMW -> Controller: getQuizById
            Controller -> DB: SELECT kuis dan quiz_questions
            DB --> Controller: Detail terbaru
            Controller --> Route: Response 200
            Route --> Client: Response detail terbaru
            Client --> Web: Memperbarui state kuis
            Web --> Admin: Menampilkan perubahan kuis
        end
    end
end

== Menambah pertanyaan ==
Admin -> Web: Mengisi form pertanyaan pilihan ganda
Web -> Web: Validasi HTML required, maxLength, dan min order
alt Validasi frontend gagal
    Web --> Admin: Browser menampilkan pesan validasi
else Input frontend dapat dikirim
    Web -> Client: quizApi.createQuestion(quizId, questionForm)
    Client -> GlobalMW: POST /api/admin/quiz/:id/questions dengan JSON
    GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
    GlobalMW -> Route: Meneruskan request ke route admin
    Route -> AdminMW: authenticate lalu requireAdmin
    alt Sesi tidak valid atau bukan administrator
        AdminMW --> Route: Response 401/403
        Route --> Client: Response 401/403
        Client --> Web: ApiError
        Web --> Admin: Menampilkan kegagalan tambah pertanyaan
    else Akses administrator diizinkan
        AdminMW -> Validation: questionValidation lalu validate
        alt Validasi backend gagal
            Validation --> Route: Response 422 Validasi gagal
            Route --> Client: Response 422
            Client --> Web: ApiError
            Web --> Admin: Menampilkan pesan validasi
        else Input valid
            Validation -> Controller: addQuestion
            Controller -> DB: SELECT id FROM quizzes WHERE id = ?
            alt Kuis tidak ditemukan
                Controller --> Route: Error 404
                Route --> Client: Response 404
                Client --> Web: ApiError
                Web --> Admin: Menampilkan kuis tidak ditemukan
            else Kuis tersedia
                Controller -> DB: INSERT INTO quiz_questions
                DB --> Controller: questionId
                Controller -> DB: SELECT pertanyaan baru berdasarkan id
                DB --> Controller: Data pertanyaan baru
                Controller -> Audit: recordAdminAction ADD_QUESTION
                Controller --> Route: Response 201
                Route --> Client: Response berhasil
                Client --> Web: Pesan sukses
                Web -> Client: quizApi.getById(quizId) untuk menyegarkan daftar
                Client -> GlobalMW: GET /api/admin/quiz/:id
                GlobalMW -> GlobalMW: Middleware global
                GlobalMW -> Route: Meneruskan request ke route admin
                Route -> AdminMW: authenticate lalu requireAdmin
                AdminMW -> Controller: getQuizById
                Controller -> DB: SELECT kuis dan quiz_questions
                DB --> Controller: Detail terbaru
                Controller --> Route: Response 200
                Route --> Client: Response detail terbaru
                Client --> Web: Memperbarui daftar pertanyaan
                Web --> Admin: Menampilkan pertanyaan baru
            end
        end
    end
end

== Mengubah pertanyaan ==
Admin -> Web: Memilih tombol edit pertanyaan
Web -> Web: Mengisi form dari data pertanyaan yang dipilih
Admin -> Web: Mengubah teks, opsi, jawaban benar, atau urutan
Web -> Client: quizApi.updateQuestion(quizId, questionId, questionForm)
Client -> GlobalMW: PUT /api/admin/quiz/:id/questions/:qid dengan JSON
GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route admin
Route -> AdminMW: authenticate lalu requireAdmin
alt Sesi atau hak akses tidak valid
    AdminMW --> Route: Response 401/403
    Route --> Client: Response 401/403
    Client --> Web: ApiError
    Web --> Admin: Menampilkan kegagalan pembaruan pertanyaan
else Akses administrator diizinkan
    AdminMW -> Validation: questionValidation lalu validate
    alt Validasi backend gagal
        Validation --> Route: Response 422 Validasi gagal
        Route --> Client: Response 422
        Client --> Web: ApiError
        Web --> Admin: Menampilkan pesan validasi
    else Input valid
        Validation -> Controller: updateQuestion
        Controller -> DB: SELECT quiz_questions berdasarkan id dan quiz_id
        alt Pertanyaan tidak ditemukan
            Controller --> Route: Error 404
            Route --> Client: Response 404
            Client --> Web: ApiError
            Web --> Admin: Menampilkan pertanyaan tidak ditemukan
        else Pertanyaan tersedia
            Controller -> DB: UPDATE quiz_questions
            Controller -> DB: SELECT pertanyaan hasil pembaruan
            DB --> Controller: Data pertanyaan terbaru
            Controller -> Audit: recordAdminAction UPDATE_QUESTION
            Controller --> Route: Response 200
            Route --> Client: Response berhasil
            Client --> Web: Pesan sukses
            Web -> Client: quizApi.getById(quizId) untuk menyegarkan daftar
            Client -> GlobalMW: GET /api/admin/quiz/:id
            GlobalMW -> GlobalMW: Middleware global
            GlobalMW -> Route: Meneruskan request ke route admin
            Route -> AdminMW: authenticate lalu requireAdmin
            AdminMW -> Controller: getQuizById
            Controller -> DB: SELECT kuis dan quiz_questions
            DB --> Controller: Detail terbaru
            Controller --> Route: Response 200
            Route --> Client: Response detail terbaru
            Client --> Web: Memperbarui state pertanyaan
            Web --> Admin: Menampilkan perubahan pertanyaan
        end
    end
end

== Menghapus pertanyaan ==
Admin -> Web: Memilih hapus dan menyetujui window.confirm
Web -> Client: quizApi.removeQuestion(quizId, questionId)
Client -> GlobalMW: DELETE /api/admin/quiz/:id/questions/:qid
GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route admin
Route -> AdminMW: authenticate lalu requireAdmin
alt Sesi atau hak akses tidak valid
    AdminMW --> Route: Response 401/403
    Route --> Client: Response 401/403
    Client --> Web: ApiError
    Web --> Admin: Menampilkan kegagalan penghapusan pertanyaan
else Akses administrator diizinkan
    AdminMW -> Controller: deleteQuestion
    Controller -> DB: SELECT quiz_questions berdasarkan id dan quiz_id
    alt Pertanyaan tidak ditemukan
        Controller --> Route: Error 404
        Route --> Client: Response 404
        Client --> Web: ApiError
        Web --> Admin: Menampilkan pertanyaan tidak ditemukan
    else Pertanyaan tersedia
        Controller -> DB: DELETE FROM quiz_questions WHERE id = ?
        Controller -> Audit: recordAdminAction DELETE_QUESTION
        Controller --> Route: Response 200
        Route --> Client: Response berhasil
        Client --> Web: Pesan sukses
        Web -> Client: quizApi.getById(quizId) untuk menyegarkan daftar
        Client -> GlobalMW: GET /api/admin/quiz/:id
        GlobalMW -> GlobalMW: Middleware global
        GlobalMW -> Route: Meneruskan request ke route admin
        Route -> AdminMW: authenticate lalu requireAdmin
        AdminMW -> Controller: getQuizById
        Controller -> DB: SELECT kuis dan quiz_questions
        DB --> Controller: Detail terbaru
        Controller --> Route: Response 200
        Route --> Client: Response detail terbaru
        Client --> Web: Memperbarui state pertanyaan
        Web --> Admin: Menampilkan daftar setelah penghapusan
    end
end

== Menghapus kuis ==
Admin -> Web: Memilih hapus kuis dan menyetujui window.confirm
Web -> Client: quizApi.remove(quizId)
Client -> GlobalMW: DELETE /api/admin/quiz/:id
GlobalMW -> GlobalMW: requestId, security, parser, guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route admin
Route -> AdminMW: authenticate lalu requireAdmin
alt Sesi atau hak akses tidak valid
    AdminMW --> Route: Response 401/403
    Route --> Client: Response 401/403
    Client --> Web: ApiError
    Web --> Admin: Menampilkan kegagalan penghapusan kuis
else Akses administrator diizinkan
    AdminMW -> Controller: deleteQuiz
    Controller -> DB: SELECT id FROM quizzes WHERE id = ?
    alt Kuis tidak ditemukan
        Controller --> Route: Error 404
        Route --> Client: Response 404
        Client --> Web: ApiError
        Web --> Admin: Menampilkan kuis tidak ditemukan
    else Kuis tersedia
        Controller -> DB: DELETE FROM quizzes WHERE id = ?
        DB --> Controller: Kuis terhapus dan quiz_questions terhapus CASCADE
        Controller -> Audit: recordAdminAction DELETE_QUIZ
        Controller --> Route: Response 200
        Route --> Client: Response berhasil
        Client --> Web: Pesan sukses
        Web -> Client: quizApi.list() untuk memuat ulang daftar
        Client -> GlobalMW: GET /api/admin/quiz
        GlobalMW -> GlobalMW: Middleware global
        GlobalMW -> Route: Meneruskan request ke route admin
        Route -> AdminMW: authenticate lalu requireAdmin
        AdminMW -> Controller: getAllQuizzes
        Controller -> DB: SELECT daftar kuis dan COUNT pertanyaan
        DB --> Controller: Daftar terbaru
        Controller --> Route: Response 200
        Route --> Client: Response daftar terbaru
        Client --> Web: Memperbarui tabel kuis
        Web --> Admin: Menampilkan daftar setelah penghapusan
    end
end
@enduml
```

## Penjelasan tahapan

1. `QuizPage` memuat daftar kuis melalui `quizApi.list`, kemudian memuat daftar kategori melalui `categoriesApi.getAll` untuk pilihan kategori pada form. Request kategori merupakan kebutuhan pendukung UI dan tidak dirinci sebagai proses CRUD kuis pada diagram.
2. Daftar kuis menggunakan `GET /api/admin/quiz`. Controller melakukan `LEFT JOIN` ke `categories` dan `quiz_questions`, menghitung `COUNT(qq.id) AS total_questions`, mengelompokkan dengan `GROUP BY q.id`, dan mengurutkan berdasarkan `q.created_at DESC`.
3. Tambah kuis menggunakan `POST /api/admin/quiz`. Form frontend mengirim judul, deskripsi, `category_id`, dan `is_active`. Walaupun controller mendukung array `questions` opsional pada create, frontend yang diperiksa tidak mengirim array tersebut; pertanyaan dibuat melalui endpoint nested setelah kuis tersedia.
4. Edit kuis terlebih dahulu memanggil `GET /api/admin/quiz/:id`. Controller mengembalikan metadata kuis dan seluruh pertanyaan beserta `option_a` sampai `option_d`, `correct_answer`, dan `order_num`. Setelah `PUT` berhasil, frontend memanggil GET detail kembali untuk menyegarkan state.
5. Tambah pertanyaan menggunakan `POST /api/admin/quiz/:id/questions`, edit menggunakan `PUT /api/admin/quiz/:id/questions/:qid`, dan hapus menggunakan `DELETE /api/admin/quiz/:id/questions/:qid`. Semua operasi pertanyaan berasal dari UI edit kuis yang telah memuat detail kuis.
6. `createQuizValidation`, `updateQuizValidation`, dan `questionValidation` dijalankan sebelum controller. Middleware `validate` mengirim response HTTP 422 melalui route jika validasi gagal.
7. Error operasional controller meliputi 404 ketika kuis atau pertanyaan tidak ditemukan. API client mengubah response non-2xx menjadi `ApiError`, kemudian frontend menampilkan pesan pada area notifikasi. Error autentikasi/otorisasi menggunakan response 401/403 dari middleware.
8. Operasi mutasi kuis dan pertanyaan memanggil `recordAdminAction` dengan action `CREATE_QUIZ`, `UPDATE_QUIZ`, `DELETE_QUIZ`, `ADD_QUESTION`, `UPDATE_QUESTION`, atau `DELETE_QUESTION`. Tidak ditemukan pemanggilan `bumpCacheVersion` atau adapter Redis pada `quiz.controller.ts`.
9. Penghapusan kuis menggunakan foreign key `quiz_questions.quiz_id` dengan `ON DELETE CASCADE`, sehingga pertanyaan terkait dihapus oleh MariaDB. Diagram tidak menggambarkan penghapusan pertanyaan sebagai request frontend tambahan pada saat delete quiz.
10. `activityLogger` merupakan middleware global yang mendaftarkan pencatatan request pada event `response.finish`; proses tersebut berlangsung setelah response dan terpisah dari query kuis.

## File sumber yang diperiksa

| File | Fungsi atau bukti yang relevan |
|---|---|
| `apps/web/app/admin/quiz/page.tsx` | `loadData`, `openEdit`, `handleSaveQuiz`, `handleSaveQuestion`, `handleDeleteQuestion`, `handleDeleteQuiz`, form inline, dan refresh detail/list |
| `apps/web/components/AdminLayout.tsx` | Layout dan perlindungan halaman admin |
| `apps/web/components/AdminGuard.tsx` | Verifikasi sesi administrator pada UI |
| `apps/web/lib/api.ts` | `quizApi.list`, `getById`, `create`, `update`, `remove`, `createQuestion`, `updateQuestion`, `removeQuestion` |
| `apps/web/lib/types.ts` | Struktur `Quiz` dan `QuizQuestion` |
| `apps/api/src/app.ts` | Urutan middleware global dan mount `/api/admin/quiz` |
| `apps/api/src/modules/quiz/quiz.routes.ts` | Route kuis dan pertanyaan nested serta middleware route |
| `apps/api/src/modules/quiz/quiz.controller.ts` | Controller daftar/detail/CRUD kuis dan CRUD pertanyaan |
| `apps/api/src/modules/quiz/quiz.validation.ts` | Validasi kuis dan pertanyaan |
| `apps/api/src/middleware/auth.middleware.ts` | `authenticate` |
| `apps/api/src/middleware/role.middleware.ts` | `requireAdmin` |
| `apps/api/src/middleware/validation.middleware.ts` | Response validasi HTTP 422 |
| `apps/api/src/middleware/activity-logger.middleware.ts` | Pencatatan `api_request` setelah response selesai |
| `apps/api/src/modules/logs/logs.service.ts` | `recordAdminAction` untuk audit kuis dan pertanyaan |
| `apps/api/src/database/schema.sql` | Tabel `quizzes`, `quiz_questions`, dan relasi cascade |
| `apps/api/src/modules/categories/categories.controller.ts` | Endpoint kategori yang dimuat sebagai data pendukung dropdown frontend |

## Batasan dan hasil validasi

- Seluruh endpoint `/api/admin/quiz` dan endpoint pertanyaan nested yang digunakan frontend dilindungi `authenticate` dan `requireAdmin` melalui `router.use`.
- Pengelolaan pertanyaan benar-benar tersedia pada UI admin: tambah, ubah, dan hapus dilakukan dari dialog detail kuis.
- Frontend tidak mengirim pertanyaan sebagai bagian dari `POST /api/admin/quiz`; dukungan `questions` opsional pada controller create merupakan kemampuan backend yang tidak digunakan oleh alur UI tambah kuis.
- Tidak ditemukan halaman frontend admin terpisah untuk pertanyaan; form dan daftar pertanyaan diimplementasikan langsung dalam `apps/web/app/admin/quiz/page.tsx`.
- Audit log digunakan melalui `recordAdminAction` pada operasi mutasi. Tidak ditemukan pemanggilan Redis atau `bumpCacheVersion` pada controller kuis.
- Penghapusan kuis mengandalkan `ON DELETE CASCADE` pada foreign key `quiz_questions.quiz_id`; tidak ada request delete-question terpisah dari frontend untuk proses tersebut.
- Endpoint publik `/api/quiz`, `/api/quiz/:id`, dan submit kuis pengguna tidak dimasukkan karena dokumen ini hanya membahas pengelolaan kuis oleh Administrator.
- Status HTTP sukses yang digambarkan mengikuti controller: GET 200, create quiz/question 201, update/delete 200. Validasi backend menggunakan 422, sedangkan resource yang tidak ditemukan menggunakan 404 dan akses yang tidak sah menggunakan 401/403.
- Dokumentasi ini dibuat tanpa mengubah source code maupun diagram sebelumnya.
