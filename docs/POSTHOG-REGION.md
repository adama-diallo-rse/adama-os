# Région de la mesure d'audience, l'arbitrage à rendre

> Écrit le 2 septembre 2026 (couche C11-T7). **Aucun des deux correctifs
> ci-dessous n'est appliqué.** Ils sont préparés, l'un et l'autre, pour que
> la décision se prenne sur des diffs réels et non sur une intention.

## La contradiction, en une phrase

`apps/web/lib/analytics.ts` et la page `/confidentialite` annoncent tous deux
un traitement **en Union européenne**. Le compte réellement disponible est
hébergé **aux États-Unis**.

Tant que la contradiction dure :

- aucune mesure n'est configurée, et `docs/ENTONNOIRS.md` le dit en tête ;
- la contradiction est **affichée** au registre des limites connues, sur
  `/systeme/pannes` et sur `/confiance` ;
- la matrice de santé passe la capacité « mesure d'audience » en DÉGRADÉ,
  avec la raison en clair.

Elle ne sera pas effacée. Elle sera tranchée dans un sens ou dans l'autre.

## Option A, basculer le compte en région européenne

Ce que ça coûte : créer une organisation dans la région européenne, y créer
un projet, récupérer une nouvelle clé, et **perdre l'historique** du projet
actuel. Le projet actuel étant vide, cette perte est nulle aujourd'hui, et
elle ne le sera plus dès la première semaine de collecte.

Gestes, dans cet ordre :

1. créer l'organisation en région européenne ;
2. y créer le projet, récupérer la clé publique ;
3. dans le tableau de bord d'hébergement, poser en Production :
   - `NEXT_PUBLIC_POSTHOG_KEY` = la nouvelle clé,
   - `NEXT_PUBLIC_POSTHOG_HOST` = `https://eu.i.posthog.com` ;
4. redéployer ;
5. vérifier que `/systeme/pannes` affiche la capacité en OPÉRATIONNEL ;
6. retirer l'entrée `region-analytique` de `apps/web/content/limites.ts`.

Aucune modification de code. C'est l'option qui tient la promesse déjà faite,
et c'est celle qui est recommandée.

## Option B, corriger la page pour dire la région réelle

Ce que ça coûte : la page de confidentialité annonce alors un transfert hors
Union européenne de plus, et le positionnement conformité du dossier en prend
un coup. Les clauses contractuelles types couvrent le transfert, donc rien
n'est irrégulier ; mais un lecteur qui vient pour la rigueur de la conformité
lira une promesse tenue de justesse plutôt qu'une promesse tenue.

### Diff 1, l'hôte par défaut

`apps/web/lib/analytics.ts`, dans `initPosthog` :

```diff
         posthog.init(key, {
           api_host:
             process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
-            "https://eu.i.posthog.com",
+            "https://us.i.posthog.com",
           capture_pageview: true,
           persistence: "localStorage",
         });
```

Et le commentaire de tête du fichier, première ligne :

```diff
-// L6-T3 / L8-T4, Analytics PostHog (région UE), gaté par le consentement.
+// L6-T3 / L8-T4, Analytics PostHog (région US), gaté par le consentement.
+// La région annoncée par /confidentialite doit rester celle-ci. Le contrôle
+// de la couche C3 compare les deux et passe la capacité en DÉGRADÉ si elles
+// divergent.
```

### Diff 2, la source unique des sous-traitants

`apps/web/lib/legal.ts`, entrée `analytique` de `SOUS_TRAITANTS` :

```diff
   {
     id: "analytique",
     nom: "PostHog",
     donnees: "mesure d’audience, après consentement uniquement",
-    region: "Union européenne",
+    region: "États-Unis, clauses contractuelles types",
   },
```

### Diff 3, la région annoncée dans le contrôle de santé

`apps/web/lib/health/collect.ts`, dans `observer` :

```diff
     analytique: {
       keyConfigured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()),
       region: regionAnalytique(
         process.env.NEXT_PUBLIC_POSTHOG_HOST,
         process.env.NEXT_PUBLIC_POSTHOG_KEY,
       ),
-      regionAnnoncee: "UE",
+      regionAnnoncee: "hors UE",
```

Cette troisième modification exige d'élargir le type `regionAnnoncee` dans
`apps/web/lib/health/observations.ts`, aujourd'hui figé à `"UE"`. Ce n'est pas
un détail d'implémentation : le type est étroit **exprès**, pour qu'on ne
puisse pas faire disparaître la contradiction en changeant discrètement ce que
le site prétend annoncer.

### Puis

Retirer l'entrée `region-analytique` de `apps/web/content/limites.ts`, et
mettre à jour la phrase de `/confidentialite` sur les transferts hors Union
européenne, qui en compte aujourd'hui deux et en comptera trois.

## Ce qui est recommandé

**L'option A.** Le coût est d'un quart d'heure et de zéro ligne de code, la
promesse est déjà écrite, et c'est la seule des deux qui ne dégrade pas ce
que le dossier vend. L'option B existe pour que le choix soit réel : si la
région européenne s'avérait indisponible pour une raison qu'on ignore, la
correction honnête est prête et elle prend cinq minutes.
