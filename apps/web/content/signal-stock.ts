import type { ContenuEdition } from "../lib/lettre/editions";

// =====================================================================
// EX1, le stock éditorial de SIGNAL, numéros 001 à 010.
//
// Rédigé et relu le 17 septembre 2026 (page Notion « EX1, stock complet
// SIGNAL #001 à #010 »), puis repris le 7 novembre 2026 avant le premier
// envoi :
//   - #001 change de Signal : le règlement sur l’intelligence artificielle
//     cède la place à la directive (UE) 2024/825, parce qu’aucune surface
//     publique d’ADAMA OS ne parle d’intelligence artificielle ;
//   - #002 est réécrit sur le même principe, autour du registre des
//     décisions ;
//   - #003 ne cite plus l’identifiant du projet de base de données ;
//   - les sources sortent du texte du Signal et deviennent un champ.
//
// Ce fichier n’envoie rien. La console de la lettre l’importe en
// brouillons non relus ; rien ne part sans la relecture cochée d’Adama.
// Le test tests/lettre-editions.test.ts passe chaque numéro au contrôle
// complet d’une édition.
// =====================================================================

export const STOCK_SIGNAL: readonly ContenuEdition[] = [
  {
    numero: 1,
    fr: {
      titre: "Preuve plutôt que promesse",
      signal:
        "La directive (UE) 2024/825 sur les consommateurs et la transition verte s’applique dans les États membres à partir du 27 septembre 2026. Une allégation environnementale générique, « vert » ou « respectueux de l’environnement », ne peut plus être faite sans une performance environnementale reconnue et démontrée. Une promesse ne suffit plus : il faut la preuve.",
      systeme:
        "Un système crédible commence par ses sources, ses règles, ses états d’échec et ses preuves. L’interface ne montre que ce que les couches précédentes ont établi. La vitesse ne justifie jamais une affirmation sans origine.",
      decision:
        "L’absence vaut mieux que l’invention. Les replis chiffrés, les compteurs décoratifs et les réponses de mémoire sont écartés.",
      construction:
        "Sur adamesg-os.fr, chaque affirmation publique est reliée à une preuve datée. Une preuve absente ou périmée s’affiche comme telle, jamais remplacée par un chiffre. Le registre des décisions et les modes de panne sont publics.",
      idee: "Ouvrir un registre public de chaque affirmation importante. Condition : une source, une date et un propriétaire par ligne.",
      source:
        "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024L0825",
    },
    en: {
      titre: "Proof over promise",
      signal:
        "Directive (EU) 2024/825 on empowering consumers for the green transition applies in Member States from 27 September 2026. A generic environmental claim such as “green” or “eco-friendly” can no longer be made without recognised, demonstrated environmental performance. A promise is no longer enough: it takes proof.",
      systeme:
        "A credible system starts with sources, rules, failure states and evidence. The interface shows only what previous layers established. Speed never justifies an unsupported claim.",
      decision:
        "Absence is better than invention. Numeric fallbacks, decorative counters and memory-based answers are rejected.",
      construction:
        "On adamesg-os.fr, every public claim is tied to dated evidence. Missing or stale evidence is shown as such, never replaced by a number. The decision register and failure modes are public.",
      idee: "Open a public register for important claims. Condition: every line needs a source, a date and an owner.",
      source:
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0825",
    },
  },
  {
    numero: 2,
    fr: {
      titre: "Une décision a un propriétaire",
      signal:
        "En novembre 2011, Michael Nygard propose de consigner chaque décision d’architecture dans une fiche courte : le contexte, la décision, son statut et ses conséquences. Une décision non écrite se rejoue à chaque réunion, et personne ne sait plus qui l’a prise.",
      systeme:
        "Un registre sépare ce qui est proposé de ce qui est décidé. Une proposition peut venir de n’importe où ; une décision a un responsable, une date et un statut, et elle dit ce qu’elle écarte.",
      decision:
        "Ici, une proposition ne devient décision que lorsqu’un responsable la signe. Une décision qui change ne s’efface pas : elle est remplacée par une autre, et le lien entre les deux reste visible.",
      construction:
        "Le registre public des décisions est en ligne sur adamesg-os.fr/decisions, avec les titres, les statuts et les règles de revirement. La page adamesg-os.fr/revirements montre ce sur quoi je suis revenu, et pourquoi.",
      idee: "Mesurer les revirements justifiés, pas seulement les décisions prises. Condition : garder le motif de chaque revirement, sans aucune donnée de client.",
      source:
        "https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions",
    },
    en: {
      titre: "A decision has an owner",
      signal:
        "In November 2011, Michael Nygard proposed recording each architecture decision in a short note: context, decision, status and consequences. An unwritten decision is replayed in every meeting, and nobody remembers who made it.",
      systeme:
        "A register separates what is proposed from what is decided. A proposal can come from anywhere; a decision has an owner, a date and a status, and it says what it rules out.",
      decision:
        "Here, a proposal becomes a decision only when an owner signs it. A decision that changes is never erased: it is superseded by another, and the link between the two stays visible.",
      construction:
        "The public decision register is online at adamesg-os.fr/decisions, with titles, statuses and reversal rules. The page adamesg-os.fr/revirements shows what I went back on, and why.",
      idee: "Measure justified reversals, not only decisions made. Condition: keep the reason for each reversal, with no client data.",
      source:
        "https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions",
    },
  },
  {
    numero: 3,
    fr: {
      titre: "Séparer les surfaces et les responsabilités",
      signal:
        "La CNIL rappelle que la protection des données doit être prise en compte dès la conception et que la minimisation limite les données à ce qui est nécessaire.",
      systeme:
        "Une surface publique, une base métier et une liste d’abonnés n’ont pas le même propriétaire. Les séparer réduit le rayon d’une erreur et rend la restauration compréhensible.",
      decision:
        "SIGNAL possède une base dédiée, séparée de celle des produits. Les adresses ne viennent pas de STRATA ESG et n’y retournent pas.",
      construction:
        "La base de la lettre a la sécurité au niveau des lignes active sur chacune de ses tables, aucune politique ouverte au public, et l’empreinte de chaque migration est conservée.",
      idee: "Cartographier aussi les archives et les exports. Condition : un propriétaire, une durée et un test de restauration pour chaque copie.",
      source:
        "https://www.cnil.fr/fr/tenir-compte-de-la-protection-des-donnees-dans-la-conception-du-systeme",
    },
    en: {
      titre: "Separate surfaces and responsibilities",
      signal:
        "CNIL states that data protection must be considered from design and that minimisation limits data to what is necessary.",
      systeme:
        "A public surface, a product database and a subscriber list do not share an owner. Separation limits the blast radius and makes recovery understandable.",
      decision:
        "SIGNAL has a dedicated database, separate from the products. Addresses do not come from STRATA ESG and never go back there.",
      construction:
        "The letter database has row-level security enabled on every table, no policy open to the public, and the fingerprint of every migration is retained.",
      idee: "Map archives and exports too. Condition: an owner, a retention period and a restore test for every copy.",
      source: "https://www.cnil.fr/en/data-protection-designed",
    },
  },
  {
    numero: 4,
    fr: {
      titre: "Le consentement se prouve",
      signal:
        "L’EDPB décrit le consentement comme libre, spécifique, éclairé et univoque. Une case cochée sans preuve de ce qui a été lu ne suffit pas.",
      systeme:
        "Un consentement est un objet versionné : le texte présenté, la demande, la confirmation et le retrait. Partir doit être aussi simple qu’entrer.",
      decision:
        "SIGNAL applique la double confirmation et le désabonnement en un clic. Aucun pistage d’ouverture ni de clic n’est activé.",
      construction:
        "Le parcours a été testé dans une vraie messagerie : confirmation, authentification SPF, DKIM et DMARC, bienvenue, désinscription et réinscription. La collecte a ensuite été refermée.",
      idee: "Publier une fiche pour chaque version de consentement. Condition : la version doit pointer vers sa migration.",
      source:
        "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en",
    },
    en: {
      titre: "Consent must be provable",
      signal:
        "The EDPB describes consent as freely given, specific, informed and unambiguous. A checked box without a record of what was read does not prove consent.",
      systeme:
        "Consent is versioned: presented text, request, confirmation and withdrawal. Leaving must be as easy as joining.",
      decision:
        "SIGNAL uses double confirmation and one-click unsubscribe. Open and click tracking are disabled.",
      construction:
        "The flow was tested in a real mailbox: confirmation, SPF, DKIM and DMARC authentication, welcome, unsubscribe and resubscription. Collection was then closed.",
      idee: "Publish a sheet for each consent version. Condition: link the version to its migration.",
      source:
        "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en",
    },
  },
  {
    numero: 5,
    fr: {
      titre: "Une erreur de production devient une règle",
      signal:
        "OWASP rappelle qu’un journal utile permet de reconstruire une séquence d’actions attribuable et vérifiable.",
      systeme:
        "Une panne doit distinguer absence, dégradation et inconnue, puis nommer ce qui n’a jamais été fait. La correction doit être reproductible.",
      decision:
        "Une clé d’accès refusée a été traitée comme un état de déploiement à diagnostiquer, pas comme une donnée vide.",
      construction:
        "La clé de service de la lettre a été supprimée et recréée, puis la route a été vérifiée avant la fermeture de la collecte.",
      idee: "Ajouter une fiche de rejeu à chaque incident. Condition : le rejeu doit fonctionner sans secret réel.",
      source:
        "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html",
    },
    en: {
      titre: "A production error becomes a rule",
      signal:
        "OWASP notes that useful logging should support reconstruction of an attributable and verifiable sequence of events.",
      systeme:
        "A failure must distinguish absence, degradation and unknown state, and record forbidden actions. The fix must be reproducible.",
      decision:
        "A rejected access key was treated as a deployment state to diagnose, not as empty data.",
      construction:
        "The letter’s service key was removed and recreated, then the route was checked before collection was closed.",
      idee: "Add a replay sheet to every incident. Condition: replay without the real secret.",
      source:
        "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html",
    },
  },
  {
    numero: 6,
    fr: {
      titre: "Une publication doit survivre à sa date",
      signal:
        "Le NIST SSDF recommande d’intégrer les pratiques sécurisées dans le cycle de vie logiciel afin de traiter les causes, pas seulement les symptômes.",
      systeme:
        "Une édition doit porter un numéro, une version, ses sources, sa preuve et l’historique de ses corrections. Six mois plus tard, elle doit rester compréhensible.",
      decision:
        "SIGNAL numérote à vie. Une correction ne crée pas un nouveau numéro. Une version anglaise ne crée pas une seconde édition.",
      construction:
        "Chaque numéro paru a sa page sur adamesg-os.fr/lettre, en français et en anglais, avec sa version et le motif de chaque correction. Le contenu est séparé de la plomberie d’envoi.",
      idee: "Montrer le texte d’avant à côté de chaque correction. Condition : la correction garde son motif et sa date.",
      source: "https://csrc.nist.gov/pubs/sp/800/218/r1/final",
    },
    en: {
      titre: "A publication must outlive its date",
      signal:
        "NIST SSDF recommends secure development practices across the software lifecycle to address causes, not only symptoms.",
      systeme:
        "An edition needs a number, a version, sources, evidence and a correction history. Six months later it should remain understandable.",
      decision:
        "SIGNAL uses lifetime numbering. A correction does not create a new number. An English version does not create a second edition.",
      construction:
        "Every published issue has its page on adamesg-os.fr/lettre, in French and English, with its version and the reason for each correction. Content is separate from the sending plumbing.",
      idee: "Show the previous text next to each correction. Condition: the correction keeps its reason and date.",
      source: "https://csrc.nist.gov/pubs/sp/800/218/r1/final",
    },
  },
  {
    numero: 7,
    fr: {
      titre: "La source avant le chiffre",
      signal:
        "Le RGPD exige des données licites, loyales, transparentes, adéquates, pertinentes et limitées au nécessaire. Un chiffre sans source n’est pas une preuve.",
      systeme:
        "Chaque indicateur doit porter sa provenance, sa période, son unité et son état. Une absence de mesure ne devient jamais zéro.",
      decision:
        "Les compteurs de remplacement et les moyennes sur séries trouées sont écartés. Une source indisponible reste visible.",
      construction:
        "Les modes de panne du site, produit injoignable, sortie réseau coupée et base indisponible, définissent chacun leur effet visible et les actions interdites.",
      idee: "Ajouter une fiche de provenance à chaque métrique publique. Condition : un propriétaire et une date de collecte.",
      source:
        "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679",
    },
    en: {
      titre: "The source before the number",
      signal:
        "The GDPR requires data to be lawful, fair, transparent, adequate, relevant and limited to what is necessary. A number without a source is not evidence.",
      systeme:
        "Every metric needs provenance, period, unit and state. A missing measurement never becomes zero.",
      decision:
        "Fallback counters and averages over incomplete series are rejected. An unavailable source remains visible.",
      construction:
        "The site’s failure modes, product unreachable, network outage and database unavailable, each define their visible effect and forbidden actions.",
      idee: "Add a provenance sheet to every public metric. Condition: an owner and a collection date.",
      source:
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679",
    },
  },
  {
    numero: 8,
    fr: {
      titre: "Le rythme lent protège le système",
      signal:
        "Vercel documente les tâches planifiées comme des déclenchements automatiques à configurer et vérifier dans le projet déployé. Une automatisation ouvre une fenêtre ; elle ne crée pas une édition.",
      systeme:
        "Une lettre toutes les deux semaines laisse le temps de sourcer, écrire, relire et couper. Le calendrier ne doit pas devenir une promesse de contenu.",
      decision:
        "SIGNAL paraît toutes les deux semaines. L’entretien technique quotidien est séparé de l’envoi éditorial. Si le temps manque, l’édition attend.",
      construction:
        "La route d’entretien de la liste existe, exige un secret, et ne sait pas envoyer d’édition. L’envoi d’un numéro est un geste humain, depuis la console, après relecture.",
      idee: "Publier un journal des reports. Condition : le numéro prévu est conservé, sans réutilisation.",
      source: "https://vercel.com/docs/cron-jobs",
    },
    en: {
      titre: "A slow rhythm protects the system",
      signal:
        "Vercel documents scheduled tasks as automatic triggers that must be configured and verified in the deployed project. Automation opens a window; it does not create an edition.",
      systeme:
        "A letter every two weeks leaves room for sourcing, writing, review and cutting. The calendar is not a content promise.",
      decision:
        "SIGNAL runs every two weeks. Daily maintenance is separate from editorial sending. If time is missing, the edition waits.",
      construction:
        "The list maintenance route exists, requires a secret, and cannot send an edition. Sending an issue is a human act, from the console, after review.",
      idee: "Publish a postponement log. Condition: keep the planned number without reuse.",
      source: "https://vercel.com/docs/cron-jobs",
    },
  },
  {
    numero: 9,
    fr: {
      titre: "L’infrastructure doit être vérifiable",
      signal:
        "Resend documente la vérification d’un domaine d’envoi par des enregistrements DNS qui authentifient le domaine. La délivrabilité est une chaîne de preuves.",
      systeme:
        "Il faut distinguer le domaine, l’identité, l’authentification, la clé d’accès et la preuve de réception. Chaque maillon a son propre contrôle.",
      decision:
        "SIGNAL part de lettre.adamesg-os.fr, sans aucun suivi, avec une clé limitée à ce domaine. L’enregistrement SPF de la racine reste inchangé.",
      construction:
        "Le domaine d’envoi est vérifié, les enregistrements DNS ont été relus, et une vraie messagerie a confirmé SPF, DKIM et DMARC en succès.",
      idee: "Ajouter une vérification périodique de la chaîne DNS. Condition : aucune clé ne doit apparaître dans la preuve.",
      source: "https://resend.com/docs/dashboard/domains/introduction",
    },
    en: {
      titre: "Infrastructure must be verifiable",
      signal:
        "Resend documents sending-domain verification through DNS records that authenticate the domain. Deliverability is a chain of evidence.",
      systeme:
        "Domain, identity, authentication, access key and receipt evidence must be kept distinct. Each link needs its own check.",
      decision:
        "SIGNAL is sent from lettre.adamesg-os.fr, with tracking disabled and a key restricted to that domain. The root SPF record remains unchanged.",
      construction:
        "The sending domain is verified, the DNS records were checked, and a real mailbox confirmed SPF, DKIM and DMARC passing.",
      idee: "Add a periodic check of the DNS chain. Condition: no key appears in the evidence.",
      source: "https://resend.com/docs/dashboard/domains/introduction",
    },
  },
  {
    numero: 10,
    fr: {
      titre: "Ce que les neuf numéros précédents ont changé",
      signal:
        "Supabase documente la sécurité au niveau des lignes comme le mécanisme qui limite l’accès aux lignes selon l’appelant. Une base protégée doit exprimer qui peut lire quoi.",
      systeme:
        "Dix éditions valent par la trace entre fait, décision, construction et idée. Le dixième numéro compare la règle de départ avec ce que les neuf précédents ont réellement produit.",
      decision:
        "La réussite ne se mesure ni aux ouvertures ni aux clics. Elle se mesure aux sources présentes, aux preuves compréhensibles, aux corrections visibles et à la cadence tenue.",
      construction:
        "Les dix numéros sont en ligne, chacun avec sa version et ses corrections. La base, le consentement, le domaine et la désinscription tiennent depuis le premier envoi.",
      idee: "Faire de ce numéro une revue publique. Condition : les neuf précédents gardent leurs sources, leurs corrections et leurs preuves.",
      source:
        "https://supabase.com/docs/guides/database/postgres/row-level-security",
    },
    en: {
      titre: "What the previous nine issues changed",
      signal:
        "Supabase documents row-level security as the mechanism that restricts row access according to the caller. A protected database must express who can read what.",
      systeme:
        "Ten editions matter because of the trace between fact, decision, build and idea. Issue ten compares the initial rule with what the previous nine actually produced.",
      decision:
        "Success is not measured by opens or clicks. It is measured by sources present, understandable evidence, visible corrections and sustained cadence.",
      construction:
        "All ten issues are online, each with its version and corrections. The database, consent, domain and unsubscribe flow have held since the first send.",
      idee: "Make this issue a public review. Condition: the previous nine keep their sources, corrections and evidence.",
      source:
        "https://supabase.com/docs/guides/database/postgres/row-level-security",
    },
  },
] as const;
