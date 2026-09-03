import type { Metadata } from "next";
import { PageShell } from "../../components/page-shell";
import { FormulaireMotDePasse } from "./form";

export const metadata: Metadata = {
  title: "Mot de passe",
  robots: { index: false, follow: false },
};

export default async function MotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <PageShell tools={false}>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="portfolio-label">ADAMA OS / ESPACE PRIVÉ</p>
          <h1>
            Un mot de passe,
            <br />
            <span className="serif">une bonne fois.</span>
          </h1>
          <p>
            Un lien de récupération ouvre une session, il ne pose pas de mot de
            passe. Tant qu’aucun n’est défini, chaque retour dans l’atelier
            dépend d’un nouveau lien.
          </p>
        </div>
        <FormulaireMotDePasse erreurInitiale={params.error} />
      </div>
    </PageShell>
  );
}
