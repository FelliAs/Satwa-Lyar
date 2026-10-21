import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { recordQuizPayload } from '../../modules/logs/logs.service';

// ============================================
// GET /api/quiz (Public quiz list)
// Menampilkan kuis aktif dan total pertanyaan
// ============================================
export const getPublicQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.query.category_id ? Number(req.query.category_id) : undefined;
    const categorySlug = (req.query.zone || req.query.category) as string;

    let whereClause = 'WHERE q.is_active = 1';
    const params: (string | number)[] = [];

    if (categoryId) {
      whereClause += ' AND q.category_id = ?';
      params.push(categoryId);
    }

    if (categorySlug) {
      whereClause += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    const rows = await pool.query(
      `SELECT q.id, q.title, q.description, q.category_id,
              c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
              COUNT(qq.id) AS total_questions,
              q.created_at
       FROM quizzes q
       LEFT JOIN categories c ON c.id = q.category_id
       LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
       ${whereClause}
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      params
    );

    const formattedData = (rows as any[]).map((quiz) => ({
      ...quiz,
      total_questions: Number(quiz.total_questions || 0),
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET /api/quiz/:id (Public quiz questions)
// MENGAMBIL SOAL KUIS TANPA MENAMPILKAN KUNCI JAWABAN (correct_answer disembunyikan demi keamanan)
// ============================================
export const getPublicQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const quizRows = await pool.query(
      `SELECT q.id, q.title, q.description, q.category_id,
              c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
       FROM quizzes q
       LEFT JOIN categories c ON c.id = q.category_id
       WHERE q.id = ? AND q.is_active = 1`,
      [id]
    );

    const quiz = quizRows[0];
    if (!quiz) {
      return next(createError('Quiz tidak ditemukan atau saat ini tidak aktif.', 404));
    }

    // Ambil pertanyaan TANPA correct_answer!
    const questions = await pool.query(
      `SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, order_num
       FROM quiz_questions
       WHERE quiz_id = ?
       ORDER BY order_num ASC, id ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...quiz,
        total_questions: questions.length,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// POST /api/quiz/:id/submit (User submit quiz answers)
// Menghitung skor, menyimpan riwayat hasil kuis, dan mengembalikan review
// ============================================
export const submitQuizAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { answers } = req.body as {
      answers: Array<{ question_id: number; answer: string }>;
    };

    // Pastikan quiz ada dan aktif
    const quizRows = await pool.query(
      'SELECT id, title FROM quizzes WHERE id = ? AND is_active = 1',
      [id]
    );

    const quiz = quizRows[0];
    if (!quiz) {
      return next(createError('Quiz tidak ditemukan atau sudah dinonaktifkan.', 404));
    }

    // Ambil semua soal asli dari database beserta correct_answer
    const dbQuestions = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer
       FROM quiz_questions
       WHERE quiz_id = ?
       ORDER BY order_num ASC, id ASC`,
      [id]
    );

    if (dbQuestions.length === 0) {
      return next(createError('Quiz ini belum memiliki soal untuk dikerjakan.', 400));
    }

    // Buat map jawaban user berdasarkan question_id
    const userAnswersMap = new Map<number, string>();
    for (const item of answers) {
      userAnswersMap.set(Number(item.question_id), String(item.answer).toUpperCase());
    }

    // Monitoring payload kuis: hanya jawaban yang dipilih pengguna.
    // Kunci jawaban benar tidak pernah disimpan ke log.
    await recordQuizPayload(
      req,
      Number(id),
      answers.map((item) => ({
        question_id: Number(item.question_id),
        selected_option: String(item.answer).toUpperCase(),
      }))
    );

    let correctCount = 0;
    const totalQuestions = dbQuestions.length;

    const review = (dbQuestions as any[]).map((q) => {
      const userAnswer = userAnswersMap.get(q.id) || null;
      const isCorrect = userAnswer === q.correct_answer;

      if (isCorrect) {
        correctCount++;
      }

      return {
        question_id: q.id,
        question_text: q.question_text,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
        user_answer: userAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
      };
    });

    // Hitung skor (0 - 100)
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Simpan ke tabel quiz_results
    const insertResult = await pool.query(
      `INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, correct_answers, completed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, id, score, totalQuestions, correctCount]
    );

    res.status(200).json({
      success: true,
      message: 'Quiz berhasil diselesaikan!',
      data: {
        result_id: Number(insertResult.insertId),
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        score,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        wrong_answers: totalQuestions - correctCount,
        passed: score >= 70,
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET /api/quiz/history (User quiz attempt history)
// Menampilkan riwayat pengerjaan kuis milik user yang login
// ============================================
export const getUserQuizHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM quiz_results WHERE user_id = ?',
      [userId]
    );
    const total = Number(countResult[0]?.total || 0);

    const rows = await pool.query(
      `SELECT qr.id, qr.quiz_id, qr.score, qr.total_questions, qr.correct_answers, qr.completed_at,
              q.title AS quiz_title,
              c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN categories c ON c.id = q.category_id
       WHERE qr.user_id = ?
       ORDER BY qr.completed_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET /api/quiz/results/:id (Specific quiz result detail)
// ============================================
export const getUserQuizResultById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const rows = await pool.query(
      `SELECT qr.*,
              q.title AS quiz_title, q.description AS quiz_description,
              c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN categories c ON c.id = q.category_id
       WHERE qr.id = ?`,
      [id]
    );

    const result = rows[0];
    if (!result) {
      return next(createError('Hasil quiz tidak ditemukan.', 404));
    }

    // Pastikan hasil kuis milik identitas bersangkutan (atau admin)
    if (Number(result.user_id) !== userId && Number(req.user!.is_admin) !== 1) {
      return next(createError('Akses ditolak. Anda tidak berhak melihat hasil kuis ini.', 403));
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
