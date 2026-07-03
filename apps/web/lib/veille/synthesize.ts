import { randomUUID } from "node:crypto";

// L5-T4 — Synthèse d'un item de veille par OpenAI (gpt-4o).
// Appel REST direct, sans dépendance : même parti pris que lib/ai/embeddings.ts.
// Pas d'import "server-only" ici : ce module tourne aussi dans le bundler
// Trigger.dev (Node), où "server-only" lèverait à l'import.

const MODEL = process.env.ADAMA_AI_MODEL ?? "gpt-4o";

export type SynthesisInput = {
  /** Titre brut récupéré sur la source. */
  title: string;
  /** URL d'origine de la publication. */
  url: string;
  /** Contexte optionnel (extrait de la page) pour ancrer la synthèse. */
  context?: string;
  /** Nom de la source (EFRAG, GHG Protocol...). */
  sourceName: string;
};

export type SynthesisResult = {
  /** Titre reformulé en français, clair et informatif. */
  title: string;
  /** Résumé 2-3 phrases (chapô + meta description). */
  summary: string;
  /** Corps rédigé, un élément par paragraphe. */
  paragraphs: string[];
  /** Thèmes proposés (2 à 5), ex: "CSRD", "ESRS E1", "Taxonomie UE". */
  tags: string[];
};

const SYSTEM_PROMPT = `Tu es l'assistant de veille réglementaire d'Adama Diallo, spécialiste du reporting de durabilité (CSRD, ESRS, VSME, taxonomie UE, GHG Protocol).
On te fournit une actualité issue d'une source officielle. Rédige une synthèse en français, factuelle, concise et professionnelle, destinée à des PME européennes et à leurs conseils.
Réponds STRICTEMENT en JSON avec ce schéma :
{
  "title": "titre reformulé en français, informatif, sans point final",
  "summary": "2 à 3 phrases résumant l'essentiel et l'enjeu pour les PME",
  "paragraphs": ["paragraphe 1", "paragraphe 2", "..."],
  "tags": ["Thème1", "Thème2"]
}
Contraintes : 3 à 5 paragraphes, aucune invention (si l'info est mince, reste factuel et signale-le), pas de markdown dans les chaînes, 2 à 5 tags courts.`;

/** Appelle OpenAI et renvoie une synthèse structurée. */
export async function synthesize(
  input: SynthesisInput,
): Promise<SynthesisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant côté serveur.");
  }

  const userPrompt = [
    `Source : ${input.sourceName}`,
    `Titre d'origine : ${input.title}`,
    `Lien : ${input.url}`,
    input.context ? `Extrait de la page :\n${input.context.slice(0, 4000)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI ${res.status} : ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = json.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Réponse OpenAI vide.");
  }

  const parsed = JSON.parse(content) as Partial<SynthesisResult>;
  const paragraphs = (parsed.paragraphs ?? []).filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0,
  );
  const tags = (parsed.tags ?? []).filter(
    (t): t is string => typeof t === "string" && t.trim().length > 0,
  );

  if (!parsed.title || !parsed.summary || paragraphs.length === 0) {
    throw new Error("Synthèse incomplète (titre, résumé ou corps manquant).");
  }

  return {
    title: parsed.title.trim(),
    summary: parsed.summary.trim(),
    paragraphs,
    tags,
  };
}

/** Convertit des paragraphes texte en blocs Portable Text (schéma Sanity). */
export function toPortableText(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: "block",
    _key: randomUUID().slice(0, 12),
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: randomUUID().slice(0, 12), text, marks: [] },
    ],
  }));
}

/** Slug ASCII stable (titres, tags). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
