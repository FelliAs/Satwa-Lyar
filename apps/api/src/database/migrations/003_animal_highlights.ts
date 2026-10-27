import { Connection } from 'mariadb';
import { tableExists } from './helpers';

const CREATE_ANIMAL_HIGHLIGHTS = `
CREATE TABLE IF NOT EXISTS animal_highlights (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  animal_id   INT UNSIGNED NOT NULL,
  location    VARCHAR(100) NOT NULL COMMENT 'landing atau slug kategori zona',
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  priority    INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_animal_highlight_location (animal_id, location),
  KEY idx_animal_highlights_location (location, is_active, priority),
  CONSTRAINT fk_animal_highlights_animal
    FOREIGN KEY (animal_id) REFERENCES animals (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

export const up = async (conn: Connection): Promise<void> => {
  if (!(await tableExists(conn, 'animals'))) {
    throw new Error('Tabel `animals` belum ada. Jalankan schema database terlebih dahulu.');
  }

  await conn.query(CREATE_ANIMAL_HIGHLIGHTS);
};
