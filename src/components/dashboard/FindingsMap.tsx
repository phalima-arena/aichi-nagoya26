"use client";

import { useMemo, useState } from "react";
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { Finding, Relevance } from "@/lib/types";
import { RELEVANCE_COLORS } from "@/lib/colors";

const RELEVANCE_RANK: Record<Relevance, number> = { High: 3, Medium: 2, Low: 1 };

interface VenueGroup {
  venue: string;
  lat: number;
  lng: number;
  findings: Finding[];
  dominant: Relevance;
}

const DEFAULT_CENTER = { lat: 35.1815, lng: 136.9066 };

function groupByVenue(findings: Finding[]): VenueGroup[] {
  const map = new Map<string, VenueGroup>();
  for (const f of findings) {
    if (f.lat == null || f.lng == null) continue;
    const existing = map.get(f.venue);
    if (existing) {
      existing.findings.push(f);
      if (RELEVANCE_RANK[f.relevance] > RELEVANCE_RANK[existing.dominant]) {
        existing.dominant = f.relevance;
      }
    } else {
      map.set(f.venue, { venue: f.venue, lat: f.lat, lng: f.lng, findings: [f], dominant: f.relevance });
    }
  }
  return Array.from(map.values());
}

export function FindingsMap({
  findings,
  onSelectVenue,
}: {
  findings: Finding[];
  onSelectVenue: (venue: string) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <p className="text-sm font-medium text-[var(--ink-primary)]">Map unavailable</p>
        <p className="text-xs text-[var(--ink-muted)]">
          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the venue map.
        </p>
      </div>
    );
  }

  return <LoadedMap apiKey={apiKey} findings={findings} onSelectVenue={onSelectVenue} />;
}

// Split out so useJsApiLoader (and its script-load attempt) only ever runs
// once we actually have a key — otherwise it retries a failing load forever.
function LoadedMap({
  apiKey,
  findings,
  onSelectVenue,
}: {
  apiKey: string;
  findings: Finding[];
  onSelectVenue: (venue: string) => void;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "nagoya-observation-map",
  });
  const [hovered, setHovered] = useState<VenueGroup | null>(null);

  const groups = useMemo<VenueGroup[]>(() => groupByVenue(findings), [findings]);

  if (!isLoaded) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-[var(--ink-muted)]">
        Loading map…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-2">
      <GoogleMap
        mapContainerClassName="h-full min-h-[280px] w-full rounded-xl"
        center={groups[0] ?? DEFAULT_CENTER}
        zoom={groups.length > 0 ? 8 : 6}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        {groups.map((g) => (
          <Marker
            key={g.venue}
            position={{ lat: g.lat, lng: g.lng }}
            onClick={() => onSelectVenue(g.venue)}
            onMouseOver={() => setHovered(g)}
            onMouseOut={() => setHovered(null)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: RELEVANCE_COLORS[g.dominant],
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8 + Math.min(g.findings.length, 8),
            }}
          />
        ))}
        {hovered && (
          <InfoWindow position={{ lat: hovered.lat, lng: hovered.lng }} onCloseClick={() => setHovered(null)}>
            <div style={{ fontSize: 12, maxWidth: 200 }}>
              <strong>{hovered.venue}</strong>
              <div>
                {hovered.findings.length} finding{hovered.findings.length === 1 ? "" : "s"}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 px-1 text-xs text-[var(--ink-secondary)]">
      {(Object.entries(RELEVANCE_COLORS) as [Relevance, string][]).map(([level, color]) => (
        <span key={level} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {level}
        </span>
      ))}
      <span className="text-[var(--ink-muted)]">Pin size = number of findings</span>
    </div>
  );
}
