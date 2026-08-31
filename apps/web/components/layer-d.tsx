"use client";

// L4-T8 puis L4-T14, Couche D — Écosystème et Sandbox.
//
// Trois blocs, dans cet ordre d'importance pour un lecteur recruteur :
//   1. la preuve sociale (AG2R, Younivibe, AFEV, Ministère), qui reste la
//      pièce la plus forte de la page et ne doit jamais être noyée ;
//   2. les métriques produit relevées (ecosystem_analytics) ;
//   3. l'écosystème par division, lu depuis ecosystem_products.
//
// Règles tenues ici :
//   - aucun repli chiffré. Une métrique affichée est une métrique relevée,
//     sinon la carte affiche son état vide en toutes lettres ;
//   - un lien cliquable seulement pour un produit réellement ouvert, c'est
//     à dire portant une URL en base (contrainte SQL ecosystem_products) ;
//   - aucune date de disponibilité affichée.

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adama/ui";
import { AnimatedNumber } from "./animated-number";
import { OutboundLink } from "./outbound-link";
import { metricLabel, metricSuffix } from "../lib/metrics";
import {
  CV_DOWNLOAD_NAME,
  CV_PATH,
  type AnalyticsRow,
  type EcosystemProductRow,
  type EcosystemStatus,
  type GatewayStatusRow,
} from "./types";

const STATUT: Record<
  EcosystemStatus,
  { label: string; variant: "emerald" | "warning" | "default"; dot: boolean }
> = {
  live: { label: "En ligne", variant: "emerald", dot: true },
  building: { label: "En construction", variant: "warning", dot: false },
  planned: { label: "En réflexion", variant: "default", dot: false },
};

// Ordre d'affichage des divisions. Une division inconnue passe après, par
// ordre alphabétique : ajouter un produit ne casse jamais la grille.
const ORDRE_DIVISIONS = ["STRATA", "IROKO", "Cockpit"];

function rangDivision(division: string): number {
  const i = ORDRE_DIVISIONS.indexOf(division);
  return i === -1 ? ORDRE_DIVISIONS.length : i;
}

