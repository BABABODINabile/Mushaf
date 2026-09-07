---
paths:
  - app/Services/BackgroundCommandRunner.php
---

# Services

## Commandes admin : exécution détachée + whitelist stricte
L'onglet Commandes (/admin/commands) lance les commandes mushaf:* en arrière-plan via BackgroundCommandRunner (nohup + log dans storage/logs/commands/, ligne finale "exit:N" pour le statut). Toujours ajouter toute nouvelle commande à config/commands.php (whitelist) : `--no-interaction` est forcé, les options inconnues sont rejetées (InvalidArgumentException). Ne pas exécuter de commandes libres depuis le Web.
