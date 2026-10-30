"use client";

import { MotionConfig } from "framer-motion";
import { AdamaAi } from "./adama-ai";
import { RecruitModal } from "./recruit-modal";
import { Terminal } from "./terminal";
import type { DashboardData } from "./types";
import type { CarteProjet } from "../content/projets";

// =====================================================================
// Les outils qui ne servent qu'à l'ouverture : le moteur, la modale
// d'échange et le terminal Ctrl+K (refonte du 30 octobre 2026).
//
// Ils pèsent plus que tout le reste de la page (conversation, cmdk,
// framer-motion) et ne servent à rien avant un clic. Ce module est donc
// importé à la demande par `useOutilsDifferes` : au repos du navigateur,
// ou tout de suite si le visiteur ouvre l'un d'eux avant. Il n'entre ni
// dans le paquet de la page ni dans le chemin critique.
// =====================================================================

export type ProprietesOutils = {
  recruitOpen: boolean;
  setRecruitOpen: (v: boolean) => void;
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  adamaOpen: boolean;
  setAdamaOpen: (v: boolean) => void;
  /** Absent sur les pages sans cockpit : seul le moteur est monté. */
  terminal?: { data: DashboardData; cartes: CarteProjet[] };
  echange?: boolean;
};

export default function OutilsDifferes(p: ProprietesOutils) {
  return (
    <MotionConfig reducedMotion="user">
      {p.echange !== false ? (
        <RecruitModal open={p.recruitOpen} onOpenChange={p.setRecruitOpen} />
      ) : null}
      {p.terminal ? (
        <Terminal
          open={p.terminalOpen}
          onOpenChange={p.setTerminalOpen}
          products={p.terminal.data.products}
          gateways={p.terminal.data.gateways}
          cartes={p.terminal.cartes}
          proofs={p.terminal.data.proofs}
          integrity={p.terminal.data.integrity}
          onRecruit={() => p.setRecruitOpen(true)}
          onAskAdama={() => p.setAdamaOpen(true)}
        />
      ) : null}
      <AdamaAi open={p.adamaOpen} onOpenChange={p.setAdamaOpen} />
    </MotionConfig>
  );
}
