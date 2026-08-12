# Corpus RAG, adama.ai

Ce dossier alimente la base vectorielle lue par `adama.ai` (couche L3). Les
documents eux-memes ne sont **pas** versionnes : les normes ne se redistribuent
pas, et un PDF de norme pese plus lourd que tout le reste du depot. Seul ce
fichier est suivi par git.

## Ce qu'il faut deposer ici

| Fichier attendu | Source | Pourquoi il est dans le corpus |
| --- | --- | --- |
| Standard VSME | EFRAG, standard volontaire PME | C'est la norme que le simulateur de la Couche D met en oeuvre. Sans elle, l'agent ne peut pas justifier un seul de ses resultats. |
| ESRS, jeu complet des standards | EFRAG, et acte delegue publie sur EUR-Lex | Socle reglementaire de tout le discours CSRD du dashboard. |
| CV a jour | Local | L'agent doit repondre sur le parcours sans inventer. C'est la moitie des questions d'un recruteur. |
| Notice methodologique | Local, a ecrire | Explique comment les scores sont calcules et d'ou viennent les facteurs d'emission. C'est ce qui separe une demonstration d'une affirmation. |

Formats acceptes : PDF et texte. L'extraction passe par `unpdf`, en local, sans
appel reseau ni cout par page.

## Ingerer un document

Trois lignes, depuis la racine du depot :

```powershell
# 1. Deposer le fichier dans corpus/
# 2. Verifier que packages\db\.env contient DATABASE_URL et OPENAI_API_KEY
pnpm --filter @adama/db rag:ingest -- corpus\vsme.pdf --source VSME --lang fr --title "Standard VSME"
```

`--source` est obligatoire (`ESRS`, `VSME`, `CV`, `METHODO`). `--lang` vaut `fr`
par defaut, `--title` reprend le nom du fichier si on ne le donne pas.

L'ingestion est idempotente : reingerer le meme couple source plus titre
remplace les chunks existants au lieu de les dupliquer. On peut donc relancer
sans nettoyer la table.

## Regle de tenue

Un document ajoute ici sans etre ingere ne sert a rien, et un document ingere
qui n'est plus dans ce tableau devient une source fantome que personne ne peut
verifier. Les deux vont ensemble.
