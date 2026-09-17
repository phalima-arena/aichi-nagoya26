"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase, PHOTO_BUCKET } from "@/lib/supabaseClient";
import { VENUE_NAMES, getVenueCoords } from "@/lib/venues";
import { FUNCTIONAL_AREAS } from "@/lib/functionalAreas";
import { RELEVANCE_LEVELS, type Relevance } from "@/lib/types";
import { toLocalDatetimeInputValue } from "@/lib/datetime";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function NewFindingPage() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [occurredAt, setOccurredAt] = useState(() => toLocalDatetimeInputValue(new Date()));
  const [venue, setVenue] = useState("");
  const [functionalArea, setFunctionalArea] = useState("");
  const [description, setDescription] = useState("");
  const [relevance, setRelevance] = useState<Relevance | "">("");
  const [observerName, setObserverName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNumber, setSuccessNumber] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const sortedVenues = useMemo(() => VENUE_NAMES, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photo is too large (max 10MB). Please choose a smaller image.");
      return;
    }
    setError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setOccurredAt(toLocalDatetimeInputValue(new Date()));
    setVenue("");
    setFunctionalArea("");
    setDescription("");
    setRelevance("");
    setObserverName("");
    setError(null);
    setSuccessNumber(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!venue || !functionalArea || !description.trim() || !relevance) {
      setError("Please fill in venue, functional area, findings, and relevance.");
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, photoFile, { contentType: photoFile.type || "image/jpeg" });
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
        const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
        photoUrl = data.publicUrl;
      }

      const coords = getVenueCoords(venue);

      const { data: inserted, error: insertError } = await supabase
        .from("findings")
        .insert({
          photo_url: photoUrl,
          occurred_at: new Date(occurredAt).toISOString(),
          venue,
          functional_area: functionalArea,
          description: description.trim(),
          relevance,
          observer_name: observerName.trim() || null,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        })
        .select("finding_number")
        .single();

      if (insertError) throw new Error(insertError.message);

      setSuccessNumber(inserted.finding_number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successNumber) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--page)] px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--good)]/15 text-3xl">
          ✓
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--ink-primary)]">Finding logged</h1>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">Reference number</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[var(--accent)]">{successNumber}</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={resetForm}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white"
          >
            Log another finding
          </button>
          <Link
            href="/"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center font-medium text-[var(--ink-primary)]"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-[var(--page)]">
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
        <Link href="/" className="text-[var(--ink-muted)]" aria-label="Back">
          ←
        </Link>
        <h1 className="text-base font-semibold text-[var(--ink-primary)]">Add New Finding</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-5 py-6">
        <Field label="1. Photo (optional)">
          {photoPreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Selected finding" className="w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--ink-primary)]"
              >
                📷 Take Photo
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--ink-primary)]"
              >
                🖼️ Camera Roll
              </button>
            </div>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </Field>

        <Field label="2. Date & time">
          <input
            type="datetime-local"
            required
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="3. Venue">
          <select required value={venue} onChange={(e) => setVenue(e.target.value)} className="input">
            <option value="" disabled>
              Select a venue…
            </option>
            {sortedVenues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>

        <Field label="4. Functional Area">
          <select
            required
            value={functionalArea}
            onChange={(e) => setFunctionalArea(e.target.value)}
            className="input"
          >
            <option value="" disabled>
              Select a functional area…
            </option>
            {FUNCTIONAL_AREAS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>

        <Field label="5. Findings">
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you observed…"
            className="input resize-none"
          />
        </Field>

        <Field label="6. Relevance to 2030 planning">
          <div className="flex gap-3">
            {RELEVANCE_LEVELS.map((level) => (
              <label
                key={level}
                className={`flex-1 cursor-pointer rounded-xl border py-3 text-center text-sm font-medium ${
                  relevance === level
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--ink-primary)]"
                }`}
              >
                <input
                  type="radio"
                  name="relevance"
                  value={level}
                  checked={relevance === level}
                  onChange={() => setRelevance(level)}
                  className="sr-only"
                />
                {level}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Observer name (optional)">
          <input
            type="text"
            value={observerName}
            onChange={(e) => setObserverName(e.target.value)}
            placeholder="Your name"
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-[var(--critical)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-[var(--accent)] px-4 py-3.5 text-base font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Finding"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 0.75rem 0.9rem;
          font-size: 1rem;
          color: var(--ink-primary);
          outline: none;
        }
        .input:focus {
          border-color: var(--accent);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--ink-secondary)]">{label}</label>
      {children}
    </div>
  );
}
