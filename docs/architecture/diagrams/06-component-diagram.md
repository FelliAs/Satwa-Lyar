# 06 — Component Diagram SATWA LYAR

```mermaid
flowchart TB
    subgraph Frontend[Frontend — apps/web]
        Pages[Next.js App Router pages]
        PublicUI[Landing, zona, detail satwa]
        AdminUI[Admin dashboard, fauna, kategori, kuis, users, logs]
        AuthCtx[AuthContext + AdminGuard]
        ApiClient[lib/api.ts + types.ts]
        Tracker[PageViewTracker + analytics]
        Charts[Recharts dashboard components]
        Pages --> PublicUI
        Pages --> AdminUI
        AdminUI --> AuthCtx
        PublicUI --> Tracker
        AdminUI --> ApiClient
        PublicUI --> ApiClient
        AdminUI --> Charts
    end

    subgraph Backend[Backend — apps/api]
        App[Express app.ts/server.ts]
        Security[Helmet, CORS, rate limit, Morgan]
        Context[guestContext, request-id, activityLogger]
        Auth[auth + role + validation middleware]
        Domain[Domain modules/controllers]
        Animal[animals]
        Category[categories]
        Quiz[quiz]
        Favorite[favorites]
        User[users/auth]
        Admin[dashboard/logs/track]
        App --> Security --> Context --> Auth --> Domain
        Domain --> Animal
        Domain --> Category
        Domain --> Quiz
        Domain --> Favorite
        Domain --> User
        Domain --> Admin
    end

    DB[(MariaDB schema)]
    Redis[(Upstash Redis optional)]
    R2[(Cloudflare R2)]
    Logs[(logs_activity)]

    ApiClient --> App
    Tracker --> App
    Animal --> DB
    Category --> DB
    Quiz --> DB
    Favorite --> DB
    User --> DB
    Admin --> DB
    Animal --> R2
    Animal -. cache version .-> Redis
    Category -. cache .-> Redis
    Context --> Logs
    Domain --> Logs
```

Komponen frontend pengguna untuk favorit/kuis pengguna tidak tampak sebagai halaman khusus pada source yang diperiksa, meskipun komponen backend-nya ada. Diagram mempertahankan komponen backend tersebut karena memang terdaftar pada route/module aktual.
