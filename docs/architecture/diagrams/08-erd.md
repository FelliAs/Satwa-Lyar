# 08 — Entity Relationship Diagram SATWA LYAR

ERD berikut dibuat dari `apps/api/src/database/schema.sql`, termasuk tabel migrasi logis `schema_migrations` yang dibuat oleh migration runner.

```mermaid
erDiagram
    USERS ||--o{ FAVORITES : memiliki
    ANIMALS ||--o{ FAVORITES : disimpan
    CATEGORIES ||--o{ ANIMALS : mengelompokkan
    CATEGORIES o|--o{ QUIZZES : terkait
    QUIZZES ||--o{ QUIZ_QUESTIONS : memiliki
    USERS ||--o{ QUIZ_RESULTS : menghasilkan
    QUIZZES ||--o{ QUIZ_RESULTS : dinilai
    USERS o|--o{ LOGS_ACTIVITY : direferensikan

    USERS {
        int id PK
        varchar public_id UK
        varchar name
        varchar email UK
        varchar password
        boolean is_admin
        datetime created_at
        datetime updated_at
    }
    CATEGORIES {
        int id PK
        varchar name
        varchar slug UK
        varchar description
        varchar icon
        datetime created_at
        datetime updated_at
    }
    ANIMALS {
        int id PK
        int category_id FK
        varchar name
        varchar scientific_name
        text description
        text physical_traits
        text habitat
        text food
        enum conservation_status
        varchar image_key
        datetime created_at
        datetime updated_at
    }
    FAVORITES {
        int id PK
        int user_id FK
        int animal_id FK
        datetime created_at
    }
    QUIZZES {
        int id PK
        int category_id FK
        varchar title
        varchar description
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    QUIZ_QUESTIONS {
        int id PK
        int quiz_id FK
        text question_text
        varchar option_a
        varchar option_b
        varchar option_c
        varchar option_d
        enum correct_answer
        int order_num
        datetime created_at
        datetime updated_at
    }
    QUIZ_RESULTS {
        int id PK
        int user_id FK
        int quiz_id FK
        int score
        int total_questions
        int correct_answers
        datetime completed_at
    }
    LOGS_ACTIVITY {
        bigint id PK
        varchar request_id
        int user_id FK
        varchar actor_public_id
        enum actor_type
        enum event_type
        varchar action
        varchar http_method
        varchar endpoint
        varchar resource_type
        varchar resource_id
        varchar ip_address
        text user_agent
        varchar session_id_hash
        int http_status
        boolean success
        int duration_ms
        json payload_json
        int payload_size_bytes
        varchar error_code
        text error_message
        datetime created_at
    }
    ADMIN_COUNTERS {
        varchar name PK
        int value
        datetime updated_at
    }
    SCHEMA_MIGRATIONS {
        varchar version PK
        varchar description
        datetime applied_at
    }
```

## Relasi dan constraint utama

| Relasi | Constraint/policy |
|---|---|
| `animals.category_id → categories.id` | `ON DELETE RESTRICT`, update cascade |
| `favorites.user_id → users.id` | `ON DELETE CASCADE` |
| `favorites.animal_id → animals.id` | `ON DELETE CASCADE`; pasangan user/animal unik |
| `quizzes.category_id → categories.id` | Nullable, `ON DELETE SET NULL` |
| `quiz_questions.quiz_id → quizzes.id` | `ON DELETE CASCADE` |
| `quiz_results.user_id → users.id` | `ON DELETE CASCADE` |
| `quiz_results.quiz_id → quizzes.id` | `ON DELETE CASCADE` |
| `logs_activity.user_id → users.id` | Nullable, `ON DELETE SET NULL` |

`admin_counters` dan `schema_migrations` adalah tabel pendukung dan tidak memiliki foreign key ke entitas domain. `users.is_admin` membedakan guest (`0`) dan admin (`1`); CHECK constraint schema mengharuskan field identitas admin terisi dan field tersebut NULL untuk guest.
