import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { ArchitectureDiagram } from "../../components/architecture-diagram";
import { TechInventory } from "../../components/tech-inventory";
import { IntegrityPanel } from "../../components/integrity-panel";
import { TrackView, TrackedAnchor } from "../../components/analytics-tracker";
import {
  EVENT_PROOF_PACK,
  EVENT_TECHNIQUE_OPENED,
} from "../../lib/analytics-events";
import {
  budgets,
  codeMortNonJustifie,
  dependancesDirectes,
  migrations,
  policies,
  policiesDeclarees,
  plusGros,
  routesPubliques,
  sansTiretLong,
  surface,
  tables,
  tablesProtegees,
} from "../../lib/inventory";
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  RETRIEVAL_K,
  RETRIEVAL_MAX_PAR_DOCUMENT,
  RETRIEVAL_MIN_SIMILARITY,
} from "../../lib/ai/config";
import { lireIntegrite } from "../../lib/integrity";
import {
  lireRestauration,
  lireVerificationRag,
} from "../../lib/health/collect";

// =====================================================================
// C10, l'inspection technique.
//
// Symetrique exacte du parcours recruteur. Le lecteur vise est un ingenieur
// ou un directeur technique qui a decide de creuser et qui dispose de vingt a
// quarante minutes. Il cherche trois choses : est-ce que cette personne sait
// poser une frontiere entre deux systemes, est-ce qu'elle teste, et est-ce
// qu'elle sait ce qu'elle ne fait pas.
//
// Cette couche ne fabrique rien. Tout le materiau existait deja : inventaire
// de C0, tests, regles de securite, contrats d'interface, modes de panne de
// C3, decisions de C6. Elle ouvre l'acces.
//
// Deux exigences editoriales gouvernent la page :
//   1. l'inventaire est GENERE. Aucun chiffre n'est saisi, et la commande qui
//      les produit est affichee au-dessus d'eux ;
//   2. l'absence d'integration continue est ASSUMEE, presentee comme une
//      decision documentee avec sa raison et sa procedure de remplacement.
//      Elle n'est ni dissimulee dans un paragraphe, ni traitee comme une
//      alerte rouge.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vue technique",
  description:
    "L’inventaire généré du dépôt, les frontières de données, les contrats des interfaces publiques, les réglages de la recherche documentaire, et l’absence d’intégration continue assumée avec sa procédure de remplacement.",
  alternates: { canonical: "/technique" },
  openGraph: {
    title: "Vue technique",
    description:
      "Inventaire généré, contrats d’interface, sécurité, recherche documentaire, tests. Rien n’est saisi à la main.",
    url: "/technique",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

const SOMMAIRE: { id: string; titre: string; prouve: string }[] = [
  {
    id: "architecture",
    titre: "Architecture",
    prouve: "Où passent les données, et où s’arrête ce système.",
  },
  {
    id: "inventaire",
    titre: "Inventaire",
    prouve: "La taille réelle du dépôt, mesurée par une commande.",
  },
  {
    id: "securite",
    titre: "Données et sécurité",
    prouve: "Ce qu’un client anonyme peut lire, et ce qu’il ne peut pas.",
  },
  {
    id: "documentaire",
    titre: "Intelligence documentaire",
    prouve:
      "Les réglages exacts de la recherche, et son comportement en échec.",
  },
  {
    id: "contrats",
    titre: "Contrats d’interface",
    prouve: "La forme des réponses publiques, et le test qui les verrouille.",
  },
  {
    id: "tests",
    titre: "Tests et vérification",
    prouve: "Ce qui est couvert, et ce qui ne l’est pas.",
  },
  {
    id: "exploitation",
    titre: "Exploitation et continuité",
    prouve: "Ce qui tient quand quelque chose tombe.",
  },
];

export default function TechniquePage() {
  const s = surface();
  const rag = lireVerificationRag();
  const restauration = lireRestauration();
  const integrite = lireIntegrite();
  const grosComposant = plusGros("components");
  const grosLib = plusGros("lib_modules");
  const mortes = codeMortNonJustifie();

  return (
    <PageShell className="technique-page">
      <TrackView event={EVENT_TECHNIQUE_OPENED} />
      <PageIntro
        eyebrow="INSPECTION / VUE TECHNIQUE"
        title={
          <>
            Tout est ouvert,
            <br />
            <span className="serif">y compris ce qui manque.</span>
          </>
        }
        description="Cette page ne raconte rien. Elle donne l’inventaire généré du dépôt, les frontières de données, les contrats des interfaces publiques et les réglages exacts de la recherche documentaire. Elle dit aussi ce qui n’est pas fait, à commencer par l’absence d’intégration continue."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">SURFACE MESURÉE</span>
            <strong>{s.test_cases}</strong>
            <p>
              cas de test répartis sur {s.test_files} fichiers, pour {s.pages}{" "}
              routes de page et {s.components} composants.
            </p>
            <Link href="/recruteur">Passer au parcours recruteur ↗</Link>
          </div>
        }
      />

      <nav className="tech-toc" aria-label="Sommaire">
        <p className="portfolio-label">SOMMAIRE</p>
        <ol>
          {SOMMAIRE.map((s2) => (
            <li key={s2.id}>
              <a href={`#${s2.id}`}>{s2.titre}</a>
              <span>{s2.prouve}</span>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. ARCHITECTURE */}
      <section className="tech-section" id="architecture">
        <h2>Architecture</h2>
        <p className="tech-lede">
          Une chaîne à sens unique, des sources vers le lecteur. Aucune étape ne
          réécrit ce que la précédente a produit, et rien ne repart vers les
          produits du groupe.
        </p>
        <ArchitectureDiagram />
        <p>
          Le détail de chaque étape, avec le fichier ou la table qui
          l’implémente réellement, vit sur{" "}
          <Link href="/systeme">la page d’autoréférence</Link>. Une étape qui ne
          peut pas nommer son implémentation n’est pas une étape, c’est une case
          de schéma.
        </p>
      </section>

      {/* 2. INVENTAIRE */}
      <section className="tech-section" id="inventaire">
        <h2>Inventaire</h2>
        <p className="tech-lede">
          Aucun de ces nombres n’est écrit à la main. Ils sont la sortie d’une
          commande, versionnée dans le dépôt et vérifiée avant chaque envoi.
        </p>
        <TechInventory surface={s} budgets={budgets()} />
        <div className="tech-facts">
          <p>
            Plus gros composant :{" "}
            <code>{grosComposant?.file ?? "inconnu"}</code>,{" "}
            {grosComposant?.lines ?? 0} lignes. Plus gros module :{" "}
            <code>{grosLib?.file ?? "inconnu"}</code>, {grosLib?.lines ?? 0}{" "}
            lignes.
          </p>
          <p>
            {mortes === 0
              ? "Aucun export mort sans justification écrite."
              : `${mortes} export(s) sans usage repéré et sans justification écrite. Chaque justification est relue au même titre que le code.`}
          </p>
          <p>
            Tirets longs dans le code et les textes publiés :{" "}
            {sansTiretLong()
              ? "aucun"
              : "présents, la doctrine n’est pas tenue"}
            . La règle existait depuis le début du projet et personne ne la
            mesurait.
          </p>
          <p>
            Dépendances directes réellement installées :{" "}
            {dependancesDirectes()
              .map((d) => d.name)
              .join(", ")}
            .
          </p>
        </div>
      </section>

      {/* 3. DONNEES ET SECURITE */}
      <section className="tech-section" id="securite">
        <h2>Données et sécurité</h2>
        <p className="tech-lede">
          {policies().length} règles de sécurité au niveau des lignes portent
          sur les {tablesProtegees().length} tables protégées de ce site.
          L’historique des migrations en a créé {policiesDeclarees().length} au
          total : la différence porte sur des tables depuis supprimées ou
          devenues des vues, et publier ce second nombre à la place du premier
          gonflerait le chiffre sans mentir formellement.
        </p>
        <div className="tech-two">
          <div>
            <h3>Ce qu’un visiteur anonyme peut lire</h3>
            <ul>
              <li>Les métriques système publiées.</li>
              <li>Les décisions d’architecture publiées et relues.</li>
              <li>La trajectoire.</li>
              <li>Le registre des produits, sans le nom de leurs dépôts.</li>
              <li>
                Les affirmations publiques et leurs preuves, jamais celles
                marquées internes.
              </li>
            </ul>
          </div>
          <div>
            <h3>Ce qu’il ne peut pas lire</h3>
            <ul>
              <li>Le corpus documentaire et ses fragments vectoriels.</li>
              <li>Les prises de contact reçues.</li>
              <li>Les décisions non publiées ou non relues.</li>
              <li>Les extraits d’erreur des sondes vers les produits.</li>
              <li>Le nom des dépôts rattachés aux produits.</li>
            </ul>
          </div>
        </div>
        <p>
          Les clés d’écriture ne quittent jamais le serveur. Un garde-fou de
          débit protège l’assistant, et il est couvert par un test. Le détail
          des frontières, y compris ce qui n’entre jamais dans ce système, vit
          sur <Link href="/confiance">la page de confiance</Link>.
        </p>
        <p className="tech-note">
          Base de données partagée avec deux produits du groupe. Ce n’est pas un
          choix, c’est une contrainte relevée après coup, et sa conséquence est
          traitée : la restauration est sélective, table par table, jamais
          globale. Les {tables().length} tables de ce site vivent aux côtés de
          celles des produits, séparées par les règles ci-dessus.{" "}
          {migrations().length} migrations, jouées dans l’ordre, chacune
          idempotente.
        </p>
      </section>

      {/* 4. INTELLIGENCE DOCUMENTAIRE */}
      <section className="tech-section" id="documentaire">
        <h2>Intelligence documentaire</h2>
        <p className="tech-lede">
          C’est le passage le plus regardé par un lecteur technique, donc celui
          où une approximation coûterait le plus. Voici les réglages exacts, et
          l’état réel du corpus.
        </p>
        <dl className="tech-params">
          <div>
            <dt>Modèle d’embedding</dt>
            <dd>{EMBEDDING_MODEL}</dd>
          </div>
          <div>
            <dt>Dimension</dt>
            <dd>
              {EMBEDDING_DIMENSIONS}, figée dans le schéma et dans l’index
            </dd>
          </div>
          <div>
            <dt>Plancher de récupération</dt>
            <dd>{RETRIEVAL_MIN_SIMILARITY}</dd>
          </div>
          <div>
            <dt>Fragments passés au modèle</dt>
            <dd>
              {RETRIEVAL_K}, dont {RETRIEVAL_MAX_PAR_DOCUMENT} au maximum par
              document
            </dd>
          </div>
          <div>
            <dt>Index</dt>
            <dd>HNSW, distance cosinus</dd>
          </div>
          <div>
            <dt>Comportement en échec de récupération</dt>
            <dd>Refus explicite, aucune réponse produite</dd>
          </div>
        </dl>
        <p>
          Le plancher de récupération n’est pas un seuil de pertinence. Il
          écarte le manifestement hors sujet avant que le modèle ne voie quoi
          que ce soit. Le seuil de pertinence, lui, sert à dire si le corpus
          couvre ce que l’écran promet, et il vaut{" "}
          {rag ? virgule(rag.seuilOk) : "0,50"} : en dessous de{" "}
          {rag ? virgule(rag.seuilEchec) : "0,45"}, la vérification échoue.
        </p>
        <p className="tech-note">
          {rag
            ? `Dernière vérification de pertinence : ${
                rag.verdict === "ok"
                  ? "réussie"
                  : rag.verdict === "avertissement"
                    ? "passée avec avertissement"
                    : "échouée"
              }, meilleur score ${virgule(rag.best)}, plus faible ${virgule(rag.worst)}.`
            : "Aucune vérification de pertinence n’a encore été enregistrée. La capacité est donc affichée comme non mesurée, et surtout pas comme opérationnelle."}{" "}
          Un corpus partiel est assumé : l’assistant refuse de répondre sur ce
          qu’il ne couvre pas, plutôt que de répondre approximativement.
        </p>
      </section>

      {/* 5. CONTRATS D'INTERFACE */}
      <section className="tech-section" id="contrats">
        <h2>Contrats d’interface</h2>
        <p className="tech-lede">
          {routesPubliques().length} routes publiques. Chacune répond en JSON,
          et chacune répond 503 avec une raison quand la base n’est pas
          joignable, plutôt qu’un corps vide ou un tableau vide qui
          ressemblerait à une absence de données.
        </p>
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col">Ce qu’elle sert</th>
                <th scope="col">Base injoignable</th>
              </tr>
            </thead>
            <tbody>
              {routesPubliques().map((r) => (
                <tr key={r.route}>
                  <th scope="row">
                    <code>{r.route}</code>
                  </th>
                  <td>{descriptionRoute(r.route)}</td>
                  <td>{comportementRoute(r.route)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Ces formes sont verrouillées par un test de contrat. Une route qui
          changerait de forme sans que le test change avec elle ne passe pas la
          vérification locale.
        </p>
        <p className="tech-machine">
          <TrackedAnchor
            href="/.well-known/adama-os.json"
            event={EVENT_PROOF_PACK}
            properties={{ source: "technique" }}
          >
            Le registre des preuves, lisible par un programme
          </TrackedAnchor>
          <a href="/llms.txt">Le site décrit en texte simple</a>
        </p>
      </section>

      {/* 6. TESTS ET VERIFICATION */}
      <section className="tech-section" id="tests">
        <h2>Tests et vérification</h2>
        <p className="tech-lede">
          {s.test_cases} cas répartis sur {s.test_files} fichiers. Ils ne
          couvrent pas le rendu visuel, et c’est délibéré : un test d’animation
          ou de mise en page casse à chaque retouche, pour aucun gain.
        </p>
        <ul className="tech-coverage">
          <li>La récupération documentaire, et son refus sans source.</li>
          <li>
            Les règles de sécurité au niveau des lignes, sur base de test.
          </li>
          <li>L’absence de tout repli chiffré dans l’interface.</li>
          <li>
            La mention de traitement automatisé, sa présence et son texte.
          </li>
          <li>La forme des réponses des routes publiques.</li>
          <li>Le garde-fou de débit de l’assistant.</li>
          <li>La convention des liens sortants.</li>
          <li>La purge du consentement en cas de refus.</li>
          <li>La dégradation des passerelles vers les produits.</li>
          <li>Le fait qu’aucun nœud de la carte ne soit écrit en dur.</li>
        </ul>

        <div className="tech-ci">
          <p className="tech-ci-label">DÉCISION DOCUMENTÉE</p>
          <h3>Il n’y a pas d’intégration continue.</h3>
          <p>
            Aucun automate ne construit ni ne teste ce dépôt à chaque envoi. Le
            quota du service d’automatisation est épuisé, et je n’ai pas voulu
            le remplacer par un outil de plus.
          </p>
          <p>
            La vérification se fait en local, avant chaque envoi, par une seule
            séquence : inventaire, typage, tests, analyse statique, puis
            construction de production. Elle s’arrête à la première erreur.
          </p>
          <p className="tech-command">
            <span aria-hidden="true">$</span> ./scripts/check-frontend.ps1
          </p>
          <p>
            La conséquence est réelle et je ne la maquille pas : cette
            discipline dépend de moi. C’est aussi pourquoi aucune fréquence de
            déploiement, aucun délai de mise en production et aucun taux d’échec
            ne sont publiés sur ce site. Ces valeurs ne sont pas mesurées ici,
            et elles seraient d’autant plus crédibles qu’elles portent des noms
            connus.
          </p>
          <p>
            Aucun pourcentage de couverture n’est revendiqué non plus. Un
            pourcentage de couverture mesure les lignes traversées, pas les
            comportements tenus.
          </p>
        </div>
      </section>

      {/* 7. EXPLOITATION ET CONTINUITE */}
      <section className="tech-section" id="exploitation">
        <h2>Exploitation et continuité</h2>
        <p className="tech-lede">
          Exécution en région européenne, en-têtes de sécurité posés au niveau
          du déploiement, journalisation des erreurs et sonde de disponibilité
          externe. Trois outils d’observation, et pas un quatrième.
        </p>
        <IntegrityPanel rapport={integrite} />
        <p className="tech-note">
          {restauration
            ? `Dernier test de restauration : ${new Intl.DateTimeFormat(
                "fr-FR",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                },
              ).format(new Date(restauration.executedAt))}, ${
                restauration.result === "reussi" ? "réussi" : "échoué"
              }, sur ${restauration.tables} tables, ${restauration.scope}.`
            : "Aucun test de restauration n’a encore été enregistré. Tant que cette ligne est vide, la politique de sauvegarde est une intention, et le site le dit."}{" "}
          Une sauvegarde non testée n’est pas une sauvegarde.
        </p>
        <p>
          L’état vivant de chaque capacité, et les huit façons dont ce site peut
          tomber, sont sur{" "}
          <Link href="/systeme/pannes">la page de santé et de pannes</Link>.
        </p>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">L’AUTRE PORTE</p>
          <h2>
            Vous cherchez plutôt{" "}
            <span className="serif">un profil à recruter ?</span>
          </h2>
          <p>
            Le même dossier, lu dans l’autre sens : ce que je cherche, ce que je
            sais faire, et sous quel délai.
          </p>
        </div>
        <Link href="/recruteur" className="portfolio-button primary">
          Ouvrir le parcours recruteur <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

/** Un score a deux decimales, ecrit comme un lecteur francais l'ecrit. */
function virgule(valeur: number): string {
  return valeur.toFixed(2).replace(".", ",");
}

/** Libelles des routes publiques. Une route inconnue se declare inconnue. */
function descriptionRoute(route: string): string {
  const table: Record<string, string> = {
    "/api/metrics": "Les métriques système publiées, avec leur classe.",
    "/api/decisions": "Les décisions d’architecture publiées et relues.",
    "/api/trajectory": "La trajectoire, telle qu’elle est publiée.",
    "/api/ecosystem": "Le registre des produits, sans le nom des dépôts.",
    "/api/chat": "L’assistant documentaire, en flux, avec ses sources.",
    "/.well-known/adama-os.json":
      "Le registre des affirmations et de leurs preuves.",
    "/llms.txt": "Le site décrit en texte simple, pour un agent.",
    "/api/lettre":
      "Les liens de la lettre SIGNAL : confirmation et désinscription. Elle ne publie aucune donnée.",
    "/auth/callback":
      "La reprise d’un lien de connexion. Elle ne publie aucune donnée.",
  };
  return table[route] ?? "Route non documentée sur cette page.";
}

function comportementRoute(route: string): string {
  if (route === "/api/chat") {
    return "503, et aucune réponse produite sans source.";
  }
  if (route === "/api/lettre") {
    return "Redirection vers /lettre, avec l’état en clair ; 503 pour la désinscription en un clic si la lettre n’est pas configurée.";
  }
  if (route.startsWith("/api/")) {
    return "503, avec la raison en clair.";
  }
  // Cette route ne sert pas de document : elle redirige. Lui appliquer la
  // phrase des documents servis annoncerait un comportement qu'elle n'a pas.
  if (route === "/auth/callback") {
    return "Redirection interne, avec la raison en clair si le lien échoue.";
  }
  return "Document servi, champs vides plutôt qu’inventés.";
}
