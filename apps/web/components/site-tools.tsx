"use client";
import { useState } from "react";
import { IlotOutils } from "./outils-differes-ilot";

const RIEN = () => {};

/**
 * Le moteur sur les pages intérieures. Il arrive au repos du navigateur,
 * par l'îlot des outils différés : sa conversation ne pèse rien au
 * premier affichage.
 */
export function SiteTools() {
  const [open, setOpen] = useState(false);
  return (
    <IlotOutils
      recruitOpen={false}
      setRecruitOpen={RIEN}
      terminalOpen={false}
      setTerminalOpen={RIEN}
      adamaOpen={open}
      setAdamaOpen={setOpen}
      echange={false}
    />
  );
}
