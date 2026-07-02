"use client";

// L5-T1, Feed "Shipped", preuve d'execution.
// Affiche les derniers commits GitHub du repo adama-os. Les donnees sont
// chargees cote serveur (lib/github.ts, cache 5 min) et passees en props :
// aucun appel API depuis le navigateur, aucun secret expose.

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adama/ui";
import { GITHUB_REPO_URL, type CommitRow } from "./types";

// Format manuel deterministe (UTC) : le serveur et le client produisent
// exactement la meme chaine, donc zero risque d'erreur d'hydratation
// (regle du projet, cf. bug useReducedMotion du 2 juillet).
function formatDate(iso: string): string {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())} UTC`;
}

// Coupe un titre conventionnel "type(scope): sujet" pour colorer le type.
function splitMessage(message: string): { prefix: string | null; rest: string } {
  const match = /^(feat|fix|chore|docs|refactor|perf|test|style|ci|build)(\([^)]*\))?!?:/.exec(
    message,
  );
  if (!match) {
    return { prefix: null, rest: message };
  }
  return {
    prefix: message.slice(0, match[0].length),
    rest: message.slice(match[0].length).trim(),
  };
}

function CommitLine({ commit }: { commit: CommitRow }) {
  const { prefix, rest } = splitMessage(commit.message);
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-baseline gap-3 rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-2 transition-colors duration-150 hover:border-border-strong"
    >
      <span className="shrink-0 font-mono text-[0.65rem] tabular-nums text-emerald">
        {commit.sha}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-muted transition-colors duration-150 group-hover:text-foreground">
        {prefix ? (
          <span className="text-emerald-bright">{prefix} </span>
        ) : null}
        {rest}
      </span>
      <span className="hidden shrink-0 font-mono text-[0.6rem] tabular-nums text-faint sm:inline">
        {formatDate(commit.date)}
      </span>
    </a>
  );
}

export function ShippedFeed({ commits }: { commits: CommitRow[] }) {
  return (
    <Card id="shipped" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Shipped · Proof of Work</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>
            live
          </Badge>
          <Badge variant="default">GitHub</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 font-mono text-xs text-muted">
          <span className="text-emerald">$</span> git log --oneline
          <span className="text-faint"> · derniers commits du monorepo, en direct</span>
        </p>
        {commits.length > 0 ? (
          <div className="space-y-2">
            {commits.map((c) => (
              <CommitLine key={c.sha} commit={c} />
            ))}
          </div>
        ) : (
          <p className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-4 font-mono text-sm text-faint">
            feed hors ligne : GitHub injoignable, retente dans quelques minutes
          </p>
        )}
      </CardContent>
      <CardFooter>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="sm" tabIndex={-1}>
            Voir le repo
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
