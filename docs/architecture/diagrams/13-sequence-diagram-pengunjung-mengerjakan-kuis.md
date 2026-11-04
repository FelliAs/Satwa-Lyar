# 13 — Sequence Diagram Pengunjung Mengerjakan Kuis SATWA LYAR

Dokumen ini mendokumentasikan hasil pemeriksaan terhadap fitur kuis publik SATWA LYAR. Backend menyediakan endpoint untuk daftar kuis aktif, detail pertanyaan, dan pengiriman jawaban. Namun, pada source code frontend yang diperiksa tidak ditemukan halaman kuis publik, komponen pengerjaan kuis, atau API client yang memanggil endpoint `/api/quiz`. Oleh karena itu, alur end-to-end Pengunjung dari browser belum dapat dinyatakan sebagai fitur frontend yang telah digunakan.

Diagram di bawah tetap menggambarkan kontrak backend yang benar-benar tersedia apabila endpoint publik dipanggil oleh suatu client HTTP. Participant client pada bagian backend diberi keterangan bahwa pemanggilnya tidak ditemukan pada repository frontend.

## Sequence Diagram — Pengunjung Mengerjakan Kuis

```plantuml
@startuml
title Sequence Diagram — Pengunjung Mengerjakan Kuis SATWA LYAR
autonumber

actor "Pengunjung" as Visitor
participant "Browser / Frontend Next.js\n(halaman kuis publik tidak ditemukan)" as Web
participant "Pemanggil HTTP\n(tidak ditemukan pada frontend)" as Client
participant "Middleware global\nrequestId, security, parser, guestContext, activityLogger" as GlobalMW
participant "Route kuis publik\n/api/quiz" as Route
participant "Middleware authenticate\n(hanya submit dan history/result)" as AuthMW
participant "Validation\nsubmitQuizValidation" as Validation
participant "Quiz User Controller\nquiz.user.controller.ts" as Controller
participant "Log Service\nrecordQuizPayload" as LogService
database "MariaDB\nusers, quizzes, quiz_questions, quiz_results, logs_activity" as DB

== Status frontend kuis publik ==
Visitor -> Web: Membuka atau mencari fitur kuis
Web -> Web: Source frontend diperiksa
note over Visitor,Web
Tidak ditemukan halaman daftar kuis publik, halaman detail/pengerjaan,
komponen pilihan jawaban, komponen hasil, atau API client publik
yang memanggil /api/quiz.
end note
Web --> Visitor: Alur kuis dari frontend belum terverifikasi

== Mengambil daftar kuis aktif — kemampuan backend ==
Client -> GlobalMW: GET /api/quiz
GlobalMW -> GlobalMW: requestId, security, rate limit, parser
GlobalMW -> GlobalMW: guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route publik
Route -> Controller: getPublicQuizzes
Controller -> DB: SELECT quizzes aktif LEFT JOIN categories\nLEFT JOIN quiz_questions, COUNT(qq.id)\nGROUP BY q.id ORDER BY q.created_at DESC
alt Query daftar gagal
    DB --> Controller: Error database
    Controller --> Route: next(error)
    Route --> Client: Response error melalui errorHandler
else Query berhasil
    DB --> Controller: Rows kuis aktif dan total_questions
    alt Data kosong
        Controller --> Route: Response 200 { success, data: [] }
        Route --> Client: Daftar kosong
    else Data tersedia
        Controller --> Route: Response 200 { success, data }
        Route --> Client: Response JSON daftar kuis aktif
    end
end
Client --> Web: Tidak ada pemanggilan frontend terverifikasi

== Mengambil detail kuis dan pertanyaan — kemampuan backend ==
Client -> GlobalMW: GET /api/quiz/:id
GlobalMW -> GlobalMW: requestId, security, rate limit, parser
GlobalMW -> GlobalMW: guestContext, activityLogger
GlobalMW -> Route: Meneruskan request ke route publik
Route -> Controller: getPublicQuizById
Controller -> DB: SELECT kuis aktif LEFT JOIN categories\nWHERE q.id = ? AND q.is_active = 1
alt Kuis tidak ditemukan atau tidak aktif
    Controller --> Route: next(createError(..., 404))
    Route --> Client: Response error melalui errorHandler
else Kuis tersedia
    Controller -> DB: SELECT quiz_questions tanpa correct_answer\nORDER BY order_num ASC, id ASC
    DB --> Controller: Pertanyaan dan pilihan jawaban
    Controller --> Route: Response 200 berisi quiz dan questions
    Route --> Client: Response detail kuis
end

== Mengirim jawaban dan menyimpan hasil ==
Client -> GlobalMW: POST /api/quiz/:id/submit\nJSON { answers }
GlobalMW -> GlobalMW: requestId, security, rate limit, parser
GlobalMW -> GlobalMW: guestContext menentukan identitas guest
GlobalMW -> Route: Meneruskan request ke route submit
Route -> AuthMW: authenticate
alt Identitas tidak ditemukan atau authError
    AuthMW --> Client: Response 401/403 langsung dari middleware
else Identitas guest/admin tersedia
    AuthMW -> Validation: submitQuizValidation lalu validate
    alt Parameter atau jawaban tidak valid
        Validation --> Route: Response 422 Validasi gagal
        Route --> Client: Response 422
    else Jawaban valid
        Validation -> Controller: submitQuizAnswers
        Controller -> DB: SELECT kuis aktif berdasarkan id
        alt Kuis tidak ditemukan atau tidak aktif
            Controller --> Route: next(createError(..., 404))
            Route --> Client: Response error melalui errorHandler
        else Kuis tersedia
            Controller -> DB: SELECT quiz_questions dengan correct_answer\nORDER BY order_num ASC, id ASC
            alt Kuis tidak memiliki pertanyaan
                Controller --> Route: next(createError(..., 400))
                Route --> Client: Response error melalui errorHandler
            else Pertanyaan tersedia
                Controller -> LogService: recordQuizPayload(req, quizId, jawaban terpilih)
                LogService -> DB: INSERT logs_activity event_type=quiz_payload
                DB --> LogService: Log tersimpan
                LogService --> Controller: Selesai
                Controller -> Controller: Membandingkan jawaban dan menghitung score\ncorrectCount, wrong_answers, passed
                Controller -> DB: INSERT quiz_results\n(user_id, quiz_id, score, total_questions, correct_answers)
                DB --> Controller: result_id
                Controller --> Route: Response 200 hasil dan review
                Route --> Client: Response JSON hasil kuis
                Client --> Web: Tidak ada pemanggilan frontend terverifikasi
                Web --> Visitor: Tidak dapat diverifikasi pada source frontend
            end
        end
    end
end

note over GlobalMW,DB
guestContext dijalankan global sebelum route. Tanpa Bearer JWT,
middleware tersebut memulihkan guest dari cookie yang valid atau membuat
record users baru, lalu authenticate pada endpoint submit menerima identitas itu.
Bearer JWT yang tidak valid menghasilkan authError 401; token milik non-admin
menghasilkan authError 403. authenticate mengirim response tersebut langsung
melalui res.status(...).json(...) dan menghentikan request.
GET daftar/detail tidak memasang authenticate.
end note
@enduml
```

