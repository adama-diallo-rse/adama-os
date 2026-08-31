import { permanentRedirect } from "next/navigation";

// Le hub produits s'appelle /ecosysteme depuis le 31 août 2026 (L6-T13).
// La redirection permanente est posée dans next.config.ts et intercepte la
// requête avant le routage. Ce fichier est la ceinture de sécurité : si la
// règle de configuration disparaissait, l'ancienne URL redirigerait quand même
// au lieu de rendre une page morte. Ne rien ajouter ici.
export default function StrataRedirect(): never {
  permanentRedirect("/ecosysteme#strata");
}
