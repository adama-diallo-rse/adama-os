"use client";

import { useState } from "react";
import Link from "next/link";
import { LayerA } from "./layer-a";
import { LayerB } from "./layer-b";
import { LayerC } from "./layer-c";
import { LayerD } from "./layer-d";
import { ShippedFeed } from "./shipped-feed";
import { VsmeSimulator } from "./vsme-simulator";
import { useThemeBoot } from "../lib/theme";
import { IlotOutils } from "./outils-differes-ilot";
import { SurTitre } from "./kit/elements";
import type { DashboardData } from "./types";
import type { CarteProjet } from "../content/projets";

// =====================================================================
// Le cockpit, devenu la page /os le 30 octobre 2026 (AXP-09).
//
// Rien n'a été retiré : couches A à D, livraisons, trajectoire, registre
// produits et passerelles, relevés personnels, simulateur VSME et terminal
// Ctrl+K. L'accueil ne garde que son reflet, dans l'acte « Explorer ».
// Chaque compteur lit une ligne servie au rendu ; une donnée absente
// n'affiche rien, jamais un zéro inventé.
// =====================================================================

export function Cockpit({
  data,
  cartes,
}: {
  data: DashboardData;
  cartes: CarteProjet[];
}) {
  useThemeBoot();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [recruitOpen, setRecruitOpen] = useState(false);
  const [adamaOpen, setAdamaOpen] = useState(false);
  const currentFocus = data.metrics.find(
    (m) => m.key === "current_focus",
  )?.value_text;
  const integrite = data.integrity;

  const compteurs = [
    {
      libelle: "Affirmations servies par le registre",
      valeur: data.proofs.length,
    },
    {
      libelle: "Produits au registre de l’écosystème",
      valeur: data.products.length,
    },
    integrite
      ? { libelle: "Contrôles d’intégrité réussis", valeur: integrite.reussis }
      : null,
  ].filter(
    (c): c is { libelle: string; valeur: number } => c !== null && c.valeur > 0,
  );

  return (
    <div className="cockpit">
      <section
        className="atelier-section cockpit-atelier"
        aria-labelledby="atelier-title"
      >
        <div className="portfolio-wrap portfolio-section">
          <SurTitre numero="01">Journal de développement</SurTitre>
          <div className="section-heading">
            <h2 id="atelier-title">
              Dans <span className="serif">l’atelier.</span>
            </h2>
            <p>
              {currentFocus ||
                "Les dernières contributions au code, les décisions publiées et les prochaines étapes des projets."}
            </p>
          </div>
          <div className="atelier-tools">
            <div>
              <span className="atelier-prompt" aria-hidden="true">
                &gt;_
              </span>
              <h3>
                ADAMA OS <span>/ le terminal</span>
              </h3>
              <p>Chaque commande lit les mêmes données que cette page.</p>
            </div>
            <button
              type="button"
              className="portfolio-button terminal-button"
              onClick={() => setTerminalOpen(true)}
            >
              Ouvrir le terminal <kbd>Ctrl K</kbd>
            </button>
          </div>
          <div className="atelier-feed">
            <ShippedFeed commits={data.commits} />
          </div>
          <div className="cockpit-content cockpit-couches">
            <LayerB decisions={data.decisions} />
            <LayerC trajectory={data.trajectory} />
            <LayerD
              analytics={data.analytics}
              products={data.products}
              gateways={data.gateways}
            />
            <LayerA metrics={data.metrics} />
            <VsmeSimulator />
          </div>
          <div className="atelier-bottom">
            <Link href="/metrics">Consulter les métriques publiées ↗</Link>
            <Link href="/systeme">Comment ce site fonctionne ↗</Link>
            <button type="button" onClick={() => setAdamaOpen(true)}>
              Une question sur ces travaux ? Interroger le moteur ↗
            </button>
          </div>
        </div>
      </section>

      {compteurs.length ? (
        <section
          className="portfolio-wrap cockpit-compteurs"
          aria-labelledby="compteurs-titre"
        >
          <SurTitre numero="02">
            <span id="compteurs-titre">Le système en nombres</span>
          </SurTitre>
          <dl className="compteurs">
            {compteurs.map((c) => (
              <div key={c.libelle}>
                <dt>{c.libelle}</dt>
                <dd data-compteur={c.valeur}>{c.valeur}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <IlotOutils
        recruitOpen={recruitOpen}
        setRecruitOpen={setRecruitOpen}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
        adamaOpen={adamaOpen}
        setAdamaOpen={setAdamaOpen}
        terminal={{ data, cartes }}
      />
    </div>
  );
}
