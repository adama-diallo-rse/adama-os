"use client";

// L4-T12, prototype VSME interactif. Recadré par la couche C1-T6.
//
// Ce qui a changé, et pourquoi. Le composant affichait « Score ESG, 74 / 100 »
// avec une mention « Exemplaire », c'est à dire exactement la forme d'un
// résultat d'évaluation. Il n'en est pas un : c'est une fonction de calcul
// écrite ici, sur des données saisies par le visiteur, sans référentiel opposé
// et sans audit. Un lecteur pressé n'avait aucun moyen de le savoir.
//
// Il est donc présenté pour ce qu'il est : un prototype de traitement. Entrée,
// transformation, sortie, avec les règles appliquées visibles à l'écran. La
// logique de calcul n'a pas bougé d'une ligne, seuls le cadrage et la
// restitution ont changé.
//
// Saisie de quelques indicateurs du Module de Base VSME (norme volontaire
// EFRAG pour PME) répartis en trois piliers E / S / G. Aucun appel réseau :
// le calcul est une fonction pure, ce qui rend le prototype robuste et
// immédiat.
//
// Note hydratation : composant entièrement contrôlé avec un état initial fixe.
// Le serveur et le client rendent le même markup au premier rendu. Les seules
// animations (jauge, barres) sont des transitions CSS, jamais branchées sur
// useReducedMotion au rendu (règle du projet).

import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adama/ui";

type Pillar = "E" | "S" | "G";

type FieldSlider = {
  id: string;
  label: string;
  kind: "slider";
  weight: number;
  suffix?: string;
};
type FieldToggle = {
  id: string;
  label: string;
  kind: "toggle";
  weight: number;
};
type Field = FieldSlider | FieldToggle;

type PillarSpec = {
  key: Pillar;
  label: string;
  weight: number; // poids du pilier dans le score global
  fields: Field[];
};

// Modèle inspiré des points de données du Module de Base VSME.
// Chaque pilier normalise ses champs à 0-100 (somme des poids = 100).
const MODEL: PillarSpec[] = [
  {
    key: "E",
    label: "Environnement",
    weight: 0.4,
    fields: [
      {
        id: "energie_renouvelable",
        label: "Part d'énergie renouvelable",
        kind: "slider",
        weight: 30,
        suffix: "%",
      },
      {
        id: "ges_mesures",
        label: "Émissions GES mesurées (Scopes 1-2)",
        kind: "toggle",
        weight: 25,
      },
      {
        id: "plan_reduction",
        label: "Plan de réduction carbone",
        kind: "toggle",
        weight: 20,
      },
      {
        id: "dechets_valorises",
        label: "Déchets triés et valorisés",
        kind: "slider",
        weight: 15,
        suffix: "%",
      },
      {
        id: "suivi_eau",
        label: "Suivi de la consommation d'eau",
        kind: "toggle",
        weight: 10,
      },
    ],
  },
  {
    key: "S",
    label: "Social",
    weight: 0.35,
    fields: [
      {
        id: "part_cdi",
        label: "Part de contrats stables (CDI)",
        kind: "slider",
        weight: 20,
        suffix: "%",
      },
      {
        id: "egalite_hf",
        label: "Indice d'égalité salariale H/F",
        kind: "slider",
        weight: 20,
        suffix: "/100",
      },
      {
        id: "formation",
        label: "Effort de formation des salariés",
        kind: "slider",
        weight: 20,
        suffix: "%",
      },
      {
        id: "sante_securite",
        label: "Politique santé-sécurité formalisée",
        kind: "toggle",
        weight: 20,
      },
      {
        id: "accidents_faibles",
        label: "Taux d'accidents faible ou nul",
        kind: "toggle",
        weight: 20,
      },
    ],
  },
  {
    key: "G",
    label: "Gouvernance",
    weight: 0.25,
    fields: [
      {
        id: "code_ethique",
        label: "Code d'éthique et anticorruption",
        kind: "toggle",
        weight: 30,
      },
      {
        id: "rgpd",
        label: "Conformité RGPD / protection des données",
        kind: "toggle",
        weight: 25,
      },
      {
        id: "achats_responsables",
        label: "Part d'achats responsables",
        kind: "slider",
        weight: 20,
        suffix: "%",
      },
      {
        id: "instance_esg",
        label: "Instance de pilotage ESG",
        kind: "toggle",
        weight: 15,
      },
      {
        id: "reporting_public",
        label: "Reporting extra-financier public",
        kind: "toggle",
        weight: 10,
      },
    ],
  },
];

