---
paths:
  - 'tests/**, database/factories/*.php'
---

# Factories

## Surah doit toujours avoir un slug
La colonne surahs.slug est NOT NULL + unique depuis 2026_09_10_171857. Toute création de Surah (tests via Surah::create direct, ou factory) doit fournir un slug unique. Convention en test: 'surah-'.$number. Ne jamais se fier à un auto-slug, le modèle n'en génère pas.
