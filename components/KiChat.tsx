'use client';

import { useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const IDEAS = [
  'Erkläre mir das Eisenhower-Prinzip einfach.',
  'Gib mir drei Übungsfragen zum Kaufvertrag.',
  'Schlage mir einen Lernplan für 14 Tage vor.',
];

export function KiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(q: string) {
    const content = q.trim();
    if (!content || busy) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setText('');
    setBusy(true);
    try {
      const res = await fetch('/api/ki', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler');
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Die KI ist gerade nicht erreichbar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      {messages.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {IDEAS.map((i) => (
            <button key={i} onClick={() => send(i)} className="rounded-full border border-line px-3.5 py-2 text-left text-sm hover:border-brand">
              {i}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3" aria-live="polite">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85ch] whitespace-pre-wrap rounded-xl px-4 py-3 text-[15px] ${
              m.role === 'user' ? 'self-end bg-brand-soft' : 'self-start border border-line bg-white'
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <div className="self-start text-sm text-muted">AzubiPilot KI schreibt…</div>}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label htmlFor="kiq" className="label">Deine Frage</label>
        <textarea id="kiq" rows={3} maxLength={2000} className="input" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary mt-3" disabled={busy || !text.trim()}>Senden</button>
      </form>
    </div>
  );
}
