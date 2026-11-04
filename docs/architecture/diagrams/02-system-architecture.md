# 02 — System Architecture SATWA LYAR

## Gambaran keseluruhan

```mermaid
flowchart LR
    Browser[Browser pengguna] --> Web[Next.js App Router<br/>apps/web]
    Web -->|REST JSON / multipart<br/>Bearer JWT atau cookie guest| API[Express API<br/>apps/api]
    API --> MW[Middleware: request ID, security,<br/>rate limit, guest context, activity logger]
    MW --> Modules[Domain modules:<br/>auth, animals, categories, quiz,<br/>favorites, users, dashboard, logs, track]
    Modules --> DB[(MariaDB Cloud)]
    Modules -. optional cache .-> Redis[(Upstash Redis REST)]
    Modules --> R2[(Cloudflare R2<br/>gambar satwa)]
    Modules --> DBLog[(logs_activity<br/>di MariaDB)]
```

## Deployment architecture aktual berdasarkan konfigurasi

```mermaid
flowchart TB
    User[Browser] --> VWeb[Vercel project/target<br/>Next.js Web]
    User --> VAPI[Vercel project/target<br/>Express API serverless]
    VWeb -->|relative URL di browser atau NEXT_PUBLIC_API_URL| VAPI
    VAPI --> MariaDB[(MariaDB Cloud)]
    VAPI -. env opsional .-> Upstash[(Upstash Redis)]
    VAPI --> R2[(Cloudflare R2)]
    VAPI --> MariaDB
```

`server.ts` menjalankan listener lokal pada port 5000 jika bukan lingkungan Vercel dan mengekspor Express app untuk target serverless. `vercel.json` tersedia pada API. Nama project Vercel dan topologi produksi aktual belum dapat diverifikasi tanpa akses deployment.

## Hubungan request dan data

```mermaid
sequenceDiagram
    participant B as Browser
    participant W as Next.js
    participant A as Express API
    participant C as Redis opsional
    participant D as MariaDB
    participant O as R2

    B->>W: Interaksi halaman/form
    W->>A: HTTP request
    A->>A: Middleware dan authorization
    A->>C: Baca/tulis cache kategori/fauna (jika aktif)
    A->>D: Query/transaksi domain
    A->>O: Media upload/delete (CRUD fauna)
    A->>D: Activity/audit log
    A-->>W: JSON response
    W-->>B: Render state
```

## Batas validasi

- MariaDB adalah persistence utama berdasarkan driver, schema, dan query.
- Redis hanya fallback cache opsional; source menyatakan aplikasi tetap berjalan tanpa konfigurasi Redis.
- R2 digunakan untuk `image_key` dan URL gambar fauna.
- Tidak ada bukti queue, microservice, atau message broker.
- Status deployment, environment production, dan konektivitas layanan eksternal belum diuji.
