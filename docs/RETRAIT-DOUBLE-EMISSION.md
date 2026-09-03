# Retrait de la double émission, échéance 30 septembre 2026

> Écrit le 2 septembre 2026 (couche C13-T3). **Non appliqué.** Le correctif
> est préparé maintenant pour que l'échéance ne soit pas ratée, ce qui est le
> sort habituel des dettes de compatibilité.

## Ce que c'est

Le périmètre du site est le groupe depuis le recentrage du 19 juillet 2026.
L'événement de sortie s'appelle donc `ecosystem_outbound`. L'ancien nom,
`strata_outbound`, continue d'être émis en parallèle pour ne pas trouer
l'historique des tableaux déjà construits.

La date de retrait est écrite dans le code, dans
`apps/web/lib/outbound.ts` :

```ts
export const LEGACY_OUTBOUND_REMOVAL_DATE = "2026-09-30";
```

## À vérifier avant d'appliquer

1. aucun tableau de bord ne pointe encore sur `strata_outbound` ;
2. aucun entonnoir de `docs/ENTONNOIRS.md` ne le cite ;
3. la série `ecosystem_outbound` couvre bien la période que les tableaux
   affichent.

## Le correctif

### 1. `apps/web/lib/outbound.ts`

```diff
-import { EVENT_OUTBOUND, EVENT_OUTBOUND_LEGACY } from "./analytics-events";
+import { EVENT_OUTBOUND } from "./analytics-events";

 export const OUTBOUND_EVENT = EVENT_OUTBOUND;
-export const LEGACY_OUTBOUND_EVENT = EVENT_OUTBOUND_LEGACY;
-
-/**
- * Date de retrait de la double émission.
- * ...
- */
-export const LEGACY_OUTBOUND_REMOVAL_DATE = "2026-09-30";
```

et la suppression de `legacyOutboundProperties`.

### 2. `apps/web/lib/analytics-events.ts`

Retirer `EVENT_OUTBOUND_LEGACY` et son entrée dans `EVENEMENTS`.

### 3. `apps/web/components/outbound-link.tsx` et `apps/web/components/terminal.tsx`

Retirer la seconde capture, dans les deux fichiers :

```diff
         captureEvent(OUTBOUND_EVENT, outboundProperties(ctx));
-        captureEvent(LEGACY_OUTBOUND_EVENT, legacyOutboundProperties(ctx));
```

### 4. `apps/web/tests/outbound.test.ts`

Retirer les cas qui vérifient la double émission, et **ajouter** celui qui
vérifie qu'elle n'a plus lieu : sans lui, un retour en arrière passerait
inaperçu.

## Après application

- relancer `pnpm --filter @adama/web test` ;
- relancer `pnpm inventory`, qui relève les noms d'événements réellement
  émis : `strata_outbound` doit avoir disparu de `docs/inventory.json` ;
- mettre à jour le tableau de `docs/ENTONNOIRS.md`.
