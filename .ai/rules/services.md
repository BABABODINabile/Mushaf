---
paths:
  - app/Services/BackgroundCommandRunner.php
  - 'app/Services/**'
---

# Services

## Commandes admin : exécution détachée + whitelist stricte
L'onglet Commandes (/admin/commands) lance les commandes mushaf:* en arrière-plan via BackgroundCommandRunner (nohup + log dans storage/logs/commands/, ligne finale "exit:N" pour le statut). Toujours ajouter toute nouvelle commande à config/commands.php (whitelist) : `--no-interaction` est forcé, les options inconnues sont rejetées (InvalidArgumentException). Ne pas exécuter de commandes libres depuis le Web.

## Strip the Bismillah prefix glued onto first verses
In the DB, verse 1 of every surah (except 9) has the Bismillah glued onto the real first verse; a few (95, 97) use a ب+shadda+kasra «بِّ» variant. Keep it only for Al-Fatiha where the Bismillah IS verse 1. The shadda must precede the kasra (U+0651 then U+0650) — visually identical strings still fail ===, so compare by exact codepoints. Use QuranText::firstAyahLabel() (also applied to verse 1 on the surah reading page); it is NOT duplicated in QuizGenerator anymore.
