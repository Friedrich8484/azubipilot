'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { addMaterial, deleteMaterial, getMaterialUrl } from '@/app/(app)/material-actions';
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from '@/lib/plans';
import { Icon } from '@/components/Icon';

function safeName(name: string) {
  const clean = name.normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
  return clean.slice(-80) || 'datei';
}

function formatSize(b: number) {
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  return `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function Uploader({ userId, count, limit }: { userId: string; count: number; limit: number | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const full = limit != null && count >= limit;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOk('');
    const file = input.current?.files?.[0];
    if (!file) return setError('Bitte wähle eine Datei aus.');
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return setError('Erlaubt sind PDF, PNG, JPG und TXT.');
    if (file.size > MAX_UPLOAD_BYTES) return setError('Die Datei ist größer als 10 MB.');
    if (file.size === 0) return setError('Die Datei ist leer.');
    const name = title.trim() || file.name.replace(/\.[^.]+$/, '');

    setBusy(true);
    const supabase = createClient();
    const path = `${userId}/${crypto.randomUUID()}-${safeName(file.name)}`;

    const up = await supabase.storage.from('materials').upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) {
      setBusy(false);
      return setError(
        limit != null
          ? `Das Hochladen hat nicht geklappt. Im kostenlosen Plan sind höchstens ${limit} Dateien möglich.`
          : 'Das Hochladen hat nicht geklappt. Versuche es noch einmal.'
      );
    }

    const res = await addMaterial({ title: name, topic: topic.trim(), path, fileName: file.name, mime: file.type, size: file.size });
    if ('error' in res) {
      await supabase.storage.from('materials').remove([path]);
      setBusy(false);
      return setError(res.error);
    }

    setBusy(false);
    setTitle('');
    setTopic('');
    if (input.current) input.current.value = '';
    setOk('Datei hochgeladen.');
    router.refresh();
  }

  return (
    <div className="card">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Eigenes Material hochladen</h2>
        <span className={`pill ${full ? '' : 'pill-grey'}`}>
          {limit != null ? `${count} von ${limit} genutzt` : `${count} Dateien, unbegrenzt`}
        </span>
      </div>
      {full ? (
        <div className="notice mt-3">
          Du hast alle {limit} Plätze im kostenlosen Plan belegt. Lösche eine Datei oder wechsle auf{' '}
          <Link href="/preise" className="font-semibold text-brand-dark underline">Premium</Link>, um unbegrenzt hochzuladen.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-3.5 sm:grid-cols-2" noValidate>
          <div>
            <label htmlFor="mt" className="label">Titel</label>
            <input id="mt" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="z. B. Mitschrift Kaufvertrag" />
          </div>
          <div>
            <label htmlFor="mo" className="label">Thema</label>
            <input id="mo" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={80} placeholder="z. B. Beschaffung" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="mf" className="label">Datei (PDF, PNG, JPG, TXT, bis 10 MB)</label>
            <input id="mf" ref={input} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain" className="input" />
          </div>
          <div className="sm:col-span-2" aria-live="polite">
            {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
            {ok && <p role="status" className="mb-3 text-sm text-ok">{ok}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              <Icon name="upload" className="h-4 w-4" /> {busy ? 'Wird hochgeladen…' : 'Hochladen'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function MaterialRow({
  file,
}: {
  file: { id: string; title: string; topic: string; file_name: string; size_bytes: number; created_at: string };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState('');

  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <Icon name="file" className="h-5 w-5 flex-none text-muted" />
        <div className="min-w-0 flex-1">
          <b className="block truncate">{file.title}</b>
          <div className="truncate text-xs text-muted">
            {file.topic ? `${file.topic} · ` : ''}{file.file_name} · {formatSize(file.size_bytes)}
          </div>
        </div>
        <button
          className="btn btn-secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErr('');
              const r = await getMaterialUrl(file.id);
              if ('url' in r) window.open(r.url, '_blank', 'noopener');
              else setErr(r.error);
            })
          }
        >
          Öffnen
        </button>
        <button
          className="btn btn-ghost"
          disabled={pending}
          aria-label={`${file.title} löschen`}
          onClick={() =>
            start(async () => {
              setErr('');
              const r = await deleteMaterial(file.id);
              if ('error' in r) setErr(r.error);
              else router.refresh();
            })
          }
        >
          <Icon name="trash" />
        </button>
      </div>
      {err && <p role="alert" className="mt-1.5 text-sm text-danger">{err}</p>}
    </div>
  );
}
