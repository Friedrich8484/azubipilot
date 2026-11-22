export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Wird geladen">
      <div className="h-9 w-64 rounded-lg bg-line" />
      <div className="h-40 rounded-xl2 bg-line" />
      <div className="h-40 rounded-xl2 bg-line" />
    </div>
  );
}
