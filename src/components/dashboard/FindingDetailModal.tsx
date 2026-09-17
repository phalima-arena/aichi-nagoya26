"use client";

import type { Finding } from "@/lib/types";
import { RELEVANCE_COLORS } from "@/lib/colors";

export function FindingDetailModal({ finding, onClose }: { finding: Finding; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--surface)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {finding.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={finding.photo_url} alt="Finding" className="max-h-72 w-full object-cover sm:rounded-t-2xl" />
        )}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-[var(--ink-muted)]">{finding.finding_number}</p>
              <p className="text-sm text-[var(--ink-secondary)]">
                {new Date(finding.occurred_at).toLocaleString()}
              </p>
            </div>
            <button onClick={onClose} className="text-[var(--ink-muted)]" aria-label="Close">
              ✕
            </button>
          </div>

          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
            style={{ background: RELEVANCE_COLORS[finding.relevance] }}
          >
            {finding.relevance} relevance
          </span>

          <DetailRow label="Venue" value={finding.venue} />
          <DetailRow label="Functional Area" value={finding.functional_area} />
          <DetailRow label="Findings" value={finding.description} />
          <DetailRow label="Observer" value={finding.observer_name || "Not provided"} />
          <p className="text-xs text-[var(--ink-muted)]">
            Logged {new Date(finding.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-[var(--ink-primary)]">{value}</p>
    </div>
  );
}
