// Liens légaux du pied de page. Sans état ni effet : utilisable aussi bien
// dans un composant serveur que dans un composant client.
import Link from "next/link";

const CLASSE =
  "font-mono text-[0.65rem] text-faint underline-offset-4 transition-colors hover:text-muted hover:underline";

export function LegalFooterLinks({ className }: { className?: string }) {
  return (
    <>
      <Link href="/mentions-legales" className={className ?? CLASSE}>
        mentions légales
      </Link>
      <Link href="/confidentialite" className={className ?? CLASSE}>
        confidentialité
      </Link>
    </>
  );
}
