import { cn } from "@/lib/utils";

interface ReputationProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

function tier(value: number): { color: string; icon: string; label: string } {
  if (value >= 500) return { color: "text-amber-500", icon: "★", label: "Эксперт" };
  if (value >= 100) return { color: "text-accent-signature", icon: "★", label: "Ветеран" };
  if (value >= 25) return { color: "text-blue-500", icon: "★", label: "Активный" };
  return { color: "text-muted-foreground", icon: "☆", label: "Новичок" };
}

export function Reputation({ value, className, showLabel = false }: ReputationProps) {
  const t = tier(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        t.color,
        className
      )}
      title={`${t.label} (${value} репутации)`}
    >
      <span aria-hidden="true">{t.icon}</span>
      <span>{value}</span>
      {showLabel && <span className="text-muted-foreground">· {t.label}</span>}
    </span>
  );
}