## Penjelasan tahapan proses

1. Pemeriksaan terhadap `apps/web/app` dan `apps/web/lib` tidak menemukan halaman publik untuk daftar atau pengerjaan kuis. Satu-satunya halaman frontend kuis yang ditemukan adalah `apps/web/app/admin/quiz/page.tsx`, yang memakai endpoint admin dan hanya ditujukan untuk Administrator.
2. Backend mendaftarkan route pengguna pada `/api/quiz`. Endpoint `GET /api/quiz` mengambil kuis aktif saja (`q.is_active = 1`), menggabungkan kategori dan pertanyaan, menghitung `total_questions`, lalu mengurutkan berdasarkan `q.created_at DESC`.
3. Endpoint `GET /api/quiz/:id` mengambil metadata kuis aktif dan pertanyaan berdasarkan `order_num ASC, id ASC`. Query publik sengaja tidak mengambil `correct_answer`, sehingga kunci jawaban tidak dikirim sebelum pengiriman jawaban.
4. Endpoint `POST /api/quiz/:id/submit` menerima body `answers`, berupa array berisi `question_id` dan `answer`. Route memasang `authenticate`, `submitQuizValidation`, dan `validate` sebelum `submitQuizAnswers`.
5. `guestContext` merupakan middleware global dan berjalan sebelum route. Guest dipulihkan dari cookie yang valid atau dibuat sebagai row baru pada `users`. Jika Bearer JWT tidak valid, middleware menetapkan `authError` 401; jika token bukan milik administrator, middleware menetapkan `authError` 403. `authenticate` mengirim response 401/403 langsung melalui `res.status(...).json(...)` dan menghentikan request, sehingga error ini tidak diteruskan ke `errorHandler`. Tanpa error tersebut, `authenticate` hanya mensyaratkan adanya `req.user` dan tidak memanggil `requireAdmin`, sehingga guest yang telah diidentifikasi dapat mengirim jawaban tanpa login administrator.
6. Controller memeriksa kuis aktif, mengambil pertanyaan beserta `correct_answer`, membentuk map jawaban berdasarkan `question_id`, lalu membandingkan jawaban. Skor dihitung di backend dengan rumus `Math.round((correctCount / totalQuestions) * 100)` dan dinyatakan lulus apabila `score >= 70`.
7. Sebelum penyimpanan hasil, controller memanggil `recordQuizPayload`. Service tersebut mencatat pilihan jawaban pada `logs_activity` sebagai `event_type = 'quiz_payload'`; kunci jawaban tidak dicatat ke payload log.
8. Hasil pengerjaan disimpan ke `quiz_results` dengan `user_id`, `quiz_id`, `score`, `total_questions`, `correct_answers`, dan `completed_at`. Response sukses berisi `result_id`, ringkasan nilai, status `passed`, serta `review` yang memuat jawaban pengguna, jawaban benar, dan status benar/salah.
9. Karena tidak ada halaman dan API client publik yang ditemukan pada frontend, penerimaan response dan penampilan hasil oleh browser belum dapat diverifikasi. Diagram tidak menyatakan bahwa UI pengunjung untuk proses tersebut telah tersedia.

