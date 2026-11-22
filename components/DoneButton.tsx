'use client';

import { useState, useTransition } from 'react';
import { setLessonDone } from '@/app/(app)/actions';
import { Icon } from '@/components/Icon';

export function DoneButton({ lessonId, done }: { lessonId: string; done: boolean }) {
  const [value, setValue] = useState(done);
  const [pending, start] = useTransition();

  return (
    <button
      className={`btn ${value ? 'btn-secondary' : 'btn-primary'}`}
      disabled={pending}
      aria-pressed={value}
      onClick={() => {
        const next = !value;
        setValue(next);
        start(async () => {
          try {
            await setLessonDone(lessonId, next);
          } catch {
            setValue(!next);
          }
        });
      }}
    >
      {value ? (
        <>
          <Icon name="check" className="h-4 w-4" /> Erledigt
        </>
      ) : (
        'Als erledigt markieren'
      )}
    </button>
  );
}
