export default function RootLoading() {
  return (
    <div className="container flex min-h-[50dvh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-muted border-t-accent-signature" />
        </div>
        <p className="font-display text-sm font-medium text-muted-foreground tracking-wide">
          Загрузка...
        </p>
      </div>
    </div>
  );
}
