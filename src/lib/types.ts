export type Relevance = "High" | "Medium" | "Low";

export const RELEVANCE_LEVELS: Relevance[] = ["High", "Medium", "Low"];

export interface Finding {
  id: string;
  finding_number: string;
  photo_url: string | null;
  occurred_at: string;
  venue: string;
  functional_area: string;
  description: string;
  relevance: Relevance;
  observer_name: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export type NewFinding = Pick<
  Finding,
  | "photo_url"
  | "occurred_at"
  | "venue"
  | "functional_area"
  | "description"
  | "relevance"
  | "observer_name"
  | "lat"
  | "lng"
>;
