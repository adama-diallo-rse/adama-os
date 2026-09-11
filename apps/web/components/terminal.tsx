"use client";

// L4-T9, Terminal Ctrl+K (cmdk), etendu par C10-T11.
//
// Ce que le terminal EST devenu : le raccourci d'exploration du lecteur
// technique. Ce qu'il n'est pas devenu, et ne deviendra pas : l'interface
// principale du site. Un portfolio dont l'accueil serait un terminal
// exclurait la moitie de ses lecteurs, et le premier public de ce site est
// un recruteur.
//
// Trois règles tenues ici :
//   - aucune URL de produit en dur. La liste "Explorer" est construite à
//     partir du registre produits reçu en props (L6-T13) ;
//   - "ping" n'invente plus de latence. Il restitue l'état réel des
//     passerelles L9, ou dit qu'aucune sonde n'est configurée ;
//   - C10-T11, chaque commande d'inspection est branchée sur une source
//     réelle. Aucune ne rend un texte écrit d'avance : `whoami` lit la source
//     unique de profil, `projects` les fiches versionnées, `ecosystem` le
//     registre, `proof` l'index de preuve, `status` les sondes, `integrity`
//     l'artefact produit par la commande d'intégrité. Une commande qui
//     n'aurait pas de source réelle n'existerait pas.

import { useCallback, useEffect, useRef, useState } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CONTACT_EMAIL,
  CV_DOWNLOAD_NAME,
  CV_PATH,
  GITHUB_REPO_URL,
  type EcosystemProductRow,
  type GatewayStatusRow,
  type TerminalIntegrity,
  type TerminalProof,
} from "./types";
import type { CarteProjet } from "../content/projets";
import {
  commandesInspection,
  type CommandeInspection,
} from "../lib/terminal/inspect";
import { captureEvent } from "../lib/analytics";
import {
  LEGACY_OUTBOUND_EVENT,
  OUTBOUND_EVENT,
  legacyOutboundProperties,
  outboundProperties,
  withUtm,
} from "../lib/outbound";

const THEME_KEY = "adama-theme";

type LogLine = { id: number; text: string; tone: "ok" | "info" };