export function grouperParDivision(
  products: EcosystemProductRow[],
): { division: string; products: EcosystemProductRow[] }[] {
  const groupes = new Map<string, EcosystemProductRow[]>();
  for (const p of products) {
    const liste = groupes.get(p.division) ?? [];
    liste.push(p);
    groupes.set(p.division, liste);
  }
  return Array.from(groupes.entries())
    .map(([division, liste]) => ({
      division,
      products: [...liste].sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => {
      const d = rangDivision(a.division) - rangDivision(b.division);
      return d !== 0 ? d : a.division.localeCompare(b.division);
    });
}

function ProofTile({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex flex-col justify-center rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-3 transition-colors duration-150 hover:border-border-strong">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
        {name}
      </p>
      <p className="mt-0.5 font-mono text-[0.65rem] text-faint">{role}</p>
    </div>
  );
}

/** État de la passerelle L9 d'un produit, quand elle est configurée. */
function SondeChip({ gateway }: { gateway: GatewayStatusRow | undefined }) {
  if (!gateway || gateway.status === "disabled") {
    return null;
  }
  if (gateway.status === "ok") {
    return (
      <span className="font-mono text-[0.6rem] tracking-[0.12em] text-muted">
        sonde ok{gateway.latencyMs !== null ? ` · ${gateway.latencyMs} ms` : ""}
      </span>
    );
  }
  return (
    <span className="font-mono text-[0.6rem] tracking-[0.12em] text-faint">
      source indisponible
    </span>
  );
}

function ProductTile({
  product,
  gateway,
}: {
  product: EcosystemProductRow;
  gateway: GatewayStatusRow | undefined;
}) {
  const statut = STATUT[product.status] ?? STATUT.building;

  const contenu = (
    <div className="flex h-full flex-col rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-3 transition-colors duration-150 group-hover:border-emerald/60 hover:border-border-strong">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-semibold text-foreground">
          {product.name}
        </p>
        <Badge variant={statut.variant} dot={statut.dot}>
          {statut.label}
        </Badge>
      </div>
      {product.pillar ? (
        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-emerald">
          {product.pillar}
        </p>
      ) : null}
      <div className="mt-2 flex flex-1 items-end justify-between gap-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-faint">
          {product.url ? (
            <span className="text-emerald transition-colors group-hover:text-emerald-bright">
              ouvrir →
            </span>
          ) : (
            "sans lien public"
          )}
        </span>
        <SondeChip gateway={gateway} />
      </div>
    </div>
  );

  if (!product.url) {
    return contenu;
  }

  return (
    <OutboundLink
      href={product.url}
      product={product.slug}
      division={product.division}
      source="layer-d"
      className="group block h-full"
    >
      {contenu}
    </OutboundLink>
  );
}

export function LayerD({
  analytics,
  products,
  gateways,
}: {
  analytics: AnalyticsRow[];
  products: EcosystemProductRow[];
  gateways: GatewayStatusRow[];
}) {
  // Aucun repli chiffré : une métrique affichée est une métrique relevée.
  const rows = analytics.slice(0, 6);
  const groupes = grouperParDivision(products);
  const parProduit = new Map(gateways.map((g) => [g.productSlug, g]));

  return (
    <Card id="couche-d" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Couche D — Écosystème</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {groupes.length > 0 ? (
            groupes.map((g) => (
              <Badge key={g.division} variant="default">
                {g.division}
              </Badge>
            ))
          ) : (
            <Badge variant="default">Registre vide</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preuve sociale */}
        <div>
          <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            Ils m&apos;ont fait confiance
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ProofTile
              name="AG2R LA MONDIALE"
              role="Stage Data ESG & Solutions IA, direction RSE"
            />
            <ProofTile name="Younivibe" role="Coordination RSE, reporting" />
            <ProofTile name="AFEV" role="Engagement, mentorat étudiant" />
            <ProofTile
              name="Ministère des Finances"
              role="Sénégal, reporting & data"
            />
          </div>
          <p className="mt-3 font-mono text-xs text-muted">
            <span className="text-emerald">$</span> status --ecosysteme
            <span className="text-faint">
              {" "}
              · {products.length} produit{products.length > 1 ? "s" : ""} suivi
              {products.length > 1 ? "s" : ""}
            </span>
          </p>
        </div>

        {/* Métriques produit relevées */}
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
              Open Metrics, relevés produit
            </p>
            <Link
              href="/metrics"
              className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-emerald transition-colors hover:text-emerald-bright"
            >
              tout voir →
            </Link>
          </div>
          {rows.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {rows.map((row) => (
                <div
                  key={row.metric}
                  data-testid="metric-tile"
                  className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-2.5"
                >
                  <AnimatedNumber
                    value={row.value}
                    decimals={Number.isInteger(row.value) ? 0 : 1}
                    suffix={metricSuffix(row.metric)}
                    className="font-mono text-lg font-semibold tabular-nums text-emerald-bright"
                  />
                  <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-faint">
                    {metricLabel(row.metric)}
                    {row.period ? ` · ${row.period}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[calc(var(--radius)_-_0.125rem)] border border-dashed border-border bg-surface-raised px-3 py-4">
              <p className="font-mono text-xs text-muted">
                Donnée non disponible
              </p>
              <p className="mt-1 font-mono text-[0.6rem] leading-relaxed text-faint">
                Aucun relevé publié pour l&apos;instant. Les valeurs
                s&apos;affichent dès la première remontée produit.
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* L'écosystème, division par division */}
      <CardContent className="border-t border-border pt-4">
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
          L&apos;écosystème, par division
        </p>
        {groupes.length > 0 ? (
          <div className="space-y-4">
            {groupes.map((groupe) => (
              <div key={groupe.division}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground">
                    {groupe.division}
                  </span>
                  <span className="h-px flex-1 bg-border" aria-hidden />
                  <span className="font-mono text-[0.6rem] text-faint">
                    {groupe.products.length}
                  </span>
                </div>
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05 } },
                  }}
                  className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {groupe.products.map((p) => (
                    <motion.div
                      key={p.slug}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                    >
                      <ProductTile
                        product={p}
                        gateway={parProduit.get(p.slug)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[calc(var(--radius)_-_0.125rem)] border border-dashed border-border bg-surface-raised px-3 py-4">
            <p className="font-mono text-xs text-muted">
              Registre produits non disponible
            </p>
            <p className="mt-1 font-mono text-[0.6rem] leading-relaxed text-faint">
              La table ecosystem_products est vide ou injoignable. Rien
              n&apos;est affiché plutôt qu&apos;une liste écrite en dur.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <Link href="/ecosysteme" className="inline-flex">
          <Button size="sm" tabIndex={-1}>
            Découvrir l&apos;écosystème
          </Button>
        </Link>
        <a href={CV_PATH} download={CV_DOWNLOAD_NAME} className="inline-flex">
          <Button variant="ghost" size="sm" tabIndex={-1}>
            Download CV
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
