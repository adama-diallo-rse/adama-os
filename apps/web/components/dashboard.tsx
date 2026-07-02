"use client";

// L4-T10/T11 — Orchestrateur client du dashboard.
// Entrées animées en cascade (Framer Motion), terminal Ctrl+K,
// responsive desktop / tablette / mobile.

import { useState } from "react";
import { MotionConfig, motion, type Variants } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@adama/ui";
import { LayerA } from "./layer-a";
import { LayerB } from "./layer-b";
import { LayerC } from "./layer-c";
import { LayerD } from "./layer-d";
import { ShippedFeed } from "./shipped-feed";
import { Terminal, useThemeBoot } from "./terminal";
import { CONTACT_EMAIL, type DashboardData, type TrajectoryRow } from "./types";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Aperçu compact des items "now" à côté de la Couche A. */
function FocusNow({ trajectory }: { trajectory: TrajectoryRow[] }) {
  const nowItems = trajectory.filter((t) => t.status === "now").slice(0, 4);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Focus — Now</CardTitle>
        <Badge variant="emerald" dot>
          live
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {nowItems.length > 0 ? (
          nowItems.map((t) => (
            <p key={t.id} className="font-mono text-sm text-muted">
              <span className="text-emerald">›</span> {t.title}
            </p>
          ))
        ) : (
          <p className="font-mono text-sm text-faint">— rien en cours —</p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard({ data }: { data: DashboardData }) {
  useThemeBoot();
  const [terminalOpen, setTerminalOpen] = useState(false);

  const byKey = new Map(data.metrics.map((m) => [m.key, m]));
  const systemStatus =
    byKey.get("system_status")?.value_text ?? "ONLINE - BUILDING MODE";
  const online = !systemStatus.toUpperCase().includes("OFFLINE");

  // MotionConfig reducedMotion="user" respecte prefers-reduced-motion côté
  // client SANS changer le HTML initial : le serveur et le client rendent
  // exactement le même markup (pas d'erreur d'hydratation), puis les
  // animations de transform sont neutralisées si l'utilisateur le demande.
  return (
    <MotionConfig reducedMotion="user">
    <div id="top" className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-14">
        {/* En-tête */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-faint">
              Adama OS
            </p>
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              System Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={online ? "emerald" : "default"} dot>
              {online ? "Online" : "Offline"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTerminalOpen(true)}
              aria-label="Ouvrir le terminal de commandes"
            >
              <span aria-hidden className="text-emerald">
                $
              </span>
              <span className="hidden sm:inline">Terminal</span>
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-faint">
                Ctrl K
              </kbd>
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                "Recrutement, Architecte Adama OS",
              )}`}
              className="inline-flex"
            >
              <Button variant="outline" size="sm" bracket tabIndex={-1}>
                Recruter l&apos;Architecte
              </Button>
            </a>
          </div>
        </motion.header>

        {/* Les 4 couches, entrée en cascade */}
        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          <motion.div variants={item} className="md:col-span-2 xl:col-span-2">
            <LayerA metrics={data.metrics} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 xl:col-span-1">
            <FocusNow trajectory={data.trajectory} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 xl:col-span-3">
            <LayerB decisions={data.decisions} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 xl:col-span-3">
            <LayerC trajectory={data.trajectory} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 xl:col-span-3">
            <LayerD strata={data.strata} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 xl:col-span-3">
            <ShippedFeed commits={data.commits} />
          </motion.div>
        </motion.main>

        {/* Pied de page */}
        <footer className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo — System Architect · Strata
          </p>
          <p className="font-mono text-[0.65rem] text-faint">
            <span className="text-emerald">$</span> ctrl+k pour le terminal
          </p>
        </footer>
      </div>

      <Terminal open={terminalOpen} onOpenChange={setTerminalOpen} />
    </div>
    </MotionConfig>
  );
}
