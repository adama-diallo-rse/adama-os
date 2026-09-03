"use client";

// =====================================================================
// C9-T3, les actions du parcours recruteur.
//
// Ce composant ne reimplemente rien. La mecanique de la sortie recrutement
// fonctionne et ne doit pas etre touchee : la modale, le telechargement du
// CV, la prise de rendez-vous, la capture du lead et les cinq evenements
// analytiques restent ceux de recruit-modal.tsx. Ce fichier ne fait que
// poser les trois memes actions ailleurs, et emettre les memes evenements.
// =====================================================================

import { useState } from "react";
import { RecruitModal } from "./recruit-modal";
import { captureEvent } from "../lib/analytics";
import {
  EVENT_RECRUITER_CV,
  EVENT_RECRUITER_PRINT,
} from "../lib/analytics-events";
import { CV_DOWNLOAD_NAME, CV_PATH } from "./types";

export function HireActions({ source }: { source: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hire-actions">
      <a
        href={CV_PATH}
        download={CV_DOWNLOAD_NAME}
        className="portfolio-button primary"
        onClick={() => captureEvent(EVENT_RECRUITER_CV, { source })}
      >
        Télécharger mon CV <span aria-hidden="true">↓</span>
      </a>
      <button
        type="button"
        className="portfolio-button ghost"
        onClick={() => setOpen(true)}
      >
        Prendre rendez-vous <span aria-hidden="true">↗</span>
      </button>
      <button
        type="button"
        className="portfolio-text-link"
        onClick={() => {
          captureEvent(EVENT_RECRUITER_PRINT);
          window.print();
        }}
      >
        Imprimer cette page <span aria-hidden="true">⎙</span>
      </button>
      <RecruitModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
