# 07 — Deployment Diagram SATWA LYAR

```mermaid
flowchart LR
    Client[Client device<br/>Browser modern] -->|HTTPS| Web[Vercel Web Project<br/>Next.js App Router]
    Client -->|HTTPS REST| API[Vercel API Project/Target<br/>Express serverless export]
    Web -->|Relative API URL atau<br/>NEXT_PUBLIC_API_URL| API
    API -->|MariaDB protocol/TLS<br/>env DB_*| DB[(MariaDB Cloud)]
    API -. HTTPS REST bila env tersedia .-> Redis[(Upstash Redis)]
    API -->|S3-compatible HTTPS| R2[(Cloudflare R2)]

    subgraph Local[Development environment]
        Node[Node.js >=18 + npm]
        LocalWeb[Next.js dev server]
        LocalAPI[Express dev server :5000]
        Node --> LocalWeb
        Node --> LocalAPI
    end
```

## Node dan protokol

| Node | Peran | Komunikasi |
|---|---|---|
| Browser | Menjalankan UI dan Fetch | HTTPS ke web/API, cookie, Bearer JWT |
| Vercel Web | Menyajikan Next.js | HTTP internal/relative atau URL API |
| Vercel API | Menjalankan Express export | REST JSON/multipart |
| MariaDB Cloud | Database transaksional | Driver `mariadb`, konfigurasi env |
| Upstash Redis | Cache opsional | REST client |
| Cloudflare R2 | Object storage gambar | AWS S3-compatible API |

Port 5000 teridentifikasi untuk server API lokal. Port production, URL resmi, TLS termination, dan nama project Vercel tidak dapat dipastikan dari source.
