# Corpus RAG, adama.ai

Ce dossier alimente la base vectorielle lue par `adama.ai` (couche L3). Les
documents eux-memes ne sont **pas** versionnes : les normes ne se redistribuent
pas, et un PDF de norme pese plus lourd que tout le reste du depot. Seul ce
fichier est suivi par git.

## Ce qu'il faut deposer ici

| Fichier               | Source                                    | Etat au 31 aout 2026          | Pourquoi il est dans le corpus                                                                                                               |
| --------------------- | ----------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `vsme-standard.pdf`   | EFRAG, standard volontaire PME            | ingere, 66 p., 168 chunks     | C'est la norme que le simulateur de la Couche D met en oeuvre. Sans elle, l'agent ne peut pas justifier un seul de ses resultats.            |
| `cv-adama-diallo.pdf` | Local, version Conseil 2 pages            | ingere, 2 p., 5 chunks        | L'agent doit repondre sur le parcours sans inventer. C'est la moitie des questions d'un recruteur.                                           |
| `esrs-set1.pdf`       | EUR-Lex, reglement delegue (UE) 2023/2772 | depose, **pas encore ingere** | Socle reglementaire de tout le discours CSRD du dashboard. Version FR officielle au Journal officiel, 284 pages.                             |
| Notice methodologique | Local, a ecrire                           | absente                       | Explique comment les scores sont calcules et d'ou viennent les facteurs d'emission. C'est ce qui separe une demonstration d'une affirmation. |

**Terminologie a connaitre.** Le texte francais officiel des ESRS ne dit jamais
« double materialite » : il dit **« double importance »**, et la section 3 d'ESRS 1
s'intitule « La double importance, fondement de la publication d'informations en
matiere de durabilite ». Une question posee avec le mot « materialite » ne matche
donc aucun terme du corpus et ne tient que sur la proximite semantique des
embeddings. C'est le cas de la deuxieme question de `rag:verify`.

Formats acceptes : PDF et texte. L'extraction passe par `unpdf`, en local, sans
appel reseau ni cout par page.

## Ingerer un document

Trois lignes, depuis la racine du depot :

```powershell
# 1. Deposer le fichier dans corpus/
# 2. Verifier que packages\db\.env contient DATABASE_URL et OPENAI_API_KEY reels
pnpm --filter @adama/db rag:ingest -- ..\..\corpus\vsme.pdf --source VSME --lang fr --title "Standard VSME"
```

**Le chemin du fichier part de `packages\db`, pas de la racine.** `pnpm --filter`
execute le script avec ce dossier comme repertoire courant, d'ou le `..\..\`.
Un chemin absolu marche aussi. Sans cela : `ENOENT: no such file or directory,
open 'C:\Dev\adama-os\packages\db\corpus\...'`.

`--source` est obligatoire (`ESRS`, `VSME`, `CV`, `METHODO`). `--lang` vaut `fr`
par defaut, `--title` reprend le nom du fichier si on ne le donne pas.

L'ingestion est idempotente : reingerer le meme couple source plus titre
remplace les chunks existants au lieu de les dupliquer. On peut donc relancer
sans nettoyer la table.

## Corpus minimal viable, et ce qu'il coute

Ordre de grandeur, calcule avec les parametres reels du pipeline : environ
1100 caracteres par chunk, soit a peu pres 275 tokens, et le modele
`text-embedding-3-small` tronque a 1024 dimensions.

| Document              | Pages | Chunks estimes | Tokens estimes |
| --------------------- | ----- | -------------- | -------------- |
| Standard VSME         | ~60   | ~110           | ~30 000        |
| ESRS, jeu complet     | ~800  | ~1 450         | ~400 000       |
| CV a jour             | 2     | ~5             | ~1 400         |
| Notice methodologique | ~5    | ~15            | ~4 000         |
| **Total**             |       | **~1 580**     | **~435 000**   |

Au tarif public de `text-embedding-3-small`, l'ingestion complete revient a
**moins d'un centime d'euro**. Le cout n'est donc jamais une raison de ne pas
reingerer : ce qui coute, c'est le temps de telechargement des normes.

Pour une demonstration credible en entretien, le minimum est **VSME + CV** :
la premiere justifie le simulateur de la Couche D, le second couvre la moitie
des questions d'un recruteur. Les ESRS complets viennent ensuite.

## Verifier apres ingestion

```powershell
pnpm --filter @adama/db rag:verify
```

Trois questions types sont posees a la base : une sur le VSME, une sur les
ESRS, une sur le parcours. Le script affiche les sources trouvees et leur score
de similarite, et **sort en code 1** si une seule question ne ramene aucune
source. C'est le garde-fou a passer avant toute demonstration : un agent muet
doit faire echouer une commande, pas sourire.

On peut aussi poser ses propres questions :

```powershell
pnpm --filter @adama/db rag:verify -- "Qu'est-ce que la double materialite ?"
```

## Ajouter un document, en trois lignes

1. deposer le fichier dans `corpus/` ;
2. `pnpm --filter @adama/db rag:ingest -- ..\..\corpus\<fichier> --source <SOURCE> --lang fr --title "<Titre>"` ;
3. `pnpm --filter @adama/db rag:verify`, puis ajouter la ligne au tableau du haut.

## Regle de tenue

Un document ajoute ici sans etre ingere ne sert a rien, et un document ingere
qui n'est plus dans ce tableau devient une source fantome que personne ne peut
verifier. Les deux vont ensemble.
