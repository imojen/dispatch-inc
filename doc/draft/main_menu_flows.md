# Main Menu Flows --- Dispatch Inc.

## Purpose

Specifier les parcours utilisateur du menu d'accueil centré sauvegardes.

## Product Decisions (v1)

- Entree du jeu via menu principal, pas directement en run.
- Actions primaires visibles en premier ecran:
  - `Continuer` (visible uniquement si au moins une sauvegarde existe)
  - `Nouvelle partie`
  - `Charger`
- Export et suppression accessibles depuis la liste des slots.
- Import accessible depuis la popup `Charger`.
- Labels de runs dupliques autorises (avec metadata pour distinguer).

## Primary Screen Layout

Zones:
- logo `Dispatch Inc.`
- stack des CTA:
  - `Continuer` (conditionnel)
  - `Nouvelle partie`
  - `Charger`
- feedback inline succes/erreur

Comportement d'entree directe sur `/game` :
- si une sauvegarde existe, charger automatiquement la plus recente (equivalent `Continuer`)
- sinon, rester sur l'etat "Aucune session active. Chargez ou creez une partie."

## Flow: Continuer

1. Click `Continuer`
2. Selection implicite de la sauvegarde la plus recente (`lastPlayedAt` desc)
3. Use-case `loadSave`
4. Application offline progress si delta offline > seuil
5. Popup de bilan offline si gains > 0
6. Navigation `GamePage`

Validation:
- bouton non affiche si aucune save
- si aucune save trouvee a l'execution -> erreur `save.error.notFound`

## Flow: Nouvelle partie

1. Click `Nouvelle partie`
2. Modal creation:
  - champ `Nom de la partie` (obligatoire)
  - valeur par defaut proposee: `Dispatch Inc - Corp try # <save_count>`
  - bouton `Lancer`
3. Use-case `createNewSave`:
  - genere `id`
  - initialise `GameStateDto` de base avec `10€` de capital de depart (pour acheter le premier employe)
  - ecrit payload + index
  - positionne slot actif
4. Navigation vers `GamePage`

Validation:
- si label vide -> `Lancer` desactive
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
  - appliquer offline progress si `lastSeenAt` depasse le seuil offline
  - afficher popup de bilan offline si gain > 0
  - navigation `GamePage`

Tri par defaut:
- `lastPlayedAt` desc

## Flow: Importer

1. Click `Charger`
2. Click `Importer`
3. Ouvrir file picker JSON
4. Use-case `importSave`:
  - parse + validate schema
  - resolve id collision
  - migrate if needed
  - write payload + index
5. Retour liste slots avec nouveau slot surligne

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
- CTA secondaire: `Charger`

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

### Offline report popup (post-load / return online)

- Afficher une seule fois par reprise session quand applicable
- Conditions d'affichage:
  - delta offline > 2 minutes
  - gains offline > 0
- Contenu minimum:
  - temps offline comptabilise
  - colis dispatches offline
  - euros gagnes offline
- CTA: `Continuer`

## UX Rules

- Toute action critique affiche un feedback immediat.
- Ne jamais bloquer l'utilisateur sans action de recovery.
- Les actions destructrices demandent confirmation.
- Pas de popup superflue sur actions triviales.
- Tous les libelles/messages de l'ecran proviennent du catalogue de textes central (`fr-FR` en v1).

## Telemetry (optional v1+)

- `menu_continue_clicked`
- `menu_new_run_clicked`
- `menu_load_slot_clicked`
- `menu_import_success` / `menu_import_failure`
- `menu_delete_slot_confirmed`
