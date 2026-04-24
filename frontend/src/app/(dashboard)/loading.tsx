import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
