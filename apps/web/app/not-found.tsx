import Link from "next/link";
import { PageIntro, PageShell } from "../components/page-shell";

export default function NotFound() {
  return (
    <PageShell tools={false}>
      <PageIntro
        eyebrow="404 / PAGE INTROUVABLE"
        title={
          <>
            Cette page
            <br />
            <span className="serif">n’existe pas.</span>
          </>
        }
        description="Vérifiez l’adresse ou retrouvez les projets depuis le portfolio."
      />
      <Link href="/" className="portfolio-button primary">
        Revenir au portfolio <span aria-hidden="true">→</span>
      </Link>
    </PageShell>
  );
}
