"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Incorrect passcode.");
        return;
      }
      router.replace(params.get("next") || "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--page)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">Nagoya 2026 Observation Platform</h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">
          Enter the shared access code to continue.
        </p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Access code"
          className="mt-4 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-base text-[var(--ink-primary)] outline-none focus:border-[var(--accent)]"
        />
        {error && <p className="mt-2 text-sm text-[var(--critical)]">{error}</p>}
        <button
          type="submit"
          disabled={loading || !passcode}
          className="mt-4 w-full rounded-lg bg-[var(--accent)] px-3 py-2.5 text-base font-medium text-white disabled:opacity-50"
        >
          {loading ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
