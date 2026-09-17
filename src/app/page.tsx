import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[var(--page)]">
      <header className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          Nagoya 2026 Asian Games
        </p>
        <h1 className="text-xl font-semibold text-[var(--ink-primary)]">Observation Platform</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        <div>
          <p className="text-base text-[var(--ink-secondary)]">
            Log an observation from the field. It only takes a minute.
          </p>
        </div>

        <Link
          href="/new"
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-5 text-lg font-semibold text-white shadow-sm active:scale-[0.98]"
        >
          <span className="text-2xl leading-none">+</span> Add New Finding
        </Link>

        <Link
          href="/dashboard"
          className="text-sm font-medium text-[var(--accent)] underline underline-offset-4"
        >
          View reporting dashboard →
        </Link>
      </div>

      <footer className="flex items-center justify-center border-t border-[var(--border)] px-5 py-3">
        <LogoutButton className="text-xs text-[var(--ink-muted)] underline underline-offset-4" />
      </footer>
    </main>
  );
}
