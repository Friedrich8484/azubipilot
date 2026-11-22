'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card" role="alert">
      <h1 className="text-2xl font-extrabold">Das hat nicht geklappt</h1>
      <p className="mt-2 text-muted">Beim Laden ist ein Fehler aufgetreten. Versuche es noch einmal.</p>
      <button onClick={reset} className="btn btn-primary mt-4">Erneut versuchen</button>
    </div>
  );
}