const PILLAR_ACCENT: Record<Pillar, string> = {
  E: "text-emerald-bright",
  S: "text-emerald-bright",
  G: "text-emerald-bright",
};

// Valeurs par défaut : point de départ crédible d'une PME qui débute.
function defaultState(): Record<string, number> {
  return {
    energie_renouvelable: 30,
    ges_mesures: 0,
    plan_reduction: 0,
    dechets_valorises: 45,
    suivi_eau: 1,
    part_cdi: 70,
    egalite_hf: 75,
    formation: 40,
    sante_securite: 1,
    accidents_faibles: 1,
    code_ethique: 0,
    rgpd: 1,
    achats_responsables: 25,
    instance_esg: 0,
    reporting_public: 0,
  };
}

/** Score d'un champ, normalisé 0-1. */
function fieldScore01(field: Field, raw: number): number {
  if (field.kind === "toggle") {
    return raw > 0 ? 1 : 0;
  }
  return Math.max(0, Math.min(100, raw)) / 100;
}

/** Score d'un pilier 0-100 (somme pondérée des champs). */
function pillarScore(spec: PillarSpec, values: Record<string, number>): number {
  let total = 0;
  let weights = 0;
  for (const field of spec.fields) {
    weights += field.weight;
    total += field.weight * fieldScore01(field, values[field.id] ?? 0);
  }
  return weights > 0 ? (total / weights) * 100 : 0;
}

type Rating = { label: string; variant: "default" | "emerald" | "warning" };

// C1-T6, restitution. Les seuils n'ont pas bougé, les libellés si. « Exemplaire »
// est un jugement de valeur, et ce prototype n'est pas en position d'en porter
// un : il décrit la complétude de ce que le visiteur vient de déclarer, rien
// d'autre.
function rating(score: number): Rating {
  if (score >= 80)
    return { label: "Déclaration très complète", variant: "emerald" };
  if (score >= 60) return { label: "Déclaration avancée", variant: "emerald" };
  if (score >= 40)
    return { label: "Déclaration partielle", variant: "warning" };
  return { label: "Déclaration au démarrage", variant: "default" };
}

// Les règles réellement appliquées par le code ci-dessus, écrites en clair.
// Elles sont affichées à l'écran : un traitement dont on ne peut pas lire les
// règles n'est pas vérifiable, il est seulement joli.
const REGLES = [
  {
    etape: "Entrée",
    texte:
      "15 déclarations saisies par vous, 8 curseurs de 0 à 100 et 7 réponses oui ou non. Rien n’est envoyé, rien n’est enregistré.",
  },
  {
    etape: "Transformation",
    texte:
      "Chaque déclaration est ramenée entre 0 et 1, un oui vaut 1 et un non vaut 0. Chaque pilier fait la moyenne pondérée de ses déclarations.",
  },
  {
    etape: "Sortie",
    texte:
      "Les trois piliers sont combinés avec les poids E 40, S 35 et G 25. Le résultat est un indice de complétude de la déclaration, pas une note de performance.",
  },
];

function Gauge({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-surface-raised)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-emerald)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
          style={{
            filter:
              "drop-shadow(0 0 6px color-mix(in oklch, var(--color-emerald) 55%, transparent))",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-semibold tabular-nums text-emerald-bright">
          {Math.round(score)}
        </span>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-faint">
          indice / 100
        </span>
      </div>
    </div>
  );
}

function PillarBar({
  label,
  score,
  accent,
}: {
  label: string;
  score: number;
  accent: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
          {label}
        </span>
        <span className={`font-mono text-xs tabular-nums ${accent}`}>
          {Math.round(score)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-border bg-surface-raised">
        <div
          className="h-full rounded-full bg-emerald transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex items-center justify-between gap-3 rounded-[calc(var(--radius)_-_0.125rem)] border px-3 py-2 text-left font-mono text-xs transition-colors ${
        active
          ? "border-emerald bg-[color-mix(in_oklch,var(--color-emerald)_12%,transparent)] text-emerald-bright"
          : "border-border bg-surface-raised text-muted hover:border-border-strong"
      }`}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] ${
          active ? "bg-emerald/20 text-emerald-bright" : "text-faint"
        }`}
      >
        {active ? "oui" : "non"}
      </span>
    </button>
  );
}

