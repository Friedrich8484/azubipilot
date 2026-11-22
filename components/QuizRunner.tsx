'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { submitQuiz } from '@/app/(app)/actions';
import { Bar } from '@/components/Ring';
import { Icon } from '@/components/Icon';

type Question = { id: string; question: string; options: string[]; correct: number; explanation: string };
type Result = { score: number; total: number; points: number } | { error: string };

export function QuizRunner({ quizId, questions }: { quizId: string; questions: Question[] }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const [run, setRun] = useState(0);

  if (questions.length === 0) return <div className="card text-muted">Dieses Quiz hat noch keine Fragen.</div>;

  function restart() {
    setI(0);
    setAnswers([]);
    setResult(null);
    setRun((r) => r + 1);
  }

  function finish(all: number[]) {
    start(async () => {
      try {
        setResult(await submitQuiz(quizId, all));
      } catch {
        setResult({ error: 'Das Ergebnis konnte nicht gespeichert werden.' });
      }
    });
  }

  if (i >= questions.length) {
    const wrong = questions.filter((q, k) => answers[k] !== q.correct);
    const score = questions.length - wrong.length;
    const saved = result && 'score' in result;
    return (
      <div className="card">
        <h2 className="text-xl font-bold">Ergebnis</h2>
        <p className="mt-2 text-3xl font-extrabold tabular-nums">
          {score} von {questions.length} richtig
        </p>
        <p className="mb-3.5 mt-1 text-muted">
          {Math.round((score / questions.length) * 100)} %
          {saved ? `, +${result.points} Punkte gespeichert` : pending ? ', wird gespeichert…' : ''}
        </p>
        <Bar percent={(score / questions.length) * 100} />
        {result && 'error' in result && (
          <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {result.error}{' '}
            <button className="underline" onClick={() => finish(answers)}>Erneut speichern</button>
          </p>
        )}
        {wrong.length > 0 ? (
          <>
            <h3 className="mb-2 mt-6 text-lg font-bold">Zum Wiederholen</h3>
            <div className="divide-y divide-line">
              {wrong.map((w) => (
                <div key={w.id} className="py-3">
                  <b>{w.question}</b>
                  <p className="mt-1 text-sm text-muted">Richtig: {w.options[w.correct]}. {w.explanation}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4">Alles richtig. Stark.</p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={restart}>Nochmal</button>
          <Link href="/quiz" className="btn btn-secondary">Zur Auswahl</Link>
        </div>
      </div>
    );
  }

  const q = questions[i];
  const answered = answers[i] != null;

  return (
    <div key={run}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="pill">Frage {i + 1} von {questions.length}</span>
      </div>
      <div className="mb-4">
        <Bar percent={(i / questions.length) * 100} />
      </div>
      <div className="card">
        <h2 className="mb-4 text-xl font-bold">{q.question}</h2>
        <div className="flex flex-col gap-2.5">
          {q.options.map((o, k) => {
            let cls = 'border-line bg-white hover:border-brand';
            if (answered) {
              if (k === q.correct) cls = 'border-ok bg-ok-soft';
              else if (k === answers[i]) cls = 'border-danger bg-danger-soft';
              else cls = 'border-line bg-white';
            }
            return (
              <button
                key={k}
                disabled={answered}
                onClick={() => setAnswers((a) => { const n = [...a]; n[i] = k; return n; })}
                className={`flex w-full items-start gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left text-[15.5px] disabled:cursor-default ${cls}`}
              >
                <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg border border-line bg-canvas text-[13px] font-bold">
                  {'ABCD'[k]}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <>
            <div role="status" className={`notice mt-4 ${answers[i] === q.correct ? '' : 'bg-danger-soft'}`}>
              <b>{answers[i] === q.correct ? 'Richtig.' : 'Nicht ganz.'}</b> {q.explanation}
            </div>
            <div className="mt-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const next = i + 1;
                  setI(next);
                  if (next >= questions.length) finish(answers);
                }}
              >
                {i + 1 < questions.length ? 'Weiter' : 'Ergebnis ansehen'} <Icon name="arrow" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
