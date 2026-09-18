---
paths:
  - resources/js/app.jsx
  - 'resources/js/**'
---

# Js

## Pas de usePage dans les providers globaux de app.jsx
Les providers globaux montés dans withApp (app.jsx) enveloppent le composant Inertia <App> : ils sont DONC hors contexte Inertia et ne peuvent pas appeler usePage(). Pour accéder aux props de page, usePage() renvoie `page.props.auth` à passer en prop du provider (comme AudioProvider).

## Hidjri : Intl navigateur (Umm al-Qura), pas le serveur PHP
L'extension intl du serveur PHP n'a AUCUN calendrier islamique compilé (islamic-umalqura/islamic-civil retombent silencieusement sur grégorien) — vérifié. Le calendrier hidjri de l'accueil (resources/js/lib/hijri.js + components/HijriCalendar.jsx) est donc calculé côté navigateur via Intl.DateTimeFormat({calendar:'islamic-umalqura'}), en UTC pour rester cohérent avec le « jour » UTC du reste de l'app (DailyContent). Le rendu SSR affiche un squellette puis le vrai calendrier après montage (évite le mismatch d'hydratation). Numérotation forcée par locale (-u-nu-arab pour ar, -u-nu-latn sinon) car le défaut varie selon l'ICU hôte. Ne pas régresser vers un calcul PHP/ICU.
