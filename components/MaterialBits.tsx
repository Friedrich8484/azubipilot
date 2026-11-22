'use client';

import { useState } from 'react';

export function ChecklistItems({ id, items }: { id: string; items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="divide-y divide-line" data-list={id}>
      {items.map((it, k) => (
        <label key={it} className="flex cursor-pointer items-start gap-2.5 py-3">
          <input
            type="checkbox"
            checked={!!checked[k]}
            onChange={(e) => setChecked((c) => ({ ...c, [k]: e.target.checked }))}
            className="mt-1 h-[18px] w-[18px] flex-none accent-brand"
          />
          <span className={`min-w-0 flex-1 ${checked[k] ? 'text-muted line-through' : ''}`}>{it}</span>
        </label>
      ))}
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [msg, setMsg] = useState('');
  return (
    <div className="flex items-center gap-3">
      <button
        className="btn btn-secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setMsg('Text kopiert');
          } catch {
            setMsg('Kopieren nicht möglich, bitte Text markieren');
          }
          setTimeout(() => setMsg(''), 2500);
        }}
      >
        Text kopieren
      </button>
      <span role="status" className="text-sm text-muted">{msg}</span>
    </div>
  );
}
