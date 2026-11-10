import { Connection } from 'mariadb';
import { columnExists, indexExists } from './helpers';

export const up = async (conn: Connection): Promise<void> => {
  if (!(await columnExists(conn, 'quiz_results', 'display_name'))) {
    await conn.query(
      "ALTER TABLE quiz_results ADD COLUMN display_name VARCHAR(50) NOT NULL DEFAULT 'Pengunjung' AFTER user_id"
    );
  }

  if (!(await indexExists(conn, 'quiz_results', 'idx_results_leaderboard'))) {
    await conn.query(
      'ALTER TABLE quiz_results ADD KEY idx_results_leaderboard (quiz_id, score, correct_answers, completed_at)'
    );
  }
};
