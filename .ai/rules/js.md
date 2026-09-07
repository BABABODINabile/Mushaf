---
paths:
  - resources/js/app.jsx
---

# Js

## Pas de usePage dans les providers globaux de app.jsx
Les providers globaux montés dans withApp (app.jsx) enveloppent le composant Inertia <App> : ils sont DONC hors contexte Inertia et ne peuvent pas appeler usePage(). Pour accéder aux props de page, usePage() renvoie `page.props.auth` à passer en prop du provider (comme AudioProvider).
