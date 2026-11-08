'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  History,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { isAbortError, publicQuizApi } from '@/lib/api';
import type { PublicQuiz, QuizHistoryEntry, QuizSubmitResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type View = 'list' | 'play' | 'result';

export default function QuizPage() {
  const [view, setView] = useState<View>('list');
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<PublicQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const quizResponse = await publicQuizApi.list({}, signal);
      setQuizzes(quizResponse.data ?? []);

      // Riwayat bersifat best-effort: kegagalan membaca riwayat tidak boleh
      // memblokir daftar kuis.
      try {
        const historyResponse = await publicQuizApi.history({ limit: 5 }, signal);
        setHistory(historyResponse.data ?? []);
      } catch {
        setHistory([]);
      }
    } catch (err) {
      if (isAbortError(err)) return;
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar kuis.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  const startQuiz = async (quizId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await publicQuizApi.getById(quizId);
      setActiveQuiz(response.data);
      setAnswers({});
      setResult(null);
      setView('play');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat soal kuis.');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    const unanswered = (activeQuiz.questions ?? []).filter(
      (question) => !answers[question.id]
    );
    if (unanswered.length > 0) {
      setError(`Masih ada ${unanswered.length} soal yang belum dijawab.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: Number(questionId),
        answer,
      }));
      const response = await publicQuizApi.submit(activeQuiz.id, payload);
      setResult(response.data);
      setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  };

  const backToList = () => {
    setView('list');
    setActiveQuiz(null);
    setResult(null);
    setAnswers({});
    setError('');
    void loadOverview();
  };

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#27352b]">
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-28 sm:pt-32 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#64815c] transition hover:text-[#193c30]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
            Uji Pengetahuan
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Kuis Satwa
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-[#73796e]">
            Jawab soal-soal fauna untuk menguji seberapa jauh kamu mengenal
            keanekaragaman hayati Indonesia. Nilai dan riwayat pengerjaan
            disimpan otomatis oleh sistem.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {view === 'list' && (
          <div className="mt-10">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2" aria-busy="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-40 animate-pulse rounded-2xl bg-[#e8ebe2]"
                  />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center text-sm text-[#73796e]">
                Belum ada kuis aktif saat ini.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {quizzes.map((quiz) => (
                  <article
                    key={quiz.id}
                    className="flex flex-col rounded-2xl border border-[#e5e7dc] bg-white p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-bold">{quiz.title}</h2>
                      <span className="shrink-0 rounded-full bg-[#dfead9] px-3 py-1 text-xs font-semibold text-[#315b40]">
                        {quiz.total_questions ?? 0} soal
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#73796e]">
                      {quiz.description || 'Deskripsi kuis belum tersedia.'}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#e5e7dc] pt-4">
                      <span className="text-xs font-semibold text-[#858b7e]">
                        {quiz.category_name || 'Semua zona'}
                      </span>
                      <button
                        type="button"
                        onClick={() => void startQuiz(quiz.id)}
                        className="rounded-full bg-[#315b40] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#193c30]"
                      >
                        Mulai
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}


            {history.length > 0 && (
              <section className="mt-12">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#64815c]">
                  <History className="h-4 w-4" /> Riwayat Terakhir
                </h2>

                <ul className="mt-4 divide-y divide-[#e5e7dc] rounded-2xl border border-[#e5e7dc] bg-white">
                  {history.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {entry.quiz_title || `Quiz #${entry.quiz_id}`}
                        </p>
                        <p className="mt-0.5 text-xs text-[#858b7e]">
                          {formatDate(entry.completed_at)} ·{' '}
                          {entry.correct_answers}/{entry.total_questions} benar
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                          entry.score >= 70
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {entry.score}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {view === 'play' && activeQuiz && (
          <div className="mt-10">
            <div className="rounded-2xl border border-[#e5e7dc] bg-white p-6">
              <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#73796e]">
                {activeQuiz.description || 'Jawab semua soal dengan benar.'}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#858b7e]">
                {Object.keys(answers).length} / {(activeQuiz.questions ?? []).length}
                &nbsp;terjawab
              </p>
            </div>

            <ol className="mt-6 space-y-5">
              {(activeQuiz.questions ?? []).map((question, index) => (
                <li
                  key={question.id}
                  className="rounded-2xl border border-[#e5e7dc] bg-white p-6"
                >
                  <p className="text-sm font-bold text-[#64815c]">
                    Soal {index + 1}
                  </p>
                  <p className="mt-2 text-base font-semibold leading-8">
                    {question.question_text}
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ['A', question.option_a],
                        ['B', question.option_b],
                        ['C', question.option_c],
                        ['D', question.option_d],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: key,
                          }))
                        }
                        aria-pressed={answers[question.id] === key}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                          answers[question.id] === key
                            ? 'border-[#315b40] bg-[#dfead9] font-semibold text-[#193c30]'
                            : 'border-[#e5e7dc] hover:border-[#315b40] hover:bg-[#f6f8f2]'
                        }`}
                      >
                        <span className="font-bold">{key}.</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={backToList}
                className="rounded-full border border-[#e5e7dc] bg-white px-5 py-3 text-sm font-semibold text-[#60685d] transition hover:bg-[#edf0e7]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void submitQuiz()}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#315b40] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#193c30] disabled:opacity-60"
              >
                {submitting && <Loader2 className="spinner h-4 w-4" />}
                {submitting ? 'Menghitung...' : 'Kirim Jawaban'}
              </button>
            </div>
          </div>
        )}


        {view === 'result' && result && (
          <div className="mt-10">
            <div className="rounded-2xl border border-[#e5e7dc] bg-white p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-[#315b40]" />
              <h2 className="mt-4 text-2xl font-black">Skor {result.score}</h2>
              <p className="mt-2 text-sm text-[#73796e]">
                {result.correct_answers} benar dari {result.total_questions} soal
                · {result.wrong_answers} salah
              </p>

              <span
                className={`mt-5 inline-flex rounded-full px-5 py-2 text-sm font-bold ${
                  result.passed
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {result.passed ? 'Lulus (minimal 70)' : 'Belum lulus, coba lagi'}
              </span>
            </div>

            <ol className="mt-6 space-y-4">
              {result.review.map((item, index) => (
                <li
                  key={item.question_id}
                  className="rounded-2xl border border-[#e5e7dc] bg-white p-6"
                >
                  <div className="flex items-start gap-3">
                    {item.is_correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#858b7e]">
                        Soal {index + 1}
                      </p>
                      <p className="mt-1 font-semibold leading-7">
                        {item.question_text}
                      </p>
                      <p className="mt-2 text-sm text-[#73796e]">
                        Jawabanmu:{' '}
                        <strong>
                          {item.user_answer
                            ? `${item.user_answer}. ${item.options[item.user_answer as 'A']}`
                            : 'Tidak dijawab'}
                        </strong>
                      </p>
                      {!item.is_correct && (
                        <p className="mt-1 text-sm text-emerald-700">
                          Jawaban benar:{' '}
                          <strong>
                            {item.correct_answer}.{' '}
                            {item.options[item.correct_answer as 'A']}
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={backToList}
                className="inline-flex items-center gap-2 rounded-full bg-[#315b40] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#193c30]"
              >
                <RefreshCw className="h-4 w-4" /> Kembali ke Daftar Kuis
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