function applyTheme(theme: string | null) {
  if (theme === "gold") {
    document.documentElement.dataset.theme = "gold";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

/** Restaure le thème choisi au montage (persisté en localStorage). */
export function useThemeBoot() {
  useEffect(() => {
    try {
      applyTheme(localStorage.getItem(THEME_KEY));
    } catch {
      // stockage indisponible : thème par défaut
    }
  }, []);
}

const NAV_TARGETS: { id: string; label: string }[] = [
  { id: "top", label: "Haut de page" },
  { id: "projets", label: "Projets" },
  { id: "approche", label: "Approche" },
  { id: "parcours", label: "Parcours" },
  { id: "atelier", label: "Atelier" },
  { id: "contact", label: "Contact" },
  { id: "couche-a", label: "Couche A, System Status" },
  { id: "couche-b", label: "Couche B, Decisions Log" },
  { id: "couche-c", label: "Couche C, Trajectory" },
  { id: "couche-d", label: "Couche D, Écosystème" },
  { id: "simulateur", label: "Simulateur VSME" },
  { id: "shipped", label: "Shipped · Proof of Work" },
];

// Pages internes du site. Les produits s'ajoutent à cette liste au rendu,
// depuis le registre : aucune URL de produit n'est écrite ici.
type PageTarget = {
  url: string;
  label: string;
  product: string;
  division: string;
};

const PAGES_INTERNES: PageTarget[] = [
  { url: "/ecosysteme", label: "Écosystème", product: "", division: "" },
  { url: "/metrics", label: "Open Metrics", product: "", division: "" },
  { url: "/preuves", label: "Preuves", product: "", division: "" },
  { url: "/technique", label: "Vue technique", product: "", division: "" },
  { url: "/journal", label: "Journal", product: "", division: "" },
  { url: "/confiance", label: "Frontières", product: "", division: "" },
  {
    url: "/systeme/pannes",
    label: "Santé et pannes",
    product: "",
    division: "",
  },
  {
    url: "/mentions-legales",
    label: "Mentions légales",
    product: "",
    division: "",
  },
  {
    url: "/confidentialite",
    label: "Confidentialité",
    product: "",
    division: "",
  },
];

export function Terminal({
  open,
  onOpenChange,
  products = [],
  gateways = [],
  cartes = [],
  proofs = [],
  integrity = null,
  onRecruit,
  onAskAdama,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** L6-T13 : registre produits, source des cibles "open ...". */
  products?: EcosystemProductRow[];
  /** L9 : état des passerelles, restitué par la commande ping. */
  gateways?: GatewayStatusRow[];
  /** C5 : fiches projet versionnées, restituées par la commande projects. */
  cartes?: CarteProjet[];
  /** C2 : index de preuve, restitué par la commande proof. */
  proofs?: TerminalProof[];
  /** C12 : dernier calcul d'intégrité, restitué par la commande integrity. */
  integrity?: TerminalIntegrity | null;
  /** L6 : ouvre le modal "Contacter Adama". */
  onRecruit?: () => void;
  /** L3-T6 : ouvre le chat adama.ai. */
  onAskAdama?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [pinging, setPinging] = useState(false);
  const logId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pushLog = useCallback(
    (text: string, tone: LogLine["tone"] = "info") => {
      logId.current += 1;
      setLogs((prev) => [
        ...prev.slice(-11),
        { id: logId.current, text, tone },
      ]);
    },
    [],
  );

  // Raccourci global Ctrl+K / Cmd+K.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Focus sur l'input à l'ouverture, reset des logs à la fermeture.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    const frame = requestAnimationFrame(() => setLogs([]));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const goTo = useCallback(
    (cible: PageTarget) => {
      close();
      // Sortie vers un produit du groupe : on trace et on pose les UTM, avec
      // la même convention que OutboundLink (no-op sans consentement ou sans
      // clé PostHog).
      if (/^https?:/.test(cible.url)) {
        const ctx = {
          product: cible.product,
          division: cible.division,
          source: "terminal",
        };
        captureEvent(OUTBOUND_EVENT, outboundProperties(ctx));
        captureEvent(LEGACY_OUTBOUND_EVENT, legacyOutboundProperties(ctx));
        window.location.href = withUtm(cible.url, "terminal");
        return;
      }
      window.location.href = cible.url;
    },
    [close],
  );

  const navigate = useCallback(
    (id: string) => {
      close();
      if (id === "top") {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
        return;
      }
      const target = document.getElementById(id);
      const disclosure = target?.closest("details");
      if (disclosure) disclosure.open = true;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "instant"
        : "smooth";
      target?.scrollIntoView({ behavior });
    },
    [close],
  );

  // C10-T11. Les commandes d'inspection sont construites par un module pur,
  // depuis les donnees recues. Le composant ne fait qu'executer et afficher.
  const inspection = commandesInspection({
    cartes,
    products,
    gateways,
    proofs,
    integrity,
  });

  const executer = useCallback(
    (commande: CommandeInspection) => {
      const { lignes, ouvrir, ancre } = commande.run();
      for (const ligne of lignes) {
        pushLog(ligne.text, ligne.tone);
      }
      if (ancre) {
        navigate(ancre);
        return;
      }
      if (ouvrir) {
        close();
        window.location.href = ouvrir;
      }
    },
    [pushLog, navigate, close],
  );

  // Cibles "open ..." : les pages du site, puis les produits réellement
  // ouverts (une URL en base est la seule autorisation de lien).
  const cibles: PageTarget[] = [
    ...PAGES_INTERNES,
    ...products
      .filter((p) => p.status === "live" && p.url)
      .map((p) => ({
        url: p.url as string,
        label: p.name,
        product: p.slug,
        division: p.division,
      })),
  ];

  const downloadCv = useCallback(() => {
    const a = document.createElement("a");
    a.href = CV_PATH;
    a.download = CV_DOWNLOAD_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    pushLog(`cv téléchargé → ${CV_DOWNLOAD_NAME}`, "ok");
  }, [pushLog]);

  const pingEcosysteme = useCallback(() => {
    if (pinging) {
      return;
    }
    setPinging(true);
    pushLog("PING ecosysteme ...", "info");
    const sondes = gateways.filter((g) => g.status !== "disabled");
    setTimeout(() => {
      if (sondes.length === 0) {
        pushLog(
          `${products.length} produit(s) au registre, aucune sonde configurée`,
          "info",
        );
      } else {
        for (const sonde of sondes) {
          if (sonde.status === "ok") {
            pushLog(
              `PONG · ${sonde.productName}${
                sonde.latencyMs !== null ? ` · ${sonde.latencyMs} ms` : ""
              }`,
              "ok",
            );
          } else {
            pushLog(`${sonde.productName} · source indisponible`, "info");
          }
        }
      }
      setPinging(false);
    }, 320);
  }, [pinging, pushLog, gateways, products]);

  const bookCall = useCallback(() => {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Prise de rendez-vous, Adama OS",
    )}`;
    pushLog("ouverture du client mail ...", "info");
  }, [pushLog]);

  const openGithub = useCallback(() => {
    window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer");
    pushLog("ouverture du repo GitHub ...", "info");
  }, [pushLog]);

  const toggleTheme = useCallback(() => {
    const next =
      document.documentElement.dataset.theme === "gold" ? null : "gold";
    applyTheme(next);
    try {
      if (next) {
        localStorage.setItem(THEME_KEY, next);
      } else {
        localStorage.removeItem(THEME_KEY);
      }
    } catch {
      // stockage indisponible : le thème reste appliqué pour la session
    }
    pushLog(`theme → ${next ?? "teal"}`, "ok");
  }, [pushLog]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="terminal-overlay"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              close();
            }
          }}
        >
          <motion.div
            key="terminal-panel"
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-lg overflow-hidden rounded-[var(--radius)] border border-border-strong bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] glow-emerald"
          >
            <Command
              label="Terminal Adama OS"
              loop
              className="flex max-h-[60vh] flex-col"
            >
              {/* Barre de saisie façon prompt */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span aria-hidden className="font-mono text-sm text-emerald">
                  $
                </span>
                <Command.Input
                  ref={inputRef}
                  placeholder="tape une commande..."
                  className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-faint"
                />
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-faint">
                  esc
                </kbd>
              </div>

              <Command.List className="flex-1 overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-center font-mono text-sm text-faint">
                  command not found
                </Command.Empty>

                <Command.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-faint"
                >
                  <TerminalItem
                    value="download cv"
                    hint="télécharge le CV en PDF"
                    onSelect={downloadCv}
                  />
                  {onAskAdama ? (
                    <TerminalItem
                      value="ask adama"
                      hint="agent ESG avec sources (RAG)"
                      onSelect={() => {
                        close();
                        onAskAdama();
                      }}
                    />
                  ) : null}
                  <TerminalItem
                    value="ping ecosysteme"
                    hint="état réel des passerelles produit"
                    keywords={["ping strata", "status", "sonde"]}
                    onSelect={pingEcosysteme}
                  />
                  <TerminalItem
                    value="book call"
                    hint="prendre rendez-vous par email"
                    onSelect={bookCall}
                  />
                  <TerminalItem
                    value="git log"
                    hint="ouvre le repo GitHub"
                    onSelect={openGithub}
                  />
                  <TerminalItem
                    value="theme"
                    hint="bascule teal / gold"
                    onSelect={toggleTheme}
                  />
                  {onRecruit ? (
                    <TerminalItem
                      value="recruit"
                      hint="recruter l'architecte"
                      onSelect={() => {
                        close();
                        onRecruit();
                      }}
                    />
                  ) : null}
                </Command.Group>

                {/* C10-T11, l'inspection. Chaque entree lit une source
                    reelle : profil versionne, fiches relues, registre
                    produits, index de preuve, sondes, artefact d'integrite.
                    La liste vient d'un module pur, elle n'est pas ecrite
                    ici : un test verifie qu'aucune commande n'est orpheline
                    de source. */}
                <Command.Group
                  heading="Inspecter"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-faint"
                >
                  {inspection.map((commande) => (
                    <TerminalItem
                      key={commande.value}
                      value={commande.value}
                      hint={commande.hint}
                      keywords={commande.keywords}
                      onSelect={() => executer(commande)}
                    />
                  ))}
                  <TerminalItem
                    value="contact"
                    hint="CV et prise de rendez-vous"
                    onSelect={bookCall}
                  />
                </Command.Group>

                <Command.Group
                  heading="Navigate"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-faint"
                >
                  {NAV_TARGETS.map((t) => (
                    <TerminalItem
                      key={t.id}
                      value={`navigate ${t.label}`}
                      hint="scroll"
                      onSelect={() => navigate(t.id)}
                    />
                  ))}
                </Command.Group>

                <Command.Group
                  heading="Explorer"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-faint"
                >
                  {cibles.map((t) => (
                    <TerminalItem
                      key={t.url}
                      value={`open ${t.label}`}
                      hint={t.product ? "produit" : "page"}
                      onSelect={() => goTo(t)}
                    />
                  ))}
                </Command.Group>
              </Command.List>

              {/* Sortie du terminal (ping, theme...) */}
              {logs.length > 0 ? (
                <div
                  aria-live="polite"
                  className="border-t border-border bg-surface-raised px-4 py-2.5"
                >
                  {logs.map((line) => (
                    <p
                      key={line.id}
                      className={`font-mono text-xs ${
                        line.tone === "ok"
                          ? "text-emerald-bright"
                          : "text-muted"
                      }`}
                    >
                      {line.tone === "ok" ? "✓ " : "› "}
                      {line.text}
                    </p>
                  ))}
                </div>
              ) : null}
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function TerminalItem({
  value,
  hint,
  keywords,
  onSelect,
}: {
  value: string;
  hint: string;
  /** Alias de recherche : une ancienne commande continue de répondre. */
  keywords?: string[];
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-[calc(var(--radius)_-_0.25rem)] px-3 py-2 font-mono text-sm text-muted data-[selected=true]:bg-surface-raised data-[selected=true]:text-emerald-bright"
    >
      <span>{value}</span>
      <span className="text-[0.65rem] text-faint">{hint}</span>
    </Command.Item>
  );
}
