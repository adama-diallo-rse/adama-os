import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { PageIntro, PageShell } from "../../../components/page-shell";
import { EditionLue } from "../../../components/lettre/edition-lue";
import {
  BLOCS_EDITION,
  numeroAffiche,
  type ContenuEdition,
  type Langue,
} from "../../../lib/lettre/editions";
import { lireArchive, lireNumero } from "../../../lib/lettre/public";
import type { LigneEdition } from "../../../lib/lettre/registre-editions";

// =====================================================================
// EH4, la page publique d'un numero de SIGNAL.
//
// Une adresse permanente par numero, /lettre/001, citable et indexable.
// Le francais par defaut, l'anglais par ?langue=en : une seule edition,
// deux lectures. La page dit la date de parution, la version, la source
// primaire, et chaque correction avec son motif et le texte d'avant. Un
// numero qui n'est pas parti n'a pas de page.
//
// Rendu a la demande : une correction faite depuis la console doit se lire
// tout de suite, pas au prochain build.
// =====================================================================

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ numero: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TEXTES = {
  fr: {
    surtitre: "SIGNAL, LA LETTRE",
    description:
      "Un fait extérieur daté, ce qu’il change dans un système, la décision prise, ce qui a été construit, et une idée encore fermée.",
    paru: "Paru le",
    version: "Version",
    langues: "Lire en",
    corrections: "Corrections",
    aucuneCorrection:
      "Aucune correction depuis la parution. Une correction ne crée pas de numéro : elle s’inscrit ici, avec son motif et le texte d’avant.",
    avant: "Texte d’avant",
    corrigeLe: "corrigée le",
    precedent: "Numéro précédent",
    suivant: "Numéro suivant",
    tous: "Tous les numéros",
    compte: (n: number) =>
      `${n} numéro${n > 1 ? "s" : ""} paru${n > 1 ? "s" : ""}`,
    suivreTitre: "Recevoir le prochain numéro.",
    suivreTexte:
      "Double confirmation, désinscription en un clic, aucune mesure d’ouverture ni de clic.",
    suivre: "S’inscrire à SIGNAL",
    source: "Source primaire",
  },
  en: {
    surtitre: "SIGNAL, THE LETTER",
    description:
      "A dated outside fact, what it changes in a system, the decision taken, what was built, and an idea still closed.",
    paru: "Published on",
    version: "Version",
    langues: "Read in",
    corrections: "Corrections",
    aucuneCorrection:
      "No correction since publication. A correction never creates a new number: it is recorded here, with its reason and the previous text.",
    avant: "Previous text",
    corrigeLe: "corrected on",
    precedent: "Previous issue",
    suivant: "Next issue",
    tous: "All issues",
    compte: (n: number) => `${n} issue${n > 1 ? "s" : ""} published`,
    suivreTitre: "Receive the next issue.",
    suivreTexte:
      "Double opt-in, one-click unsubscribe, no open or click tracking.",
    suivre: "Subscribe to SIGNAL",
    source: "Primary source",
  },
} as const;

function langueDe(
  params: Record<string, string | string[] | undefined>,
): Langue {
  return params.langue === "en" ? "en" : "fr";
}

