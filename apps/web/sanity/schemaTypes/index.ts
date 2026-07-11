import type { SchemaTypeDefinition } from "sanity";
import { courseType } from "./course";
import { sourceType } from "./source";
import { tagType } from "./tag";
import { veilleArticleType } from "./veilleArticle";

// L5-T2 / L5-T6 — Registre des types de contenu du Studio.
export const schemaTypes: SchemaTypeDefinition[] = [
  veilleArticleType,
  sourceType,
  tagType,
  courseType,
];
