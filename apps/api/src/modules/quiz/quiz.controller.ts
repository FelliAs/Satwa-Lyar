import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { recordAdminAction } from '../../modules/logs/logs.service';

// ========================
// GET /api/admin/quiz
// ========================
export const getAllQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rows = await pool.query(
      `SELECT q.id, q.title, q.description, q.category_id, q.is_active,
              c.name AS category_name,
              COUNT(qq.id) AS total_questions,
              q.created_at
       FROM quizzes q
       LEFT JOIN categories c ON c.id = q.category_id
       LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
       GROUP BY q.id
       ORDER BY q.created_at DESC`
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET /api/admin/quiz/:id
// ========================
export const getQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const quizRows = await pool.query(
      `SELECT q.*, c.name AS category_name
       FROM quizzes q
       LEFT JOIN categories c ON c.id = q.category_id
       WHERE q.id = ?`,
      [id]
    );

    if (!quizRows[0]) {
      return next(createError('Quiz tidak ditemukan.', 404));
    }

    // Ambil semua pertanyaan beserta options
    const questions = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_num
       FROM quiz_questions WHERE quiz_id = ? ORDER BY order_num ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...quizRows[0],
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/admin/quiz
// ========================
export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, category_id, is_active = true, questions } = req.body;

    // Buat quiz
    const quizResult = await pool.query(
      `INSERT INTO quizzes (title, description, category_id, is_active) VALUES (?, ?, ?, ?)`,
      [title, description || null, category_id || null, is_active]
    );

    const quizId = quizResult.insertId;

    // Tambahkan pertanyaan jika ada
    if (questions && Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.query(
          `INSERT INTO quiz_questions
             (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_num)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quizId,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            q.order_num ?? i + 1,
          ]
        );
      }
    }

    const newQuiz = await pool.query(
      `SELECT q.*, c.name AS category_name FROM quizzes q
       LEFT JOIN categories c ON c.id = q.category_id WHERE q.id = ?`,
      [quizId]
    );

    const newQuestions = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_num ASC',
      [quizId]
    );

    await recordAdminAction(req, {
      action: 'CREATE_QUIZ',
      resource_type: 'quiz',
      resource_id: quizId,
      payload: {
        title,
        category_id: category_id || null,
        is_active,
        question_count: Array.isArray(questions) ? questions.length : 0,
      },
      after: {
        id: Number(quizId),
        title,
        category_id: category_id || null,
        is_active,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Quiz berhasil dibuat.',
      data: { ...newQuiz[0], questions: newQuestions },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/admin/quiz/:id
// ========================
export const updateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, category_id, is_active } = req.body;

    const existing = await pool.query(
      'SELECT id, title, category_id, is_active FROM quizzes WHERE id = ?',
      [id]
    );
    if (!existing[0]) {
      return next(createError('Quiz tidak ditemukan.', 404));
    }

    await pool.query(
      `UPDATE quizzes
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           category_id = COALESCE(?, category_id),
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [title, description, category_id, is_active, id]
    );

    const updated = await pool.query(
      `SELECT q.*, c.name AS category_name FROM quizzes q
       LEFT JOIN categories c ON c.id = q.category_id WHERE q.id = ?`,
      [id]
    );

    await recordAdminAction(req, {
      action: 'UPDATE_QUIZ',
      resource_type: 'quiz',
      resource_id: id,
      payload: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category_id !== undefined ? { category_id } : {}),
        ...(is_active !== undefined ? { is_active } : {}),
      },
      before: {
        title: existing[0].title,
        category_id: existing[0].category_id,
        is_active: existing[0].is_active,
      },
      after: {
        title: updated[0]?.title,
        category_id: updated[0]?.category_id,
        is_active: updated[0]?.is_active,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz berhasil diperbarui.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE /api/admin/quiz/:id
// ========================
export const deleteQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id FROM quizzes WHERE id = ?', [id]);
    if (!existing[0]) {
      return next(createError('Quiz tidak ditemukan.', 404));
    }

    // quiz_questions akan terhapus otomatis via ON DELETE CASCADE di database
    await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);

    await recordAdminAction(req, {
      action: 'DELETE_QUIZ',
      resource_type: 'quiz',
      resource_id: id,
      before: {
        title: existing[0].title,
        category_id: existing[0].category_id,
        is_active: existing[0].is_active,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/admin/quiz/:id/questions
// ========================
export const addQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, order_num } =
      req.body;

    const quizCheck = await pool.query('SELECT id FROM quizzes WHERE id = ?', [id]);
    if (!quizCheck[0]) {
      return next(createError('Quiz tidak ditemukan.', 404));
    }

    const result = await pool.query(
      `INSERT INTO quiz_questions
         (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_num)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_num || 1]
    );

    const newQuestion = await pool.query(
      'SELECT * FROM quiz_questions WHERE id = ?',
      [result.insertId]
    );

    await recordAdminAction(req, {
      action: 'ADD_QUESTION',
      resource_type: 'question',
      resource_id: result.insertId,
      payload: {
        quiz_id: Number(id),
        question_text,
        order_num: order_num || 1,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pertanyaan berhasil ditambahkan.',
      data: newQuestion[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/admin/quiz/:id/questions/:qid
// ========================
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, qid } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, order_num } =
      req.body;

    const qCheck = await pool.query(
      `SELECT id, question_text, order_num FROM quiz_questions WHERE id = ? AND quiz_id = ?`,
      [qid, id]
    );
    if (!qCheck[0]) {
      return next(createError('Pertanyaan tidak ditemukan.', 404));
    }

    await pool.query(
      `UPDATE quiz_questions SET
         question_text = COALESCE(?, question_text),
         option_a = COALESCE(?, option_a),
         option_b = COALESCE(?, option_b),
         option_c = COALESCE(?, option_c),
         option_d = COALESCE(?, option_d),
         correct_answer = COALESCE(?, correct_answer),
         order_num = COALESCE(?, order_num)
       WHERE id = ?`,
      [question_text, option_a, option_b, option_c, option_d, correct_answer, order_num, qid]
    );

    const updated = await pool.query(
      'SELECT * FROM quiz_questions WHERE id = ?',
      [qid]
    );

    await recordAdminAction(req, {
      action: 'UPDATE_QUESTION',
      resource_type: 'question',
      resource_id: qid,
      payload: {
        quiz_id: Number(id),
        ...(question_text !== undefined ? { question_text } : {}),
        ...(order_num !== undefined ? { order_num } : {}),
      },
      before: {
        question_text: qCheck[0].question_text,
        order_num: qCheck[0].order_num,
      },
      after: {
        question_text: updated[0]?.question_text,
        order_num: updated[0]?.order_num,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Pertanyaan berhasil diperbarui.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE /api/admin/quiz/:id/questions/:qid
// ========================
export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, qid } = req.params;

    const qCheck = await pool.query(
      `SELECT id, question_text, order_num FROM quiz_questions WHERE id = ? AND quiz_id = ?`,
      [qid, id]
    );
    if (!qCheck[0]) {
      return next(createError('Pertanyaan tidak ditemukan.', 404));
    }

    await pool.query('DELETE FROM quiz_questions WHERE id = ?', [qid]);

    await recordAdminAction(req, {
      action: 'DELETE_QUESTION',
      resource_type: 'question',
      resource_id: qid,
      payload: { quiz_id: Number(id) },
      before: {
        question_text: qCheck[0].question_text,
        order_num: qCheck[0].order_num,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Pertanyaan berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
