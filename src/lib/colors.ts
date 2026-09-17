import type { Relevance } from "./types";

// Status palette (fixed, never themed) — High relevance reads as most
// urgent-to-address (critical), Low as least urgent (good).
export const RELEVANCE_COLORS: Record<Relevance, string> = {
  High: "#d03b3b",
  Medium: "#fab219",
  Low: "#0ca30c",
};

// Categorical slot 1 (blue) and slot 3 (aqua) from the validated palette,
// used as single-hue series for count-by-category bar charts.
export const CHART_HUES = {
  venue: "#2a78d6",
  functionalArea: "#1baf7a",
};

export const CHART_INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  baseline: "#c3c2b7",
  surface: "#fcfcfb",
};
