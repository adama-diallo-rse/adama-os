"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@adama/ui";

type CourseChoice = { level: number; title: string };

// L5-T8 — Formulaire de déblocage. L'acheteur saisit l'email utilisé au paiement
// et choisit son niveau ; le serveur vérifie le droit et pose le cookie signé.
export function AccessForm({ courses }: { courses: CourseChoice[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const first = courses[0]?.level ?? 1;
  const [level, setLevel] = useState<number>(first);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/learn/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, level }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Vérification impossible.");
        return;
      }
      setStatus("ok");
      setMessage("Accès débloqué. Redirection…");
      router.refresh();
      setTimeout(() => router.push("/learn"), 700);
    } catch {
      setStatus("error");
      setMessage("Erreur réseau. Réessaie dans un instant.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint"
        >
          Email d&apos;achat
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@entreprise.fr"
          className="w-full rounded-[calc(var(--radius)_-_0.25rem)] border border-border-strong bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-faint focus:border-emerald"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="level"
          className="block font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint"
        >
          Formation
        </label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full rounded-[calc(var(--radius)_-_0.25rem)] border border-border-strong bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-emerald"
        >
          {courses.map((c) => (
            <option key={c.level} value={c.level}>
              Niveau {c.level} — {c.title}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={status === "loading"} bracket>
        {status === "loading" ? "Vérification…" : "Débloquer l'accès"}
      </Button>

      {message ? (
        <p
          className={
            status === "error"
              ? "font-mono text-xs text-danger"
              : "font-mono text-xs text-emerald"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
