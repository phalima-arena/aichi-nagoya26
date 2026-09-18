"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, PHOTO_BUCKET, photoStoragePath } from "@/lib/supabaseClient";
import type { Finding, Relevance } from "@/lib/types";
import { RELEVANCE_LEVELS } from "@/lib/types";
import { CHART_HUES } from "@/lib/colors";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { CountBarChart, RelevanceBarChart } from "@/components/dashboard/Charts";
import { FindingsList } from "@/components/dashboard/FindingsList";
import { FindingDetailModal } from "@/components/dashboard/FindingDetailModal";
import { exportFindingsToExcel, exportFindingsToPdf } from "@/lib/export";
import { SORT_OPTIONS, DEFAULT_SORT, sortFindings } from "@/lib/sort";
import LogoutButton from "@/components/LogoutButton";

const ALL = "__all__";
const NOT_PROVIDED = "__not_provided__";

export default function DashboardPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueFilter, setVenueFilter] = useState<string>(ALL);
  const [functionalAreaFilter, setFunctionalAreaFilter] = useState<string>(ALL);
  const [relevanceFilter, setRelevanceFilter] = useState<string>(ALL);
  const [observerFilter, setObserverFilter] = useState<string>(ALL);
  const [sortValue, setSortValue] = useState<string>(DEFAULT_SORT);
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

  const functionalAreaOptions = useMemo(
    () => [...byFunctionalArea].sort((a, b) => a.name.localeCompare(b.name)),
    [byFunctionalArea]
  );

  const observerOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of findings) {
      const key = f.observer_name?.trim() || NOT_PROVIDED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
      a.name === NOT_PROVIDED ? 1 : b.name === NOT_PROVIDED ? -1 : a.name.localeCompare(b.name)
    );
  }, [findings]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (venueFilter !== ALL && f.venue !== venueFilter) return false;
      if (functionalAreaFilter !== ALL && f.functional_area !== functionalAreaFilter) return false;
      if (relevanceFilter !== ALL && f.relevance !== relevanceFilter) return false;
      if (observerFilter !== ALL) {
        const observer = f.observer_name?.trim() || NOT_PROVIDED;
        if (observer !== observerFilter) return false;
      }
      return true;
    });
  }, [findings, venueFilter, functionalAreaFilter, relevanceFilter, observerFilter]);

  const sortedFilteredFindings = useMemo(
    () => sortFindings(filteredFindings, sortValue),
    [filteredFindings, sortValue]
  );

  const filtersActive =
    venueFilter !== ALL || functionalAreaFilter !== ALL || relevanceFilter !== ALL || observerFilter !== ALL;

  function clearFilters() {
    setVenueFilter(ALL);
    setFunctionalAreaFilter(ALL);
    setRelevanceFilter(ALL);
    setObserverFilter(ALL);
  }

  function buildFilterSummary(): string | null {
    const parts: string[] = [];
    if (venueFilter !== ALL) parts.push(`Venue: ${venueFilter}`);
    if (functionalAreaFilter !== ALL) parts.push(`Functional Area: ${functionalAreaFilter}`);
    if (relevanceFilter !== ALL) parts.push(`Relevance: ${relevanceFilter}`);
    if (observerFilter !== ALL) {
      parts.push(`Observer: ${observerFilter === NOT_PROVIDED ? "Not provided" : observerFilter}`);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }

  async function handleExport(type: "excel" | "pdf") {
    setExporting(type);
    try {
      const summary = buildFilterSummary();
      if (type === "excel") await exportFindingsToExcel(sortedFilteredFindings, summary);
      else await exportFindingsToPdf(sortedFilteredFindings, summary);
    } finally {
      setExporting(null);
    }
  }

  async function handleDelete(finding: Finding) {
    if (!window.confirm(`Delete finding ${finding.finding_number}? This can't be undone.`)) return;

    const { error } = await supabase.from("findings").delete().eq("id", finding.id);
    if (error) {
      window.alert(`Failed to delete: ${error.message}`);
      return;
    }

    if (finding.photo_url) {
      const path = photoStoragePath(finding.photo_url);
      if (path) await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    }

    setFindings((prev) => prev.filter((f) => f.id !== finding.id));
    setSelectedFinding((prev) => (prev?.id === finding.id ? null : prev));
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
            disabled={exporting !== null || sortedFilteredFindings.length === 0}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] disabled:opacity-50"
          >
            {exporting === "excel"
              ? "Exporting…"
              : `Export Excel${filtersActive ? ` (${sortedFilteredFindings.length})` : ""}`}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null || sortedFilteredFindings.length === 0}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] disabled:opacity-50"
          >
            {exporting === "pdf"
              ? "Exporting…"
              : `Export PDF${filtersActive ? ` (${sortedFilteredFindings.length})` : ""}`}
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--ink-primary)]">Findings</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={venueFilter}
                  onChange={(e) => setVenueFilter(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-primary)]"
                >
                  <option value={ALL}>All venues ({findings.length})</option>
                  {venueOptions.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.count})
                    </option>
                  ))}
                </select>
                <select
                  value={functionalAreaFilter}
                  onChange={(e) => setFunctionalAreaFilter(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-primary)]"
                >
                  <option value={ALL}>All functional areas</option>
                  {functionalAreaOptions.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.count})
                    </option>
                  ))}
                </select>
                <select
                  value={relevanceFilter}
                  onChange={(e) => setRelevanceFilter(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-primary)]"
                >
                  <option value={ALL}>All relevance</option>
                  {RELEVANCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level} ({byRelevance[level]})
                    </option>
                  ))}
                </select>
                <select
                  value={observerFilter}
                  onChange={(e) => setObserverFilter(e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-primary)]"
                >
                  <option value={ALL}>All observers</option>
                  {observerOptions.map((o) => (
                    <option key={o.name} value={o.name}>
                      {o.name === NOT_PROVIDED ? "Not provided" : o.name} ({o.count})
                    </option>
                  ))}
                </select>
                {filtersActive && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-[var(--accent)] underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                )}
                <label className="flex items-center gap-2 text-sm text-[var(--ink-secondary)]">
                  Sort by
                  <select
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-primary)]"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="h-[480px]">
              <FindingsList
                title={filtersActive ? "Filtered findings" : "All findings"}
                findings={sortedFilteredFindings}
                onSelectFinding={setSelectedFinding}
                onDeleteFinding={handleDelete}
                showVenue={venueFilter === ALL}
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
