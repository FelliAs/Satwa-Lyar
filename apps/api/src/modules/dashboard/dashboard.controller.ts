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
      totalUsers,
      totalQuizzes,
      recentAnimals,
      recentUsers,
      animalsByCategory,
      usersByRole,
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

      // 5 user terbaru
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

      // Jumlah user berdasarkan role
      pool.query(
        `SELECT IF(is_admin = 1, 'admin', 'user') AS role, COUNT(*) AS total FROM users GROUP BY is_admin`
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total_animals: Number(totalAnimals[0].total),
          total_categories: Number(totalCategories[0].total),
          total_users: Number(totalUsers[0].total),
          total_quizzes: Number(totalQuizzes[0].total),
        },
        recent_animals: recentAnimals,
        recent_users: recentUsers,
        animals_by_category: animalsByCategory,
        users_by_role: usersByRole,
      },
    });
  } catch (error) {
    next(error);
  }
};
