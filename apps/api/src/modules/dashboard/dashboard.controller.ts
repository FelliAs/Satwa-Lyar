import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';

// ========================
// GET /api/admin/dashboard
// ========================
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Jalankan semua query secara paralel untuk efisiensi
    const [
      totalAnimals,
      totalCategories,
      totalGuests,
      totalAdmins,
      totalQuizzes,
      recentAnimals,
      recentGuests,
      animalsByCategory,
      usersByType,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM animals'),
      pool.query('SELECT COUNT(*) AS total FROM categories'),
      pool.query('SELECT COUNT(*) AS total FROM users WHERE is_admin = 0'),
      pool.query('SELECT COUNT(*) AS total FROM quizzes'),

      // 5 fauna terbaru
      pool.query(
        `SELECT a.id, a.name, a.scientific_name, a.image_key,
                c.name AS category_name, a.created_at
         FROM animals a
         LEFT JOIN categories c ON c.id = a.category_id
         ORDER BY a.created_at DESC LIMIT 5`
      ),

      // 5 identitas guest terbaru
      pool.query(
        `SELECT id, name, email, created_at, 'user' AS role
         FROM users WHERE is_admin = 0
         ORDER BY created_at DESC LIMIT 5`
      ),

      // Jumlah fauna per kategori
      pool.query(
        `SELECT c.name AS category_name, COUNT(a.id) AS total
         FROM categories c
         LEFT JOIN animals a ON a.category_id = c.id
         GROUP BY c.id ORDER BY total DESC`
      ),

      // Jumlah identitas berdasarkan tipe
      pool.query(
        `SELECT IF(is_admin = 1, 'admin', 'user') AS role, COUNT(*) AS total FROM users GROUP BY is_admin`
      ),
    ]);

    // Statistik log 24 jam terakhir (opsional, tabel log mungkin belum ada)
    let logStats: Record<string, number> = {
      total_24h: 0,
      errors_24h: 0,
      quiz_payloads_24h: 0,
    };

    try {
      const logRows = await pool.query(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN event_type = 'application_error' THEN 1 ELSE 0 END) AS errors,
                SUM(CASE WHEN event_type = 'quiz_payload' THEN 1 ELSE 0 END) AS quiz_payloads
         FROM logs_activity
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );

      logStats = {
        total_24h: Number(logRows[0]?.total || 0),
        errors_24h: Number(logRows[0]?.errors || 0),
        quiz_payloads_24h: Number(logRows[0]?.quiz_payloads || 0),
      };
    } catch {
      // tabel logs_activity belum tersedia - abaikan
    }

    res.status(200).json({
      success: true,
      request_id: req.requestId,
      data: {
        stats: {
          total_animals: Number(totalAnimals[0].total),
          total_categories: Number(totalCategories[0].total),
          total_quizzes: Number(totalQuizzes[0].total),
          total_guests: Number(totalGuests[0].total),
          total_admins: Number(totalAdmins[0].total),
          total_users: Number(totalGuests[0].total) + Number(totalAdmins[0].total),
          ...logStats,
        },
        recent_animals: recentAnimals,
        recent_guests: recentGuests,
        animals_by_category: animalsByCategory,
        users_by_type: usersByType,
      },
    });
  } catch (error) {
    next(error);
  }
};
