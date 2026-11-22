'use client';

import { useTransition } from 'react';
import { toggleTask, toggleGoal } from '@/app/(app)/actions';
import { formatDate } from '@/lib/dates';

export function TaskCheck({ id, title, date, done }: { id: string; title: string; date: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <label className={`flex cursor-pointer items-start gap-2.5 py-3 ${pending ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        defaultChecked={done}
        disabled={pending}
        onChange={(e) => start(() => toggleTask(id, e.target.checked))}
        className="mt-1 h-[18px] w-[18px] flex-none accent-brand"
      />
      <span className="min-w-0 flex-1">
        <span className={done ? 'text-muted line-through' : ''}>{title}</span>
        <span className="block text-xs text-muted">{formatDate(date)}</span>
      </span>
    </label>
  );
}

export function GoalCheck({ id, text, done }: { id: string; text: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <label className={`flex cursor-pointer items-start gap-2.5 py-3 ${pending ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        defaultChecked={done}
        disabled={pending}
        onChange={(e) => start(() => toggleGoal(id, e.target.checked))}
        className="mt-1 h-[18px] w-[18px] flex-none accent-brand"
      />
      <span className={`min-w-0 flex-1 ${done ? 'text-muted line-through' : ''}`}>{text}</span>
    </label>
  );
}