function SliderField({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs text-muted">{label}</span>
        <span className="font-mono text-xs tabular-nums text-emerald-bright">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-emerald"
      />
    </label>
  );
}

export function VsmeSimulator() {
  const [values, setValues] = useState<Record<string, number>>(defaultState);

  const set = (id: string, v: number) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const { pillars, overall } = useMemo(() => {
    const pillars = MODEL.map((spec) => ({
      key: spec.key,
      label: spec.label,
      weight: spec.weight,
      score: pillarScore(spec, values),
    }));
    const overall = pillars.reduce((acc, p) => acc + p.weight * p.score, 0);
    return { pillars, overall };
  }, [values]);

  const badge = rating(overall);

  return (
    <Card id="simulateur" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>
          Prototype VSME, traitement d&apos;un questionnaire
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="emerald">Prototype interactif</Badge>
          <Badge variant="default">Module de Base</Badge>
          <Badge variant="warning">Ni évaluation, ni certification</Badge>
        </div>
      </CardHeader>

      <CardContent className="border-b border-border pb-4 pt-0">
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Exemple de traitement d&apos;un questionnaire selon une logique
          inspirée du Module de Base VSME. Vous saisissez des déclarations, le
          prototype leur applique des règles écrites ci-dessous et restitue une
          sortie.{" "}
          <strong className="text-foreground">
            Ce n&apos;est ni une évaluation, ni une certification, ni un avis
            sur la conformité
          </strong>{" "}
          d&apos;une organisation : aucune pièce n&apos;est demandée, aucune
          déclaration n&apos;est vérifiée, aucun référentiel n&apos;est opposé.
        </p>
      </CardContent>

      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Saisie, 3 piliers */}
        <div className="order-2 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:order-1">
          {MODEL.map((spec) => (
            <div key={spec.key}>
              <p className="mb-2.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
                {spec.key} · {spec.label}
              </p>
              <div className="space-y-2">
                {spec.fields.map((field) =>
                  field.kind === "toggle" ? (
                    <ToggleField
                      key={field.id}
                      label={field.label}
                      active={(values[field.id] ?? 0) > 0}
                      onToggle={() =>
                        set(field.id, (values[field.id] ?? 0) > 0 ? 0 : 1)
                      }
                    />
                  ) : (
                    <SliderField
                      key={field.id}
                      label={field.label}
                      value={values[field.id] ?? 0}
                      suffix={field.suffix}
                      onChange={(v) => set(field.id, v)}
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Résultat instantané */}
        <div className="order-1 lg:order-2">
          <div className="rounded-[var(--radius)] border border-border bg-surface-raised p-4">
            <div className="flex items-center gap-4">
              <Gauge score={overall} />
              <div className="min-w-0 space-y-1.5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
                  Sortie du traitement
                </p>
                <Badge variant={badge.variant} dot>
                  {badge.label}
                </Badge>
                <p className="font-mono text-[0.65rem] leading-relaxed text-muted">
                  Indice de complétude déclarative
                  <br />
                  Pondération E 40 · S 35 · G 25
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {pillars.map((p) => (
                <PillarBar
                  key={p.key}
                  label={`${p.key} · ${p.label}`}
                  score={p.score}
                  accent={PILLAR_ACCENT[p.key]}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardContent className="border-t border-border pt-4">
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
          Les règles appliquées
        </p>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {REGLES.map((regle, i) => (
            <li
              key={regle.etape}
              className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-3"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-emerald">
                {`0${i + 1}`} · {regle.etape}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {regle.texte}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>

      <CardFooter>
        <p className="font-mono text-[0.65rem] leading-relaxed text-faint">
          <span className="text-emerald">$</span> sortie d&apos;un prototype de
          traitement, calculée dans votre navigateur à partir de vos seules
          déclarations. Sans valeur d&apos;évaluation, de notation ni
          d&apos;audit.
        </p>
      </CardFooter>
    </Card>
  );
}
