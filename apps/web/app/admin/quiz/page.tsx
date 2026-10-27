'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, ClipboardList, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { categoriesApi, quizApi, type QuizQuestionInput } from '@/lib/api';
import type { Category, Quiz, QuizQuestion } from '@/lib/types';

type QuizForm = {
  title: string;
  description: string;
  category_id: string;
  is_active: boolean;
};

type QuestionForm = QuizQuestionInput;

const emptyQuizForm: QuizForm = { title: '', description: '', category_id: '', is_active: true };
const emptyQuestionForm: QuestionForm = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  order_num: 1,
};
const inputClass =
  'mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState<QuizForm>(emptyQuizForm);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestionForm);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [quizResponse, categoryResponse] = await Promise.all([
        quizApi.list(),
        categoriesApi.getAll(),
      ]);
      setQuizzes(quizResponse.data ?? []);
      setCategories(categoryResponse.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data quiz.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void loadData();
    });
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const openCreate = () => {
    setSelected(null);
    setQuizForm(emptyQuizForm);
    setNotice('');
    setDialogOpen(true);
  };

  const openEdit = async (quiz: Quiz) => {
    setNotice('');
    setError('');
    setLoading(true);
    try {
      const response = await quizApi.getById(quiz.id);
      const fullQuiz = response.data;
      setSelected(fullQuiz);
      setQuizForm({
        title: fullQuiz.title,
        description: fullQuiz.description ?? '',
        category_id: fullQuiz.category_id ? String(fullQuiz.category_id) : '',
        is_active: Boolean(fullQuiz.is_active),
      });
      setQuestionForm({ ...emptyQuestionForm, order_num: (fullQuiz.questions?.length ?? 0) + 1 });
      setEditingQuestion(null);
      setDialogOpen(true);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal memuat detail quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingQuiz(true);
    setNotice('');
    const payload = {
      title: quizForm.title.trim(),
      description: quizForm.description.trim(),
      category_id: quizForm.category_id ? Number(quizForm.category_id) : null,
      is_active: quizForm.is_active,
    };
    try {
      if (selected) {
        await quizApi.update(selected.id, payload);
        const refreshed = await quizApi.getById(selected.id);
        setSelected(refreshed.data);
        setNotice('Informasi quiz berhasil diperbarui.');
        await loadData();
      } else {
        const response = await quizApi.create(payload);
        setNotice(response.message || 'Quiz berhasil ditambahkan.');
        setDialogOpen(false);
        await loadData();
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menyimpan quiz.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({ ...emptyQuestionForm, order_num: (selected?.questions?.length ?? 0) + 1 });
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    setSavingQuestion(true);
    setNotice('');
    try {
      if (editingQuestion) {
        await quizApi.updateQuestion(selected.id, editingQuestion.id, questionForm);
      } else {
        await quizApi.createQuestion(selected.id, questionForm);
      }
      const refreshed = await quizApi.getById(selected.id);
      setSelected(refreshed.data);
      resetQuestionForm();
      await loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menyimpan pertanyaan.');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (question: QuizQuestion) => {
    if (!selected || !window.confirm('Hapus pertanyaan ini dari quiz?')) return;
    setNotice('');
    try {
      await quizApi.removeQuestion(selected.id, question.id);
      const refreshed = await quizApi.getById(selected.id);
      setSelected(refreshed.data);
      resetQuestionForm();
      await loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menghapus pertanyaan.');
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!window.confirm(`Hapus quiz "${quiz.title}" beserta semua pertanyaannya?`)) return;
    setNotice('');
    try {
      const response = await quizApi.remove(quiz.id);
      setNotice(response.message || 'Quiz berhasil dihapus.');
      await loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menghapus quiz.');
    }
  };

  return (
    <AdminLayout
      title="Kelola Quiz"
      subtitle="Buat quiz edukasi, atur kategori, dan kelola pertanyaan beserta jawabannya."
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="sl-card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ClipboardList className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Total quiz</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{quizzes.length}</p>
            </div>
          </div>
          <div className="sl-card p-5">
            <p className="text-sm font-medium text-[var(--color-text-muted)]">Quiz aktif</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
              {quizzes.filter((quiz) => Boolean(quiz.is_active)).length}
            </p>
          </div>
          <div className="sl-card flex items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Kategori terhubung</p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--color-text)]">{categories.length}</p>
            </div>
            <button type="button" onClick={() => void loadData()} disabled={loading} aria-label="Muat ulang quiz" className="rounded-xl border border-[var(--color-border)] p-2.5 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'spinner' : ''}`} />
            </button>
          </div>
        </section>

        {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</div>}

        <section className="sl-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">Daftar quiz</h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Quiz beserta jumlah pertanyaan dan status publikasinya.</p>
            </div>
            <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
              <Plus className="h-4 w-4" /> Tambah Quiz
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--color-text-muted)]">
              <Loader2 className="spinner h-5 w-5 text-emerald-600" /> Memuat quiz...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Belum ada quiz. Tambahkan quiz untuk membuat konten edukasi interaktif.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Quiz</th>
                    <th className="px-5 py-3.5 font-semibold">Kategori</th>
                    <th className="px-5 py-3.5 font-semibold">Pertanyaan</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="transition hover:bg-emerald-50/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--color-text)]">{quiz.title}</p>
                        {quiz.description && <p className="mt-1 max-w-md truncate text-xs text-[var(--color-text-muted)]">{quiz.description}</p>}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">{quiz.category_name || 'Semua kategori'}</td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">{quiz.total_questions ?? 0} pertanyaan</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${quiz.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {quiz.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => void openEdit(quiz)} aria-label={`Edit ${quiz.title}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void handleDeleteQuiz(quiz)} aria-label={`Hapus ${quiz.title}`} className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5">
          <button type="button" aria-label="Tutup form" onClick={() => setDialogOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <div className="relative z-10 my-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <h2 className="text-lg font-extrabold text-[var(--color-text)]">{selected ? 'Kelola quiz dan pertanyaan' : 'Tambah quiz'}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Lengkapi informasi quiz dan atur pertanyaan pilihan ganda.</p>
            {notice && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{notice}</p>}
            <form onSubmit={(event) => void handleSaveQuiz(event)} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Judul quiz
                  <input required maxLength={255} value={quizForm.title} onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })} className={inputClass} placeholder="Contoh: Mengenal Satwa Endemik" />
                </label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Deskripsi
                  <textarea maxLength={1000} rows={2} value={quizForm.description} onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })} className={inputClass} placeholder="Ringkasan materi quiz..." />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Kategori
                  <select value={quizForm.category_id} onChange={(event) => setQuizForm({ ...quizForm, category_id: event.target.value })} className={inputClass}>
                    <option value="">Semua kategori</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={quizForm.is_active} onChange={(event) => setQuizForm({ ...quizForm, is_active: event.target.checked })} className="h-4 w-4 accent-emerald-700" />
                  Quiz aktif dan dapat diakses
                </label>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Tutup</button>
                <button type="submit" disabled={savingQuiz} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                  {savingQuiz && <Loader2 className="spinner h-4 w-4" />}{savingQuiz ? 'Menyimpan...' : 'Simpan quiz'}
                </button>
              </div>
            </form>

            {selected && (
              <section className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[var(--color-text)]">Pertanyaan</h3>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{selected.questions?.length ?? 0} pertanyaan terdaftar</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selected.questions?.map((question, index) => (
                    <div key={question.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{question.question_text}</p>
                        <p className="mt-1 text-xs text-slate-500">Jawaban benar: {question.correct_answer}</p>
                      </div>
                      <button type="button" onClick={() => { setEditingQuestion(question); setQuestionForm({ question_text: question.question_text, option_a: question.option_a, option_b: question.option_b, option_c: question.option_c, option_d: question.option_d, correct_answer: question.correct_answer, order_num: question.order_num }); }} aria-label="Edit pertanyaan" className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => void handleDeleteQuestion(question)} aria-label="Hapus pertanyaan" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {(!selected.questions || selected.questions.length === 0) && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada pertanyaan. Tambahkan pertanyaan di bawah.</p>}
                </div>

                <form onSubmit={(event) => void handleSaveQuestion(event)} className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-emerald-950">{editingQuestion ? 'Ubah pertanyaan' : 'Tambah pertanyaan'}</h4>
                    {editingQuestion && <button type="button" onClick={resetQuestionForm} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Batalkan edit</button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                      Pertanyaan
                      <textarea required maxLength={1000} rows={2} value={questionForm.question_text} onChange={(event) => setQuestionForm({ ...questionForm, question_text: event.target.value })} className={inputClass} placeholder="Tuliskan pertanyaan..." />
                    </label>
                    {(['A', 'B', 'C', 'D'] as const).map((option) => {
                      const key = `option_${option.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d';
                      return (
                        <label key={option} className="text-xs font-semibold text-slate-700">
                          Opsi {option}
                          <input required maxLength={500} value={questionForm[key]} onChange={(event) => setQuestionForm({ ...questionForm, [key]: event.target.value })} className={inputClass} />
                        </label>
                      );
                    })}
                    <label className="text-xs font-semibold text-slate-700">
                      Jawaban benar
                      <select value={questionForm.correct_answer} onChange={(event) => setQuestionForm({ ...questionForm, correct_answer: event.target.value as QuestionForm['correct_answer'] })} className={inputClass}>
                        <option value="A">Opsi A</option><option value="B">Opsi B</option><option value="C">Opsi C</option><option value="D">Opsi D</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Urutan
                      <input type="number" min={1} value={questionForm.order_num} onChange={(event) => setQuestionForm({ ...questionForm, order_num: Number(event.target.value) })} className={inputClass} />
                    </label>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button type="submit" disabled={savingQuestion} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                      {savingQuestion ? <Loader2 className="spinner h-4 w-4" /> : editingQuestion ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {savingQuestion ? 'Menyimpan...' : editingQuestion ? 'Simpan perubahan' : 'Tambah pertanyaan'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
