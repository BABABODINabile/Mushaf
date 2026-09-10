---
paths:
  - 'git/**'
---

# Git

## Découper un fichier en commits : blob + update-index plutôt que git apply --cached
Pour staguer une partie seulement d'un fichier (commits thématiques), `git apply --cached` sur des hunks partiels échoue souvent (offsets, newline finale, multi-hunks). Fiable : construire le contenu intermédiaire par remplacement Python exact depuis `git show HEAD:chemin`, l'écrire, puis `git hash-object -w` + `git update-index --cacheinfo 100644,<sha>,<chemin>`. Vérifier ensuite `git diff --cached` (uniquement les changements voulus) puis `git add` le fichier complet pour le dernier commit.
