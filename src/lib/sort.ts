import type { Finding, Relevance } from "./types";

type SortField = "occurred_at" | "finding_number" | "venue" | "functional_area" | "relevance" | "observer_name";

const RELEVANCE_RANK: Record<Relevance, number> = { High: 3, Medium: 2, Low: 1 };

export interface SortOption {
  value: string;
  label: string;
  field: SortField;
  dir: "asc" | "desc";
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "occurred_at:desc", label: "Date & Time (Newest first)", field: "occurred_at", dir: "desc" },
  { value: "occurred_at:asc", label: "Date & Time (Oldest first)", field: "occurred_at", dir: "asc" },
  { value: "finding_number:asc", label: "Finding ID (A–Z)", field: "finding_number", dir: "asc" },
  { value: "finding_number:desc", label: "Finding ID (Z–A)", field: "finding_number", dir: "desc" },
  { value: "venue:asc", label: "Venue (A–Z)", field: "venue", dir: "asc" },
  { value: "venue:desc", label: "Venue (Z–A)", field: "venue", dir: "desc" },
  { value: "functional_area:asc", label: "Functional Area (A–Z)", field: "functional_area", dir: "asc" },
  { value: "functional_area:desc", label: "Functional Area (Z–A)", field: "functional_area", dir: "desc" },
  { value: "relevance:desc", label: "Relevance (High → Low)", field: "relevance", dir: "desc" },
  { value: "relevance:asc", label: "Relevance (Low → High)", field: "relevance", dir: "asc" },
  { value: "observer_name:asc", label: "Observer Name (A–Z)", field: "observer_name", dir: "asc" },
  { value: "observer_name:desc", label: "Observer Name (Z–A)", field: "observer_name", dir: "desc" },
];

export const DEFAULT_SORT = SORT_OPTIONS[0].value;

function compareFindings(a: Finding, b: Finding, field: SortField): number {
  switch (field) {
    case "occurred_at":
      return new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime();
    case "finding_number":
      return a.finding_number.localeCompare(b.finding_number);
    case "venue":
      return a.venue.localeCompare(b.venue);
    case "functional_area":
      return a.functional_area.localeCompare(b.functional_area);
    case "relevance":
      return RELEVANCE_RANK[a.relevance] - RELEVANCE_RANK[b.relevance];
    case "observer_name":
      return (a.observer_name ?? "").localeCompare(b.observer_name ?? "");
  }
}

export function sortFindings(findings: Finding[], sortValue: string): Finding[] {
  const option = SORT_OPTIONS.find((o) => o.value === sortValue) ?? SORT_OPTIONS[0];
  const dirMul = option.dir === "asc" ? 1 : -1;
  return [...findings].sort((a, b) => compareFindings(a, b, option.field) * dirMul);
}
