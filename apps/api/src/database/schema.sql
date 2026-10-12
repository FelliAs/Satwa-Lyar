-- ============================================
-- SATWA LYAR - Database Schema
-- MariaDB Cloud
-- ============================================

-- Pastikan menggunakan database yang benar
-- CREATE DATABASE IF NOT EXISTS satwa_lyar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE satwa_lyar;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  icon        VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: animals
-- ============================================
CREATE TABLE IF NOT EXISTS animals (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id         INT UNSIGNED NOT NULL,
  name                VARCHAR(255) NOT NULL,
  scientific_name     VARCHAR(255) NULL,
  description         TEXT NULL,
  physical_traits     TEXT NULL,
  habitat             TEXT NULL,
  food                TEXT NULL,
  conservation_status ENUM('EX','EW','CR','EN','VU','NT','LC','DD','NE') NULL DEFAULT 'NE',
  image_key           VARCHAR(500) NULL COMMENT 'Key/path gambar di Cloudflare R2',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_animals_category (category_id),
  KEY idx_animals_name (name),
  FULLTEXT KEY ft_animals_search (name, scientific_name, description),
  CONSTRAINT fk_animals_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: favorites
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  animal_id  INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites (user_id, animal_id),
  KEY idx_favorites_user (user_id),
  KEY idx_favorites_animal (animal_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_animal
    FOREIGN KEY (animal_id) REFERENCES animals (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: quizzes
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NULL,
  title       VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quizzes_category (category_id),
  CONSTRAINT fk_quizzes_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: quiz_questions
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quiz_id       INT UNSIGNED NOT NULL,
  question_text TEXT NOT NULL,
  option_a      VARCHAR(500) NOT NULL,
  option_b      VARCHAR(500) NOT NULL,
  option_c      VARCHAR(500) NOT NULL,
  option_d      VARCHAR(500) NOT NULL,
  correct_answer ENUM('A','B','C','D') NOT NULL,
  order_num     INT NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_questions_quiz (quiz_id),
  CONSTRAINT fk_questions_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: quiz_results
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  quiz_id     INT UNSIGNED NOT NULL,
  score       TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Nilai 0-100',
  total_questions INT UNSIGNED NOT NULL,
  correct_answers INT UNSIGNED NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_results_user (user_id),
  KEY idx_results_quiz (quiz_id),
  CONSTRAINT fk_results_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_results_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Kategori awal (4 zona)
-- ============================================
INSERT IGNORE INTO categories (name, slug, description, icon) VALUES
  ('Air Tawar', 'air-tawar', 'Fauna yang hidup di perairan tawar seperti sungai, danau, dan rawa', '🐟'),
  ('Serangga', 'serangga', 'Kelompok hewan invertebrata dengan enam kaki dan tubuh beruas', '🦋'),
  ('Reptil', 'reptil', 'Hewan berdarah dingin dengan sisik yang beragam jenis dan ukuran', '🦎'),
  ('Burung', 'burung', 'Hewan vertebrata berbulu dengan kemampuan terbang yang beragam', '🦅');

-- ============================================
-- SEED DATA: Admin user default
-- Password: Admin1234 (hashed dengan bcrypt)
-- GANTI PASSWORD INI SETELAH SETUP!
-- ============================================
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Administrator', 'admin@satwalyar.com', '$2a$12$fz89kTCEfa595rvaVoVJr.IMQCYDrVeyl5KPkVZBJlnmpzSvd4t4i', 'admin');
