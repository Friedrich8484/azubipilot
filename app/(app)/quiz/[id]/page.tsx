import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { QuizRunner } from '@/components/QuizRunner';

export const metadata: Metadata = { title: 'Quiz' };

export default async function QuizPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireUser();

  const { data: quiz } = await supabase.from('quizzes').select('id, title').eq('id', id).maybeSingle();
  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, options, correct_index, explanation')
    .eq('quiz_id', quiz.id)
    .order('position');

  return (
    <div>
      <Link href="/quiz" className="text-sm text-brand-dark underline">← Zur Auswahl</Link>
      <h1 className="mb-5 mt-3 text-3xl font-extrabold tracking-tight">{quiz.title}</h1>
      <QuizRunner
        quizId={quiz.id}
        questions={(questions ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          correct: q.correct_index,
          explanation: q.explanation,
        }))}
      />
    </div>
  );
}
