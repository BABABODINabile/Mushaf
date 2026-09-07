---
paths:
  - resources/js/hooks/useSelectable.js
---

# Hooks

## useSelectable est limité au dataset visible
La sélection multiple ne persiste plus (pas de localStorage). Elle est réinitialisée dès que la liste visible change (pagination/recherche/filtre) via un reset synchrone basé sur la signature des IDs de la page courante, afin que le badge "X sélectionnés" reste synchronisé avec les cases cochées à l'écran.