function dateLongue(iso: string | null, langue: Langue): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(langue === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

function adresse(numero: number, langue: Langue): string {
  const base = `/lettre/${numeroAffiche(numero)}`;
  return langue === "en" ? `${base}?langue=en` : base;
}

async function trouver(
  brut: string,
): Promise<
  | { etat: "ok"; edition: LigneEdition; toutes: LigneEdition[] }
  | { etat: "absent" }
  | { etat: "indisponible" }
> {
  const numero = lireNumero(brut);
  if (numero === null) return { etat: "absent" };
  const archive = await lireArchive();
  if (archive.etat !== "ok") return { etat: "indisponible" };
  const edition = archive.editions.find((e) => e.contenu.numero === numero);
  return edition
    ? { etat: "ok", edition, toutes: archive.editions }
    : { etat: "absent" };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { numero } = await params;
  const langue = langueDe(await searchParams);
  const trouve = await trouver(numero);
  if (trouve.etat !== "ok") {
    return { title: "SIGNAL", robots: { index: false, follow: true } };
  }
  const e = trouve.edition.contenu;
  const n = numeroAffiche(e.numero);
  const titre = `SIGNAL #${n}, ${e[langue].titre}`;
  const description = e[langue].signal.slice(0, 180);
  return {
    title: titre,
    description,
    alternates: {
      canonical: adresse(e.numero, langue),
      languages: {
        "fr-FR": adresse(e.numero, "fr"),
        "en-GB": adresse(e.numero, "en"),
      },
    },
    openGraph: {
      title: titre,
      description,
      url: adresse(e.numero, langue),
      siteName: "ADAMA OS",
      locale: langue === "fr" ? "fr_FR" : "en_GB",
      type: "article",
      publishedTime: trouve.edition.envoi_termine_le ?? undefined,
      modifiedTime: trouve.edition.modifie_le,
    },
  };
}

const NOMS_CHAMPS: Record<string, { fr: string; en: string }> = {
  titre: { fr: "Titre", en: "Title" },
  source: { fr: "Source", en: "Source" },
  ...Object.fromEntries(
    BLOCS_EDITION.map((b) => [b.cle, { fr: b.fr, en: b.en }]),
  ),
};

/** Les champs d'une langue qui ont change entre deux etats d'un numero. */
function changes(
  avant: ContenuEdition,
  apres: ContenuEdition,
  langue: Langue,
): { champ: string; avant: string }[] {
  const a = avant[langue];
  const b = apres[langue];
  return (Object.keys(a) as (keyof typeof a)[])
    .filter((cle) => a[cle] !== b[cle])
    .map((cle) => ({
      champ: NOMS_CHAMPS[cle]?.[langue] ?? cle,
      avant: a[cle],
    }));
}

export default async function NumeroSignalPage({
  params,
  searchParams,
}: Props) {
  const { numero } = await params;
  const langue = langueDe(await searchParams);
  const t = TEXTES[langue];
  const trouve = await trouver(numero);

  if (trouve.etat === "indisponible") {
    return (
      <PageShell className="lettre-page edition-page" sommaire={false}>
        <PageIntro
          eyebrow={t.surtitre}
          title="L’archive ne répond pas."
          description="La base de la lettre est injoignable pour le moment. Les numéros parus n’ont pas disparu : cette page les retrouvera dès que la base répondra."
        />
        <section className="page-next">
          <Link href="/lettre" className="portfolio-button primary">
            {t.tous} <span aria-hidden="true">→</span>
          </Link>
        </section>
      </PageShell>
    );
  }
  if (trouve.etat === "absent") notFound();

  const { edition, toutes } = trouve;
  const e = edition.contenu;
  const n = numeroAffiche(e.numero);
  if (numero !== n) permanentRedirect(adresse(e.numero, langue));

  const croissant = [...toutes].sort(
    (a, b) => a.contenu.numero - b.contenu.numero,
  );
  const rang = croissant.findIndex((x) => x.id === edition.id);
  const precedent = rang > 0 ? croissant[rang - 1] : null;
  const suivant = rang < croissant.length - 1 ? croissant[rang + 1] : null;

  // Chaque revision garde le texte d'avant sa correction. Le texte d'apres
  // est celui de la revision suivante, ou le texte en vigueur.
  const corrections = edition.revisions.map((r, i) => {
    const apres = i === 0 ? e : (edition.revisions[i - 1]?.avant ?? e);
    return { ...r, champs: changes(r.avant, apres, langue) };
  });

  return (
    <PageShell className="lettre-page edition-page" sommaire={false}>
      <div lang={langue}>
        <PageIntro
          eyebrow={`${t.surtitre} / #${n}`}
          title={e[langue].titre}
          description={t.description}
          aside={
            <div className="intro-note edition-meta">
              <span className="intro-note-label">SIGNAL #{n}</span>
              <dl>
                <div>
                  <dt>{t.paru}</dt>
                  <dd>{dateLongue(edition.envoi_termine_le, langue)}</dd>
                </div>
                <div>
                  <dt>{t.version}</dt>
                  <dd>{edition.version}</dd>
                </div>
              </dl>
              <nav className="edition-bascule" aria-label={t.langues}>
                <Link
                  href={adresse(e.numero, "fr")}
                  aria-current={langue === "fr" ? "page" : undefined}
                  hrefLang="fr"
                  lang="fr"
                >
                  FR
                </Link>
                <Link
                  href={adresse(e.numero, "en")}
                  aria-current={langue === "en" ? "page" : undefined}
                  hrefLang="en"
                  lang="en"
                >
                  EN
                </Link>
              </nav>
            </div>
          }
        />

        <div className="edition-corps">
          <EditionLue edition={e} langue={langue} entete={false} />

          <aside className="edition-marge" aria-label={t.corrections}>
            <section className="edition-corrections">
              <p className="portfolio-label">{t.corrections.toUpperCase()}</p>
              {corrections.length === 0 ? (
                <p>{t.aucuneCorrection}</p>
              ) : (
                <ol>
                  {corrections.map((c) => (
                    <li key={c.version}>
                      <p className="edition-correction-tete">
                        {t.version} {c.version} {t.corrigeLe}{" "}
                        {dateLongue(c.revise_le, langue)}
                      </p>
                      <p lang="fr">{c.motif}</p>
                      {c.champs.length ? (
                        <details>
                          <summary>{t.avant}</summary>
                          <dl>
                            {c.champs.map((ch) => (
                              <div key={ch.champ}>
                                <dt>{ch.champ}</dt>
                                <dd>{ch.avant}</dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <nav className="edition-voisins" aria-label={t.tous}>
              {precedent ? (
                <Link href={adresse(precedent.contenu.numero, langue)}>
                  <span>{t.precedent}</span>#
                  {numeroAffiche(precedent.contenu.numero)}{" "}
                  {precedent.contenu[langue].titre}
                </Link>
              ) : null}
              {suivant ? (
                <Link href={adresse(suivant.contenu.numero, langue)}>
                  <span>{t.suivant}</span>#
                  {numeroAffiche(suivant.contenu.numero)}{" "}
                  {suivant.contenu[langue].titre}
                </Link>
              ) : null}
              <Link href="/lettre#numeros">
                <span>{t.tous}</span>
                {t.compte(toutes.length)}
              </Link>
            </nav>
          </aside>
        </div>

        <section className="page-next">
          <div>
            <p className="portfolio-label">SIGNAL</p>
            <h2>{t.suivreTitre}</h2>
            <p>{t.suivreTexte}</p>
          </div>
          <Link href="/lettre#inscription" className="portfolio-button primary">
            {t.suivre} <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
