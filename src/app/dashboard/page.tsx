"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Finding, Relevance } from "@/lib/types";
import { RELEVANCE_LEVELS } from "@/lib/types";
import { CHART_HUES } from "@/lib/colors";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { CountBarChart, RelevanceBarChart } from "@/components/dashboard/Charts";
import { FindingsList } from "@/components/dashboard/FindingsList";
import { FindingDetailModal } from "@/components/dashboard/FindingDetailModal";
import { exportFindingsToExcel, exportFindingsToPdf } from "@/lib/export";
import LogoutButton from "@/components/LogoutButton";

const ALL_VENUES = "__all__";

export default function DashboardPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueFilter, setVenueFilter] = useState<string>(ALL_VENUES);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("findings")
        .select("*")
        .order("occurred_at", { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setFindings((data as Finding[]) ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const byRelevance = useMemo(() => {
    const counts: Record<Relevance, number> = { High: 0, Medium: 0, Low: 0 };
    for (const f of findings) counts[f.relevance]++;
    return counts;
  }, [findings]);

  const byVenue = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of findings) counts.set(f.venue, (counts.get(f.venue) ?? 0) + 1);
    return Array.from(counts, ([name, count]) => ({ name, count }));
  }, [findings]);

  const byFunctionalArea = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of findings) counts.set(f.functional_area, (counts.get(f.functional_area) ?? 0) + 1);
    return Array.from(counts, ([name, count]) => ({ name, count }));
  }, [findings]);

  const relevanceChartData = RELEVANCE_LEVELS.map((level) => ({ name: level, count: byRelevance[level] }));

  const venueOptions = useMemo(
    () => [...byVenue].sort((a, b) => a.name.localeCompare(b.name)),
    [byVenue]
  );

  const filteredFindings = useMemo(
    () => (venueFilter === ALL_VENUES ? findings : findings.filter((f) => f.venue === venueFilter)),
    [findings, venueFilter]
  );

  async function handleExport(type: "excel" | "pdf") {
    setExporting(type);
    try {
      if (type === "excel") await exportFindingsToExcel(findings);
      else await exportFindingsToPdf(findings);
    } finally {
      setExporting(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 bg-[var(--page)] px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
            Nagoya 2026 Asian Games
          </p>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">Reporting Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null || findings.length === 0}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] disabled:opacity-50"
          >
            {exporting === "excel" ? "Exporting…" : "Export Excel"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null || findings.length === 0}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] disabled:opacity-50"
          >
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </button>
          <Link
            href="/new"
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white"
          >
            + Add Finding
          </Link>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-[var(--critical)]/30 bg-[var(--critical)]/10 px-3 py-2 text-sm text-[var(--critical)]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--ink-muted)]">Loading findings…</p>
      ) : (
        <>
          <KpiRow total={findings.length} byRelevance={byRelevance} />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--ink-primary)]">Findings</h2>
              <select
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-primary)]"
              >
                <option value={ALL_VENUES}>All venues ({findings.length})</option>
                {venueOptions.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[480px]">
              <FindingsList
                title={venueFilter === ALL_VENUES ? "All findings" : venueFilter}
                findings={filteredFindings}
                onSelectFinding={setSelectedFinding}
                showVenue={venueFilter === ALL_VENUES}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Findings by Relevance">
              <RelevanceBarChart data={relevanceChartData} />
            </ChartCard>
            <ChartCard title="Findings by Venue">
              <CountBarChart data={byVenue} hue={CHART_HUES.venue} />
            </ChartCard>
            <ChartCard title="Findings by Functional Area">
              <CountBarChart data={byFunctionalArea} hue={CHART_HUES.functionalArea} />
            </ChartCard>
          </div>
        </>
      )}

      <footer className="flex items-center justify-center py-4">
        <LogoutButton className="text-xs text-[var(--ink-muted)] underline underline-offset-4" />
      </footer>

      {selectedFinding && (
        <FindingDetailModal finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
      )}
    </main>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">{title}</h2>
      <div className="max-h-[360px] overflow-y-auto">{children}</div>
    </div>
  );
}
