'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, Crown, History, Loader2, Medal, RefreshCw, Trophy, UserRound, XCircle } from 'lucide-react';
import { ApiError, isAbortError, publicQuizApi } from '@/lib/api';
import type { PublicQuiz, QuizHistoryEntry, QuizLeaderboardEntry, QuizSubmitResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type View = 'list' | 'name' | 'play' | 'result';

const podiumIcon = (rank: number) => rank === 1
  ? <Crown className="h-4 w-4 text-amber-500" />
  : <Medal className={`h-4 w-4 ${rank === 2 ? 'text-slate-400' : 'text-orange-500'}`} />;

function Leaderboard({ entries, compact = false }: { entries: QuizLeaderboardEntry[]; compact?: boolean }) {
  return (
    <div className={compact ? 'mt-5 border-t border-[#e5e7dc] pt-4' : 'mt-6 rounded-2xl border border-[#e5e7dc] bg-white p-5'}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#315b40]"><Trophy className="h-4 w-4" /> Leaderboard</h3>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9aa397]">Skor terbaik</span>
      </div>
      {entries.length === 0 ? <p className="mt-3 text-xs text-[#858b7e]">Belum ada pemain. Jadilah yang pertama!</p> : (
        <ol className="mt-3 space-y-2">
          {entries.map((entry) => <li key={entry.id} className="flex items-center gap-3 rounded-xl bg-[#f6f8f2] px-3 py-2.5"><span className="flex w-7 justify-center">{podiumIcon(entry.rank)}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#27352b]">{entry.display_name}</span><span className="text-sm font-black text-[#315b40]">{entry.score}</span><span className="text-[11px] text-[#858b7e]">{entry.correct_answers}/{entry.total_questions}</span></li>)}
        </ol>
      )}
      {!compact && entries.length > 0 && <p className="mt-3 text-xs text-[#858b7e]">Peringkat berdasarkan percobaan terbaik setiap pemain.</p>}
    </div>
  );
}

export default function QuizPage() {
  const [view, setView] = useState<View>('list');
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<number, QuizLeaderboardEntry[]>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [pendingQuizId, setPendingQuizId] = useState<number | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<PublicQuiz | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Harus identik dengan validator backend `quiz.user.validation.ts`.
  const displayNamePattern = /^[\p{L}\p{N} ]+$/u;
  const isDisplayNameValid =
    displayName.trim().length >= 2 &&
    displayName.trim().length <= 50 &&
    displayNamePattern.test(displayName.trim());

  const loadLeaderboards = useCallback(async (items: PublicQuiz[], signal?: AbortSignal) => {
    const pairs = await Promise.all(items.map(async (quiz) => {
      try {
        const response = await publicQuizApi.leaderboard(quiz.id, signal);
        return [quiz.id, response.data ?? []] as const;
      } catch {
        return [quiz.id, []] as const;
      }
    }));
    setLeaderboards(Object.fromEntries(pairs));
  }, []);

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const quizResponse = await publicQuizApi.list({}, signal);
      const items = quizResponse.data ?? [];
      setQuizzes(items);
      void loadLeaderboards(items, signal);
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
  }, [loadLeaderboards]);

  useEffect(() => {
    const controller = new AbortController();
    // Initial data loading is the external synchronization this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  const chooseQuiz = (quizId: number) => {
    setPendingQuizId(quizId);
    setDisplayName('');
    setError('');
    setView('name');
  };

  const beginQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = displayName.trim();
    if (name.length < 2 || name.length > 50) {
      setError('Nama pemain harus terdiri dari 2-50 karakter.');
      return;
    }
    if (!displayNamePattern.test(name)) {
      setError('Nama pemain hanya boleh berisi huruf, angka, dan spasi.');
      return;
    }
    if (!pendingQuizId) return;
    setLoading(true);
    setError('');
    try {
      const response = await publicQuizApi.getById(pendingQuizId);
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
    const questions = activeQuiz.questions ?? [];
    const unanswered = questions.filter((question) => !answers[question.id]);
    if (unanswered.length > 0) {
      setError(`Masih ada ${unanswered.length} soal yang belum dijawab.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ question_id: Number(questionId), answer }));
      const response = await publicQuizApi.submit(activeQuiz.id, { display_name: displayName.trim(), answers: payload });
      setResult(response.data);
      const leaderboardResponse = await publicQuizApi.leaderboard(activeQuiz.id);
      setLeaderboards((current) => ({ ...current, [activeQuiz.id]: leaderboardResponse.data ?? [] }));
      setView('result');
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setError(
          err.details
            .map((detail) => `${detail.field ?? 'field'}: ${detail.message ?? 'tidak valid'}`)
            .join(' ')
        );
      } else {
        setError(err instanceof Error ? err.message : 'Gagal mengirim jawaban.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const backToList = () => {
    setView('list');
    setActiveQuiz(null);
    setPendingQuizId(null);
    setResult(null);
    setAnswers({});
    setError('');
    void loadOverview();
  };

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#27352b]">
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:pt-32 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64815c] transition hover:text-[#193c30]"><ArrowLeft className="h-4 w-4" /> Kembali ke beranda</Link>
        <div className="mt-6 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">JSN-EDU Â· Tantangan Pengetahuan</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Kuis Satwa</h1><p className="mt-4 leading-8 text-[#73796e]">Pilih kuis, tulis nama panggilanmu, dan buktikan seberapa jauh kamu mengenal satwa Indonesia. Skor terbaikmu akan masuk leaderboard setiap kuis.</p></div>
        {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {view === 'list' && <div className="mt-10">
          {loading ? <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-[#e8ebe2]" />)}</div> : quizzes.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center text-sm text-[#73796e]">Belum ada kuis aktif saat ini.</div> : <div className="grid gap-5 md:grid-cols-2">{quizzes.map((quiz) => <article key={quiz.id} className="rounded-2xl border border-[#e5e7dc] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#64815c]">{quiz.category_name || 'Semua zona'}</p><h2 className="mt-2 text-xl font-bold">{quiz.title}</h2></div><span className="shrink-0 rounded-full bg-[#dfead9] px-3 py-1 text-xs font-semibold text-[#315b40]">{quiz.total_questions ?? 0} soal</span></div><p className="mt-3 line-clamp-2 text-sm leading-7 text-[#73796e]">{quiz.description || 'Uji pengetahuanmu tentang satwa dan habitatnya.'}</p><button type="button" onClick={() => chooseQuiz(quiz.id)} className="mt-5 w-full rounded-full bg-[#315b40] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193c30]">Mulai Kuis</button><Leaderboard compact entries={(leaderboards[quiz.id] ?? []).slice(0, 3)} /></article>)}</div>}
          {history.length > 0 && <section className="mt-12"><h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#64815c]"><History className="h-4 w-4" /> Riwayat Terakhir</h2><ul className="mt-4 divide-y divide-[#e5e7dc] rounded-2xl border border-[#e5e7dc] bg-white">{history.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{entry.quiz_title || `Kuis #${entry.quiz_id}`}</p><p className="mt-0.5 text-xs text-[#858b7e]">{formatDate(entry.completed_at)} Â· {entry.correct_answers}/{entry.total_questions} benar</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{entry.score}</span></li>)}</ul></section>}
        </div>}

        {view === 'name' && <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-[#e5e7dc] bg-white p-7 text-center shadow-sm sm:p-9"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dfead9] text-[#315b40]"><UserRound className="h-8 w-8" /></div><h2 className="mt-5 text-2xl font-black">Siapa nama pemainnya?</h2><p className="mt-2 text-sm leading-7 text-[#73796e]">Nama ini akan tampil di leaderboard kuis. Gunakan nama panggilan yang nyaman dibagikan.</p><form onSubmit={beginQuiz} className="mt-6"><label htmlFor="quiz-display-name" className="sr-only">Nama pemain</label><input id="quiz-display-name" autoFocus value={displayName} onChange={(event) => { setDisplayName(event.target.value); setError(''); }} maxLength={50} pattern="[\\p{L}\\p{N} ]+" title="Gunakan huruf, angka, spasi, titik, garis bawah, atau garis hubung." aria-invalid={displayName.length > 0 && !isDisplayNameValid} placeholder="Contoh: Raka" className={`w-full rounded-2xl border bg-[#faf9f4] px-4 py-3 text-center text-base outline-none focus:ring-4 focus:ring-[#315b40]/10 ${displayName.length > 0 && !isDisplayNameValid ? 'border-rose-400 focus:border-rose-500' : 'border-[#d9dfd2] focus:border-[#315b40]'}`} /><p className="mt-2 text-right text-xs text-[#9aa397]">{displayName.length}/50</p>{displayName.length > 0 && !isDisplayNameValid && <p className="mt-2 text-left text-xs text-rose-600">Gunakan hanya huruf, angka, dan spasi.</p>}<button type="submit" disabled={loading || !isDisplayNameValid} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#315b40] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#193c30] disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Loader2 className="spinner h-4 w-4" /> : null} Lanjut ke Kuis</button></form><button type="button" onClick={backToList} className="mt-4 text-sm font-semibold text-[#64815c] hover:text-[#193c30]">Kembali ke daftar kuis</button></div>}

        {view === 'play' && activeQuiz && <div className="mt-10"><div className="rounded-2xl border border-[#e5e7dc] bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#64815c]">Pemain: {displayName}</p><h2 className="mt-2 text-xl font-bold">{activeQuiz.title}</h2></div><span className="rounded-full bg-[#dfead9] px-3 py-1 text-xs font-bold text-[#315b40]">{Object.keys(answers).length}/{activeQuiz.questions?.length ?? 0} terjawab</span></div><p className="mt-3 text-sm leading-7 text-[#73796e]">{activeQuiz.description || 'Jawab semua soal dengan teliti.'}</p></div><ol className="mt-6 space-y-5">{(activeQuiz.questions ?? []).map((question, index) => <li key={question.id} className="rounded-2xl border border-[#e5e7dc] bg-white p-6"><p className="text-sm font-bold text-[#64815c]">Soal {index + 1}</p><p className="mt-2 text-base font-semibold leading-8">{question.question_text}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{(['A', 'B', 'C', 'D'] as const).map((key) => <button key={key} type="button" onClick={() => setAnswers((current) => ({ ...current, [question.id]: key }))} aria-pressed={answers[question.id] === key} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${answers[question.id] === key ? 'border-[#315b40] bg-[#dfead9] font-semibold text-[#193c30]' : 'border-[#e5e7dc] hover:border-[#315b40] hover:bg-[#f6f8f2]'}`}><span className="font-bold">{key}.</span><span>{question[`option_${key.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d']}</span></button>)}</div></li>)}</ol><div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={backToList} className="rounded-full border border-[#e5e7dc] bg-white px-5 py-3 text-sm font-semibold text-[#60685d]">Batal</button><button type="button" onClick={() => void submitQuiz()} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#315b40] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting && <Loader2 className="spinner h-4 w-4" />}{submitting ? 'Menghitung...' : 'Kirim Jawaban'}</button></div></div>}

        {view === 'result' && result && <div className="mt-10"><div className="rounded-3xl border border-[#e5e7dc] bg-white p-8 text-center shadow-sm"><Award className="mx-auto h-12 w-12 text-[#315b40]" /><p className="mt-4 text-sm font-semibold text-[#64815c]">Bagus, {result.display_name}!</p><h2 className="mt-2 text-4xl font-black text-[#315b40]">{result.score}</h2><p className="mt-2 text-sm text-[#73796e]">{result.correct_answers} benar dari {result.total_questions} soal Â· {result.wrong_answers} salah</p><span className={`mt-5 inline-flex rounded-full px-5 py-2 text-sm font-bold ${result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{result.passed ? 'Lulus Â· Kerja bagus!' : 'Belum lulus Â· Coba lagi!'}</span></div><Leaderboard entries={leaderboards[result.quiz_id] ?? []} /><div className="mt-8 flex justify-center"><button type="button" onClick={backToList} className="inline-flex items-center gap-2 rounded-full bg-[#315b40] px-6 py-3 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" /> Kembali ke Daftar Kuis</button></div><ol className="mt-8 space-y-4">{result.review.map((item, index) => <li key={item.question_id} className="rounded-2xl border border-[#e5e7dc] bg-white p-6"><div className="flex items-start gap-3">{item.is_correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}<div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#858b7e]">Soal {index + 1}</p><p className="mt-1 font-semibold leading-7">{item.question_text}</p><p className="mt-2 text-sm text-[#73796e]">Jawabanmu: <strong>{item.user_answer ? `${item.user_answer}. ${item.options[item.user_answer as 'A']}` : 'Tidak dijawab'}</strong></p>{!item.is_correct && <p className="mt-1 text-sm text-emerald-700">Jawaban benar: <strong>{item.correct_answer}. {item.options[item.correct_answer as 'A']}</strong></p>}</div></div></li>)}</ol></div>}
      </section>
    </main>
  );
}
