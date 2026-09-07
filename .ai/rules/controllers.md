---
paths:
  - app/Http/Controllers/QuizController.php
---

# Controllers

## Classement quiz hebdomadaire par user
Classement hebdo : groupe par user_id, meilleur score = MAX(correct_answers) DESC puis MIN(duration_seconds) ASC (ordre en second temps uniquement en cas d'égalité du meilleur score). Le rang perso compte le nombre de joueurs strictement meilleurs + 1. weeklyLeaderboard() renvoie une liste de max 10 avec `isMe`.

## Compter les bonnes réponses du quiz
Dans submit(), le total correct = count(array_filter($perQuestion, fn ($q) => $q['correct'])). Un simple count(array_filter($perQuestion)) compterait aussi les réponses fausses (chaque élément du tableau est truthy) et renverrait toujours correct == total.
