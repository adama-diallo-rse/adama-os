import { createHash, randomUUID } from "node:crypto";
import { logger, schedules } from "@trigger.dev/sdk";
import { fetchSourceItems, SOURCES } from "../lib/veille/sources";
import { slugify, synthesize, toPortableText } from "../lib/veille/synthesize";
import { getWriteClient } from "../sanity/lib/writeClient";

// L5-T3 / L5-T4 — Scan planifié EFRAG + GHG Protocol.
// Pour chaque source : seed le document source, récupère les items, écarte ceux
// déjà connus (nouveauté par externalId), synthétise les nouveaux avec OpenAI et
// crée un BROUILLON Sanity. Adama relit et publie en 1 clic dans /studio.
// Le résultat est idempotent : relancer le job ne recrée pas les articles vus.

const key = () => randomUUID().slice(0, 12);

/** Slug lisible et unique : titre + empreinte courte de l'externalId. */
function stableSlug(title: string, externalId: string): string {
  const base = slugify(title) || "article";
  const hash = createHash("sha1").update(externalId).digest("hex").slice(0, 6);
  return `${base}-${hash}`.slice(0, 96);
}

export const veilleScan = schedules.task({
  id: "veille-scan",
  // Chaque lundi 06:00 UTC. Ajustable ici (déclaratif, versionné en Git).
  cron: "0 6 * * 1",
  maxDuration: 600,
  run: async () => {
    const client = getWriteClient();
    let created = 0;

    for (const source of SOURCES) {
      // 1. Document source (idempotent).
      await client.createIfNotExists({
        _id: `source.${source.id}`,
        _type: "source",
        title: source.name,
        url: source.listUrl,
        kind: source.kind,
      });

      // 2. Items candidats.
      let items;
      try {
        items = await fetchSourceItems(source);
      } catch (err) {
        logger.error("Fetch source échoué", { source: source.name, error: String(err) });
        continue;
      }
      if (items.length === 0) continue;

      // 3. Nouveauté : on écarte les externalId déjà présents (brouillon OU publié).
      const ids = items.map((i) => i.externalId);
      const existing = await client.fetch<string[]>(
        `*[_type == "veilleArticle" && externalId in $ids].externalId`,
        { ids },
      );
      const known = new Set(existing);
      const fresh = items.filter((i) => !known.has(i.externalId));
      logger.info("Items à traiter", {
        source: source.name,
        total: items.length,
        nouveaux: fresh.length,
      });

      // 4. Synthèse + brouillon pour chaque nouvel item.
      for (const item of fresh) {
        try {
          const synth = await synthesize({
            title: item.title,
            url: item.url,
            sourceName: source.name,
          });

          // Upsert des tags (idempotent, _id déterministe).
          const tagRefs: { _type: "reference"; _key: string; _ref: string }[] = [];
          for (const label of synth.tags) {
            const slug = slugify(label);
            if (!slug) continue;
            const id = `tag.${slug}`;
            await client.createIfNotExists({
              _id: id,
              _type: "tag",
              title: label,
              slug: { _type: "slug", current: slug },
            });
            tagRefs.push({ _type: "reference", _key: key(), _ref: id });
          }

          await client.create({
            _id: `drafts.${randomUUID()}`,
            _type: "veilleArticle",
            title: synth.title,
            slug: { _type: "slug", current: stableSlug(synth.title, item.externalId) },
            summary: synth.summary,
            body: toPortableText(synth.paragraphs),
            source: { _type: "reference", _ref: `source.${source.id}` },
            tags: tagRefs,
            originalUrl: item.url,
            externalId: item.externalId,
            publishedAt: new Date().toISOString(),
          });

          created += 1;
          logger.info("Brouillon créé", { title: synth.title, source: source.name });
        } catch (err) {
          logger.error("Synthèse item échouée", { url: item.url, error: String(err) });
        }
      }
    }

    return { created };
  },
});
