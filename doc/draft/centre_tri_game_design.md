# Incremental Game Design --- Centre de Tri de Colis

## 🎮 Concept

Jeu incrémental idle où le joueur gère un centre de tri de colis.\
Objectif : traiter toujours plus de colis pour gagner de l'argent et
déménager vers des entrepôts plus grands.

------------------------------------------------------------------------

## 🔄 Boucle de jeu

1.  Produire des colis automatiquement
2.  Gagner de l'argent (€)
3.  Acheter des améliorations
4.  Atteindre un plafond de progression
5.  Acheter un nouvel entrepôt (reset)
6.  Gagner 1 point de compétence
7.  Recommencer avec de meilleures capacités

------------------------------------------------------------------------

## ⏱️ Temps

-   1 tick = 1 seconde (base)
-   Modifiable via améliorations

------------------------------------------------------------------------

## 🌙 Mode offline

Le jeu passe en mode offline si :

-   le navigateur est fermé
-   ou l'onglet est inactif depuis plus de **2 minutes**

Règle de base (sans compétence offline) :

-   les employés produisent à **20%** de leur efficacité
-   durée maximale de rendement offline : **1 heure**
-   au-delà, plus aucun rendement offline

La branche de compétence offline permet d'augmenter :

-   le pourcentage d'efficacité offline
-   la durée maximale de rendement offline

Au niveau max de la branche :

-   efficacité offline = **100%**
-   durée max offline = **6 heures**

Au retour online (ou au chargement d'une sauvegarde), une popup de bilan
offline doit s'afficher avec :

-   durée offline retenue pour le calcul
-   nombre de colis dispatchés pendant la période
-   euros gagnés pendant la période

------------------------------------------------------------------------

## 💰 Économie

-   1 colis livré = 1€
-   Capital de depart d'une nouvelle partie : **10€** (achat du premier employe possible immediatement)
-   Le compteur de colis dispatches est affiche en entier (pas de colis fractionnaire visible)
-   Production basée sur :
    -   volume (employés)
    -   efficacité (scanners)
    -   vitesse (tapis)
    -   organisation (chariots)
    -   valeur (€) (camions)

------------------------------------------------------------------------

## 🧱 Système de production

Règle UX v1:
- chaque upgrade du warehouse doit exposer une phrase de description textuelle (dans le détail du hotspot) expliquant clairement son impact gameplay.

### 👷 Employés

-   1 employé = 1 colis/tick
-   Coût : 10€, 15€, 22€, 33€, ...
-   Limité par taille entrepôt

------------------------------------------------------------------------

### 🔍 Scanners

-   Bonus efficacité global

Ex : - Niveau 1 : +10% - Niveau 2 : +20%

------------------------------------------------------------------------

### 🟨 Tapis roulants

-   Accélèrent le tick

Ex : - Niveau 1 : 1s → 0.9s - Niveau 2 : 0.9s → 0.8s

Effet gameplay attendu :
-   une hausse du tickrate augmente directement le throughput (`colis/sec` et `€/sec`)

------------------------------------------------------------------------

### 🛒 Chariots de tri

-   Ajout de flux parallèles

Ex : - 1 chariot : +20% production - 2 chariots : +40%

------------------------------------------------------------------------

### 🚚 Camions d'expédition

-   Augmentent la valeur des colis

Ex : - Niveau 1 : x1.2 - Niveau 2 : x1.5

------------------------------------------------------------------------

## 🧮 Formule simplifiée

Colis/sec = Employés × (1 + bonus scanners) × bonus chariots × tickrate\
€/sec = Colis/sec × multiplicateur camions\
Tick = modifié par tapis roulants

------------------------------------------------------------------------

## 🏢 Entrepôts (exemple)

  Niveau   Coût       Capacité employés
  -------- ---------- -------------------
  1        \-         5
  2        1 000€     10
  3        10 000€    20
  4        100 000€   40

------------------------------------------------------------------------

## 🔄 Reset --- Déménagement

Quand un nouvel entrepôt est acheté :

-   Reset complet :
    -   argent = 0
    -   améliorations = 0
    -   employés = 0
-   Gain :
    -   +1 point de compétence

------------------------------------------------------------------------

## 🌳 Compétences (exemples)

-   +10% efficacité employés
-   +5% vitesse tapis
-   +10% valeur colis
-   +10% efficacité scanners
-   +efficacité et +durée en mode offline

------------------------------------------------------------------------

## 🎯 Objectif

Optimiser le centre pour atteindre plus rapidement le prochain entrepôt
et débloquer davantage de puissance.

------------------------------------------------------------------------

## 🧠 Résumé

-   Idle dominant
-   Améliorations concrètes
-   Reset logique (déménagement)
-   Progression cumulative
