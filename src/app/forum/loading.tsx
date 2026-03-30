export default function ForumLoading() {
  return (
    <div className="container px-4 py-8 md:px-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted mb-6" />
      <div className="h-5 w-72 rounded bg-muted mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden w-48 bg-muted sm:block md:w-56" />
            <div className="flex flex-1 flex-col justify-center p-4 md:p-6 gap-3">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-60 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
