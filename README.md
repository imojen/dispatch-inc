# Tester le projet

**Lien de test:** [https://imojen.github.io/dispatch-inc/](https://imojen.github.io/dispatch-inc/)

## Dispatch Inc.

Dispatch Inc. est un jeu incrémental de gestion logistique en Vue 3 + TypeScript.
Le joueur y incarne le superviseur d’un hub de tri, pilote la production, débloque des améliorations run par run, déménage vers des entrepôts plus grands et construit une progression permanente via les compétences.

Le projet mélange :
- une boucle idle / incremental
- une direction artistique terminal rétro / Minitel / CRT
- une architecture DDD avec catalogue de balance centralisé
- un système de sauvegardes locales multi-slots

## Ce qu’on fait dans le jeu

- lancer la production du hub avec les premiers employés
- acheter et débloquer les modules de l’entrepôt
- augmenter les `colis/sec` et les `€/sec`
- atteindre un objectif de colis pour débloquer le déménagement suivant
- repartir à zéro dans un entrepôt plus grand
- gagner des points de compétence permanents entre les runs

## Points clés du projet

- UI rétro terminal / phosphore verte
- progression data-driven via [src/data/balance/catalog.v1.ts](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/src/data/balance/catalog.v1.ts)
- simulation déterministe avec gestion de l’absence du superviseur
- popups, feedbacks et écran de jeu pensés pour une lecture rapide
- déploiement automatique sur GitHub Pages

## Stack technique

- Vue 3
- TypeScript
- Vite
- Pinia
- Vitest
- ESLint

## Lancer le projet en local

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
```

Qualité :

```bash
npm run lint
npm run typecheck
npm run test
```

## Déploiement GitHub Pages

Le repo contient maintenant un workflow GitHub Actions dans [deploy-pages.yml](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/.github/workflows/deploy-pages.yml).

À chaque push sur `main`, il :
- installe les dépendances
- lance le lint
- lance les tests
- build l’application
- publie `dist/` sur GitHub Pages

Le routeur a été configuré pour GitHub Pages avec un historique en hash, et Vite utilise la base `/dispatch-inc/`.

## Structure utile

- [src/presentation](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/src/presentation) : pages, stores, UI
- [src/application](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/src/application) : use-cases, DTOs, ports
- [src/domain](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/src/domain) : logique métier pure
- [src/infrastructure](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/src/infrastructure) : persistence, adaptateurs, catalogues
- [doc/draft](/mnt/c/Users/Papounet/Desktop/nico/apps/dispatchinc/doc/draft) : vision produit, règles UX/UI, design et architecture

## Vision

L’objectif du projet n’est pas seulement de faire un idle game, mais de construire un petit jeu de gestion lisible, satisfaisant et facile à faire évoluer :
- balance pilotée par catalogue
- runs courtes et compréhensibles
- montée en puissance permanente
- identité visuelle forte

## Repository

- GitHub : [imojen/dispatch-inc](https://github.com/imojen/dispatch-inc)
