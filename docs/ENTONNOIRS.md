# Les quatre entonnoirs, écran par écran

> Écrit le 2 septembre 2026 (couche C13-T2). Configuration **manuelle**, dans
> l'interface de l'outil de mesure. Ce document existe pour que ce geste ne
> se fasse pas de mémoire.

## Blocage préalable, levé le 12 septembre 2026

Le compte de mesure d'audience était hébergé hors de l'Union européenne. La
contradiction est tranchée par l'option A de `docs/POSTHOG-REGION.md` : la clé
de production est acceptée par `eu.i.posthog.com` et refusée par l'hôte
américain. L'entrée `region-analytique` est retirée du registre des limites
connues (décision XDEC-36). Les entonnoirs se configurent dans le projet UE,
et dans aucun autre.

## Les noms d'événements, source unique

Ils vivent dans `apps/web/lib/analytics-events.ts` et **nulle part ailleurs**.
`apps/web/tests/analytics-events.test.ts` échoue si un événement est émis sans
y figurer.

Une faute de frappe dans un nom recopié produit un entonnoir vide, qui
ressemble exactement à un parcours que personne n'emprunte. C'est la pire
erreur de mesure possible, parce qu'elle se conclut au lieu de s'apercevoir.
**Copier les noms depuis le fichier, jamais depuis ce document.**

| Événement                | Émis quand                                           |
| ------------------------ | ---------------------------------------------------- |
| `recruiter_modal_opened` | la modale de contact s'ouvre                         |
| `recruiter_intent`       | une intention est déclarée dans la modale            |
| `recruiter_cv_download`  | le CV est téléchargé, quelle que soit sa provenance  |
| `recruiter_cal_opened`   | le calendrier de rendez-vous est ouvert              |
| `recruiter_view_print`   | le parcours recruteur est envoyé à l'impression      |
| `ecosystem_outbound`     | une sortie vers un produit du groupe                 |
| `strata_outbound`        | double émission historique, à retirer, voir plus bas |
| `proof_verify_opened`    | une page de vérification s'affiche                   |
| `adr_opened`             | une page de décision s'affiche                       |
| `build_log_raw`          | le journal s'affiche en vue brute                    |
| `technique_opened`       | la vue technique s'affiche                           |
| `proof_pack_download`    | le document machine est ouvert                       |

Les cinq derniers sont ajoutés par la couche C13. Les événements de page sont
émis **à l'affichage** et non au clic : ce qu'on veut savoir, c'est qui EST
ALLÉ vérifier, pas qui a survolé un lien.

## Entonnoir 1, recrutement

L'entonnoir principal. Il mesure le parcours d'un recruteur, de l'arrivée à
la prise de contact.

```
1  Page vue           /recruteur
2  recruiter_modal_opened
3  recruiter_intent
4  recruiter_cv_download  OU  recruiter_cal_opened
```

Configuration : fenêtre de conversion **7 jours**, étape 4 en **union** des
deux événements, et non en deux entonnoirs séparés. Un recruteur qui
télécharge le CV et un recruteur qui réserve un créneau ont fait la même
chose : ils ont donné suite.

Ce que l'entonnoir dit, et ce qu'il ne dit pas. Une chute entre 1 et 2
signale que la page ne donne pas envie d'écrire. Une chute entre 3 et 4
signale l'inverse : l'intention est là et le geste final coûte trop cher.
Aucun des deux ne se corrige en changeant une couleur de bouton.

## Entonnoir 2, technique

```
1  Page vue           /  ou  /projets/<slug>
2  technique_opened
3  adr_opened
4  ecosystem_outbound  (propriété source = "technique" ou "layer-d")
```

Fenêtre **3 jours**. Ce lecteur lit d'une traite ou ne lit pas.

Étape 3 en option : un ingénieur qui va de la vue technique au dépôt sans
passer par une décision n'a pas échoué, il a simplement voulu voir le code.
Configurer l'étape 3 comme obligatoire ferait passer ce parcours pour un
abandon.

## Entonnoir 3, produit

```
1  Page vue           /ecosysteme
2  ecosystem_outbound
```

Deux étapes, et c'est volontaire. Ventiler par la propriété `division` puis
par `product` : ce qui intéresse ici, c'est **quel** produit attire, pas
combien de visiteurs sortent.

Fenêtre **1 jour**.

## Entonnoir 4, preuve

Celui-ci est spécifique à ce site, et c'est le plus intéressant des quatre.

```
1  Page vue           n'importe laquelle
2  proof_verify_opened
```

Il mesure une chose qu'aucun portfolio ne mesure : **combien de visiteurs
prennent la peine de vérifier une affirmation**. Aucun portfolio ne le mesure
parce qu'aucun ne propose de le faire.

Ventiler par la propriété `claim`, pour savoir QUELLES affirmations sont
vérifiées. Une affirmation souvent vérifiée est une affirmation qu'on ne
croit pas sur parole, et c'est une information éditoriale, pas seulement une
information de mesure.

Un second entonnoir de la même famille mérite d'être configuré :

```
1  Page vue           /journal
2  build_log_raw
```

Il mesure la même chose sous un autre angle : combien de lecteurs basculent
en vue brute pour voir les messages de commit tels quels.

## Retrait de la double émission, échéance 30 septembre 2026

`strata_outbound` est émis en parallèle de `ecosystem_outbound` depuis le
recentrage du 19 juillet 2026, pour ne pas trouer l'historique des tableaux
déjà construits. La date de retrait est écrite dans
`apps/web/lib/outbound.ts` et le correctif est préparé dans
`docs/RETRAIT-DOUBLE-EMISSION.md`.

**Avant le 30 septembre 2026** : vérifier qu'aucun tableau ni entonnoir ne
pointe encore sur `strata_outbound`, puis appliquer le correctif.

## Ce qu'il ne faut pas configurer

- Aucun entonnoir dans le compte hors région tant que la contradiction dure.
- Aucun enregistrement de session, aucune carte de chaleur : ce sont des
  collectes d'un autre ordre, que la page de confidentialité n'annonce pas.
- Aucun identifiant de personne. La mesure compte des parcours, elle
  n'identifie pas un visiteur.
- Aucun entonnoir sur un parcours qui change encore. Mesurer un chemin qui
  bouge produit une courbe qui décrit les modifications, pas les visiteurs.
