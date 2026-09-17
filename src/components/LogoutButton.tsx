"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Sign out
    </button>
  );
}
