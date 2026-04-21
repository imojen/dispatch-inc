# Main Menu Flows --- Dispatch Inc.

## Purpose

Specifier les parcours utilisateur du menu d'accueil centré sauvegardes.

## Product Decisions (v1)

- Entree du jeu via menu principal, pas directement en run.
- Actions primaires visibles en premier ecran:
  - `Nouvelle partie`
  - `Charger`
  - `Importer`
- Export et suppression accessibles depuis la liste des slots.
- Labels de runs dupliques autorises (avec metadata pour distinguer).

## Primary Screen Layout

Zones:
- hero titre + resume de progression globale
- CTA principal `Nouvelle partie`
- CTA secondaire `Charger`
- CTA tertiaire `Importer`
- quick list des derniers slots (si existants)

## Flow: Nouvelle partie

1. Click `Nouvelle partie`
2. Modal creation:
  - champ `Nom de la partie` (optionnel)
  - bouton `Creer`
3. Use-case `createNewSave`:
  - genere `id`
  - initialise `GameStateDto` de base
  - ecrit payload + index
  - positionne slot actif
4. Navigation vers `GamePage`

Validation:
- si label vide -> fallback `Partie <date/heure>`
- si echec write -> toast erreur + rester sur menu

## Flow: Charger

1. Click `Charger`
2. Ouvrir vue liste slots
3. Afficher par slot:
  - label
  - date creation
  - dernier jeu
  - version save
4. Actions par slot:
  - `Jouer`
  - `Exporter`
  - `Supprimer`
5. `Jouer`:
  - use-case `loadSave`
  - migration si necessaire
  - navigation `GamePage`

Tri par defaut:
- `lastPlayedAt` desc

## Flow: Importer

1. Click `Importer`
2. Ouvrir file picker JSON
3. Use-case `importSave`:
  - parse + validate schema
  - resolve id collision
  - migrate if needed
  - write payload + index
4. Retour liste slots avec nouveau slot surligne

## Flow: Exporter

Accessible depuis la liste slots (action par ligne).

1. Click `Exporter`
2. Use-case `exportSave`
3. Telechargement fichier:
   `dispatchinc-save-<label>-<yyyy-mm-dd>.json`
4. Feedback succes/erreur

## Flow: Supprimer slot

1. Click `Supprimer`
2. Confirmation explicite:
  - message risque de perte
  - boutons `Annuler` / `Supprimer`
3. Use-case `deleteSave`
4. Remove payload + index entry

Cas special slot actif:
- Si slot actif supprime depuis menu, actif devient `undefined`.
- Si dernier slot supprime, retour etat "aucune sauvegarde".

## Empty and Error States

### No saves

- Message: "Aucune sauvegarde locale"
- CTA principal: `Nouvelle partie`
- CTA secondaire: `Importer`

### Corrupted save

- Slot badge `Corrompue`
- Actions: `Exporter brut` / `Supprimer`
- `Jouer` desactive

### Migration failure

- Message detaille: version detectee + version supportee
- Actions: `Exporter brut` / `Supprimer`

### Import invalid

- Message erreur first-failure
- Aucun write partiel

## UX Rules

- Toute action critique affiche un feedback immediat.
- Ne jamais bloquer l'utilisateur sans action de recovery.
- Les actions destructrices demandent confirmation.
- Pas de popup superflue sur actions triviales.

## Telemetry (optional v1+)

- `menu_new_run_clicked`
- `menu_load_slot_clicked`
- `menu_import_success` / `menu_import_failure`
- `menu_delete_slot_confirmed`
