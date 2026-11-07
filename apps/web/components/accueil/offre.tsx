import Image from "next/image";
import type { ReactNode } from "react";
import { CAL_LINK, CONTACT_EMAIL } from "../types";
import {
  IconeSituation,
  IllustrationFormule,
  IllustrationSemaine,
} from "../kit/illustrations-offre";
import {
  ETAT_OFFRE,
  FORMULES,
  NOTE_FORMULES,
  QUESTIONS,
  RESULTATS,
  SEMAINES,
  SITUATIONS,
  type Photo,
} from "../../content/accompagnement";

// =====================================================================
// Les briques de l'offre d'accompagnement, partagées par l'accueil et par
// /travaillez-avec-moi. Composants serveur, sans état : le contenu vient de
// content/accompagnement.ts, le mouvement des repères `data-*` que les
// scènes animent (cadres qui s'ouvrent, cartes en vagues, route qui se
// remplit). Sans script ou sous réduction de mouvement, tout est là.
// =====================================================================

/**
 * Le lien de rendez-vous, lisible sans script : l'agenda en ligne quand il
 * est configuré (NEXT_PUBLIC_CAL_LINK), un e-mail prérempli sinon. Aucun
 * bouton ne mène nulle part.
 */
function lienRendezVous(): { href: string; externe: boolean } {
  if (CAL_LINK) return { href: `https://cal.com/${CAL_LINK}`, externe: true };
  return {
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Premier échange avec ADAMA OS",
    )}&body=${encodeURIComponent(
      "Bonjour Adama,\n\nMon projet en deux phrases :\n\nCe qui me bloque aujourd’hui :\n\nDeux créneaux qui me conviennent pour un appel de trente minutes :\n\nMerci,",
    )}`,
    externe: false,
  };
}

/** Le bouton de rendez-vous, même rendu partout où il apparaît. */
export function BoutonRendezVous({
  children,
  variante = "plein",
}: {
  children: ReactNode;
  variante?: "plein" | "contour";
}) {
  const { href, externe } = lienRendezVous();
  return (
    <a
      href={href}
      className={`bouton bouton-${variante} bouton-magnetique`}
      {...(externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {externe ? <span className="sr-only"> (nouvel onglet)</span> : null}
    </a>
  );
}

/**
 * Une photographie pleine définition, servie à la taille de l'écran. Les
 * images sont retravaillées pour le site : aucune légende ni source n'est
 * affichée.
 */
export function PhotoCadre({
  photo,
  sizes,
  priorite = false,
  className = "",
}: {
  photo: Photo;
  sizes: string;
  priorite?: boolean;
  className?: string;
}) {
  return (
    <figure className={`photo-cadre ${className}`.trim()}>
      <div className="photo-cadre-image" data-revele-media>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.largeur}
          height={photo.hauteur}
          sizes={sizes}
          quality={85}
          priority={priorite}
        />
      </div>
    </figure>
  );
}

/** Les trois situations pour lesquelles l'accompagnement est fait. */
export function Situations() {
  return (
    <ol className="situations" data-cartes>
      {SITUATIONS.map((s, i) => (
        <li key={s.code} className="situation">
          <span className="situation-icone">
            <IconeSituation code={s.code} />
            <span className="situation-numero">
              {String(i + 1).padStart(2, "0")}
            </span>
          </span>
          <h3>{s.titre}</h3>
          <p>{s.reponse}</p>
        </li>
      ))}
    </ol>
  );
}

/** Ce que le bénéficiaire garde, quel que soit son projet. */
export function Resultats() {
  return (
    <ul className="resultats">
      {RESULTATS.map((r) => (
        <li key={r}>
          <span className="resultats-coche" aria-hidden="true" />
          {r}
        </li>
      ))}
    </ul>
  );
}

/** Les six semaines, en route qui se remplit au défilement. */
export function RouteSemaines() {
  return (
    <ol className="route route--semaines" data-route>
      <span className="route-rail" aria-hidden="true">
        <span className="route-rempli" data-route-rempli />
      </span>
      {SEMAINES.map((s) => (
        <li key={s.numero} data-route-etape>
          <IllustrationSemaine numero={s.numero} />
          <span className="route-code">
            Semaine {s.numero} · {s.duree}
          </span>
          <span className="route-libelle">{s.verbe}</span>
          <span className="route-question">{s.objectif}</span>
          <span className="route-livrable">{s.livrable}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * La gamme. La formule principale occupe la première place et la plus
 * grande carte ; les trois autres se lisent comme des options.
 */
export function Formules({ action }: { action: ReactNode }) {
  return (
    <>
      <div className="formules" data-cartes>
        {FORMULES.map((f) => (
          <article
            key={f.code}
            className={`formule ${f.principale ? "formule--principale" : ""}`.trim()}
            id={`formule-${f.code}`}
          >
            <IllustrationFormule code={f.code} />
            <header>
              {f.principale ? (
                <p className="formule-badge">{ETAT_OFFRE.badge}</p>
              ) : (
                <p className="formule-badge formule-badge--discret">
                  Sur demande
                </p>
              )}
              <h3>{f.titre}</h3>
              <p className="formule-pourquoi">{f.pourQuoi}</p>
            </header>
            <ul>
              {f.contenu.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <dl className="formule-chiffres">
              <div>
                <dt>Durée</dt>
                <dd>{f.duree}</dd>
              </div>
            </dl>
            {f.principale ? (
              <div className="formule-action">{action}</div>
            ) : null}
          </article>
        ))}
      </div>
      <p className="formules-note">{NOTE_FORMULES}</p>
    </>
  );
}

/** Les questions qu'on pose avant d'écrire, en accordéon natif. */
export function Questions() {
  return (
    <div className="faq questions">
      {QUESTIONS.map((q) => (
        <details key={q.q}>
          <summary>{q.q}</summary>
          <div>
            <p>{q.r}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