## Endpoint dan HTTP method

| Endpoint | Method | Status pemanggilan frontend | Fungsi dan parameter aktual |
|---|---|---|---|
| `/api/quiz` | GET | Tidak ditemukan pemanggilan frontend | Daftar kuis aktif; mendukung `category_id` dan `zone`/`category` pada controller |
| `/api/quiz/:id` | GET | Tidak ditemukan pemanggilan frontend | Detail kuis aktif dan pertanyaan tanpa `correct_answer` |
| `/api/quiz/:id/submit` | POST | Tidak ditemukan pemanggilan frontend | Mengirim `answers[{ question_id, answer }]`, menghitung nilai, mencatat payload, dan menyimpan hasil |
| `/api/quiz/history` | GET | Tidak ditemukan pemanggilan frontend | Riwayat kuis untuk identitas terautentikasi; bukan bagian dari alur pengerjaan yang terverifikasi |
| `/api/quiz/results/:id` | GET | Tidak ditemukan pemanggilan frontend | Detail hasil untuk pemilik hasil atau admin; bukan bagian dari alur frontend yang ditemukan |

## Interaksi database

- `GET /api/quiz` membaca `quizzes`, `categories`, dan `quiz_questions` melalui `LEFT JOIN`. Hanya kuis aktif yang dipilih dan jumlah pertanyaan dihitung dengan `COUNT(qq.id)`.
- `GET /api/quiz/:id` membaca metadata kuis dan kategori, kemudian membaca `quiz_questions` tanpa kolom `correct_answer`.
- `POST /api/quiz/:id/submit` membaca kuis aktif dan pertanyaan lengkap dengan `correct_answer`, menulis payload jawaban ke `logs_activity`, lalu menulis hasil ke `quiz_results`.
- `users` menyimpan identitas guest yang dibuat oleh `guestContext`. `quiz_results.user_id` mereferensikan `users(id)` dengan `ON DELETE CASCADE`.
- `quiz_questions.quiz_id` mereferensikan `quizzes(id)` dengan `ON DELETE CASCADE`. Relasi ini tidak memicu request frontend tambahan pada submit.

## Autentikasi, otorisasi, validasi, dan identitas guest

