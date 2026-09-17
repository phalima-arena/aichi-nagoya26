"use client";

import type { Finding } from "@/lib/types";
import { RELEVANCE_COLORS } from "@/lib/colors";

export function FindingsList({
  venue,
  findings,
  onClose,
  onSelectFinding,
}: {
  venue: string;
  findings: Finding[];
  onClose: () => void;
  onSelectFinding: (finding: Finding) => void;
}) {
  const sorted = [...findings].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">Venue</p>
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{venue}</h3>
          <p className="text-xs text-[var(--ink-secondary)]">
            {sorted.length} finding{sorted.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={onClose} className="text-[var(--ink-muted)]" aria-label="Close">
          ✕
        </button>
      </div>
      <ul className="flex-1 divide-y divide-[var(--border)] overflow-y-auto">
        {sorted.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => onSelectFinding(f)}
              className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-black/[0.02]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--ink-muted)]">{f.finding_number}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: RELEVANCE_COLORS[f.relevance] }}>
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: RELEVANCE_COLORS[f.relevance] }}
                  />
                  {f.relevance}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-[var(--ink-primary)]">{f.description}</p>
              <span className="text-xs text-[var(--ink-muted)]">
                {new Date(f.occurred_at).toLocaleString()} · {f.functional_area}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
