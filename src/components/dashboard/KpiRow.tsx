import { RELEVANCE_COLORS } from "@/lib/colors";
import type { Relevance } from "@/lib/types";

export function KpiRow({ total, byRelevance }: { total: number; byRelevance: Record<Relevance, number> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiTile label="Total findings" value={total} />
      {(Object.entries(byRelevance) as [Relevance, number][]).map(([level, count]) => (
        <KpiTile key={level} label={`${level} relevance`} value={count} accent={RELEVANCE_COLORS[level]} />
      ))}
    </div>
  );
}

function KpiTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: accent ?? "var(--ink-primary)" }}>
        {value}
      </p>
    </div>
  );
}