- Middleware global berjalan dalam urutan `requestId`, Helmet/CORS, rate limit, parser, Morgan, `guestContext`, lalu `activityLogger`.
- Endpoint daftar dan detail kuis publik tidak memasang `authenticate` atau `optionalAuthenticate` pada route.
- Endpoint submit memasang `authenticate`, tetapi tidak memasang `requireAdmin`. `authenticate` menerima identitas guest maupun admin selama `guestContext` telah mengisi `req.user`.
- `submitQuizValidation` memvalidasi ID kuis sebagai bilangan positif, `answers` sebagai array minimal satu elemen, `question_id` sebagai bilangan positif, dan jawaban sebagai salah satu dari A, B, C, atau D tanpa membedakan huruf besar/kecil.
- Validasi gagal menghasilkan HTTP 422 melalui middleware `validate`. Kuis tidak ditemukan menghasilkan 404, sedangkan kuis tanpa pertanyaan menghasilkan 400.
- Tidak ditemukan validasi bahwa setiap pertanyaan harus dijawab tepat satu kali atau bahwa `question_id` harus berasal dari kuis yang sama. Controller menggunakan map jawaban dan mengambil kebenaran dari seluruh pertanyaan pada kuis.

## Batasan dan hasil validasi

- Tidak ditemukan halaman frontend publik, API client publik, komponen pertanyaan, komponen pilihan jawaban, atau komponen hasil kuis pada repository yang diperiksa.
- `apps/web/lib/api.ts` hanya memiliki `quizApi` untuk endpoint `/api/admin/quiz`; tidak ditemukan fungsi client untuk `/api/quiz`.
- Endpoint publik backend untuk daftar, detail, dan submit kuis benar-benar tersedia, tetapi penggunaannya dari frontend belum terbukti.
- Pengunjung tidak diwajibkan menjadi administrator untuk submit menurut route aktual; `authenticate` menerima guest yang dibuat atau dipulihkan oleh `guestContext`.
- Jawaban benar disembunyikan pada detail kuis publik dan baru dikembalikan pada response submit melalui `review`.
- Skor dihitung dan hasil disimpan di backend, bukan dihitung oleh frontend. Penyimpanan dilakukan pada `quiz_results`.
- Payload jawaban juga dicatat pada `logs_activity` melalui `recordQuizPayload`. Pencatatan tersebut berbeda dari `activityLogger` yang mencatat request `api_request` setelah response selesai.
- Endpoint history dan detail hasil tersedia di backend, tetapi tidak dimasukkan sebagai alur utama karena tidak ditemukan pemanggil frontend publik.
- Dokumen ini dibuat tanpa mengubah source code aplikasi maupun diagram sebelumnya.

## File sumber yang diperiksa

| File | Fungsi atau bukti relevan |
|---|---|
| `apps/api/src/app.ts` | Urutan middleware global dan mount `/api/quiz` |
| `apps/api/src/modules/quiz/quiz.user.routes.ts` | Route publik daftar/detail, submit, history, dan result; middleware `authenticate` serta validasi submit |
| `apps/api/src/modules/quiz/quiz.user.controller.ts` | `getPublicQuizzes`, `getPublicQuizById`, `submitQuizAnswers`, query, perhitungan skor, penyimpanan hasil, dan response |
| `apps/api/src/modules/quiz/quiz.user.validation.ts` | `submitQuizValidation` untuk ID dan array jawaban |
| `apps/api/src/middleware/guest-context.middleware.ts` | Pemulihan atau pembuatan identitas guest dan cookie |
| `apps/api/src/middleware/auth.middleware.ts` | Implementasi `authenticate` dan `optionalAuthenticate` |
| `apps/api/src/middleware/validation.middleware.ts` | Response validasi HTTP 422 |
| `apps/api/src/middleware/activity-logger.middleware.ts` | Pencatatan request `api_request` setelah response selesai |
| `apps/api/src/middleware/error.middleware.ts` | Konversi error controller menjadi response JSON |
| `apps/api/src/modules/logs/logs.service.ts` | `recordQuizPayload` dan pencatatan payload jawaban |
| `apps/api/src/database/schema.sql` | Tabel `users`, `quizzes`, `quiz_questions`, `quiz_results`, dan `logs_activity` |
| `apps/web/app/admin/quiz/page.tsx` | Satu-satunya halaman frontend kuis yang ditemukan; hanya alur admin |
| `apps/web/lib/api.ts` | `quizApi` yang hanya memanggil endpoint admin kuis |
| `apps/web/lib/types.ts` | Tipe `Quiz` dan `QuizQuestion` yang digunakan frontend admin |









