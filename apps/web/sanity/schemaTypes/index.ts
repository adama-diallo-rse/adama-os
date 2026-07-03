import type { SchemaTypeDefinition } from "sanity";
import { sourceType } from "./source";
import { tagType } from "./tag";
import { veilleArticleType } from "./veilleArticle";

// L5-T2 — Registre des types de contenu du Studio.
export const schemaTypes: SchemaTypeDefinition[] = [
  veilleArticleType,
  sourceType,
  tagType,
];
