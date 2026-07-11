import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// L5-T6 — Chargement du contenu MDX d'une leçon depuis content/learn/.
// Lu au runtime serveur (Server Component), jamais côté client. Renvoie null si
// le fichier n'existe pas → la page leçon retombe sur un état neutre au lieu de
// casser. La clé provient du catalogue (mdxKey), jamais d'une entrée utilisateur
// directe, mais on la nettoie tout de même par précaution (pas de traversée).
const CONTENT_DIR = join(process.cwd(), "content", "learn");

function safeKey(mdxKey: string): string | null {
  return /^[a-z0-9-]+$/i.test(mdxKey) ? mdxKey : null;
}

/** Source MDX brute d'une leçon, ou null si introuvable / clé invalide. */
export async function loadLessonSource(mdxKey: string): Promise<string | null> {
  const key = safeKey(mdxKey);
  if (!key) return null;
  try {
    return await readFile(join(CONTENT_DIR, `${key}.mdx`), "utf8");
  } catch {
    return null;
  }
}
