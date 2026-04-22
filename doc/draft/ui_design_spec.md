# UI / UX & Artistic Direction --- Incremental Logistics Game

## 🎯 Purpose of this document

This document defines the **complete visual, UI, and UX expectations**
for the game. It is written to be interpreted and executed by an AI or
developer.

The goal is: - Clean - Modern - Highly readable - Extremely satisfying
in idle

------------------------------------------------------------------------

# 🧭 CORE DESIGN PRINCIPLE

> The player must enjoy watching the system run without interacting.

The UI must: - Be readable in \< 2 seconds - Show progression visually
(not only numerically) - Feel alive at all times

------------------------------------------------------------------------

# 🌐 LANGUAGE & COPY SYSTEM

- V1 language: French (`fr-FR`) only.
- All UI/UX texts must come from a centralized text catalog (keys -> labels/messages).
- No hardcoded display strings in components/views.
- Future locale support target:
  - adding a new language should be done by translating a locale catalog file
  - no structural UI refactor should be required

------------------------------------------------------------------------

# 🖥️ GLOBAL LAYOUT

## Structure (Desktop-first)

-   Left column: Stats panel (fixed width)
-   Center: Warehouse simulation (main focus)
-   Upgrade controls are integrated directly in warehouse hotspots (no separate bottom upgrade bar)
-   No dedicated top gameplay title bar in game view; title/subtitle and primary actions are integrated in the stats panel
-   Warehouse area has no additional card header (no `Simulation entrepot` title/subtitle block)
-   Stats panel and warehouse area are visually adjacent (no large spacing gap)
-   Warehouse area is docked to the top of the game viewport and framed with an industrial hazard border
-   On game view, warehouse + border must fill viewport height (`100dvh`) and page must not scroll

Layout priority: - 70% visual simulation - 20% stats - 10% overlays/interactions

Menu principal (entree du jeu) :

- CTA visibles au premier ecran :
  - `Continuer` (visible seulement si une sauvegarde existe)
  - `Nouvelle partie`
  - `Charger`
- Import de sauvegarde disponible dans la popup `Charger`
- Liste des sauvegardes avec actions par slot :
  - `Jouer`
  - `Exporter`
  - `Supprimer` (avec confirmation explicite)
- Etats UI obligatoires :
  - aucune sauvegarde
  - sauvegarde corrompue
  - echec de migration
  - import invalide

------------------------------------------------------------------------

# 🏭 CENTRAL VIEW --- WAREHOUSE SIMULATION

## Requirements

-   Top-down simplified view
-   Grid-based layout
-   No realism required
-   Must be readable at a glance
-   V1 uses the warehouse reference asset as simulation background (`assets/warehouse_v1.png` -> served in app as `public/warehouse_v1.png`)
-   Interactive regional hotspots are mandatory on top of the background:
    - employees
    - scan
    - sorting
    - conveyors
    - shipping
-   Each region triggers the corresponding gameplay action (quick upgrade purchase)

## Elements to display

-   Entry zone
-   Scanner zone
-   Sorting area
-   Conveyor belts
-   Output/loading zone
-   Trucks

## Dynamic behavior

-   Packages move continuously
-   Speed depends on upgrades
-   Density increases over time
-   More employees appear visually
-   Activity must never feel static

------------------------------------------------------------------------

# 🎨 COLOR SYSTEM

## Base colors

-   Background: #F4F6F8
-   Panels: #FFFFFF
-   Borders: #E1E5EA

## Functional colors

-   Primary: #2F80ED
-   Success: #27AE60
-   Warning: #F2994A
-   Error: #EB5757

## Warehouse colors

-   Floor: #EDEFF2
-   Conveyor: #6C757D
-   Packages: #DFAF67
-   Active zones: #56CCF2
-   Trucks: #333333

## Rule

90% neutral colors, 10% accent colors

------------------------------------------------------------------------

# 🧩 VISUAL STYLE

-   Flat design
-   Industrial UI accents for controls and overlays
-   Hard edge geometry on interactive elements (no rounded corners for buttons)
-   Strong hard shadows for actionable controls
-   Gradients allowed on controls/popup surfaces if they reinforce the industrial look
-   No visual noise

Shadow example (controls): box-shadow: 4px 4px 0 rgba(32,40,50,1);

------------------------------------------------------------------------

# 🔘 GLOBAL BUTTON SYSTEM (MANDATORY)

- All game buttons must use the same industrial style system (home + in-game + popups).
- Visual requirements:
  - square corners (`border-radius: 0`)
  - strong border and hard shadow
  - condensed/technical typography feel (uppercase recommended)
  - clear pressed state
  - geometric hover motion (slight translate/skew)
- Variants allowed:
  - primary
  - danger
  - ghost
- Variants must keep the same core industrial geometry and interaction behavior.

------------------------------------------------------------------------

# 🧷 ICON SYSTEM (MANDATORY)

- UI icons must use Font Awesome Free collection in v1.
- Project dependency reference: `@fortawesome/fontawesome-free`.
- Prefer `fa-solid` style for gameplay and action affordances.
- Icon-only buttons are allowed (example: close `xmark`, download `download`, delete `trash-can`) but must expose an accessible label sourced from the text catalog.
- If no suitable icon exists in the free set, fallback to text label instead of mixing icon packs.

------------------------------------------------------------------------

# 📦 ANIMATION SYSTEM (CRITICAL)

## Required animations

### Packages

-   Move continuously along paths
-   Speed tied to gameplay

### Conveyor belts

-   Background scrolling animation

### Trucks

-   Spawn → wait → leave

### UI feedback

-   Numbers increment smoothly
-   Hover: slight geometric shift (translate/skew) on interactive controls
-   Click: quick flash
-   All success/error feedback notifications must use a global toast system (top-right)

### Toast system (mandatory)

-   Single global toast stack, positioned top-right of the viewport
-   All gameplay/menu notifications must go through this stack (`save`, `upgrade`, `skill`, `errors`, etc.)
-   Industrial style rules:
    - hard corners
    - strong border + hard shadow
    - compact framed look
    - technical inner frame + rivet-like corner accents (instead of a top stripe band)
-   Toast background must remain neutral (no green/red/blue full-surface backgrounds)
-   Toast width must adapt to its content with a safe max width on small screens
-   Toast content must be vertically centered
-   Toast entrance animation: slide-in from the right screen edge
-   Toasts must be non-blocking and auto-dismiss after a short duration

## Timing

-   Transitions: 150--250ms
-   Continuous animations must be smooth (no stutter)

------------------------------------------------------------------------

# 📊 STATS PANEL

## Content

-   Packages/sec
-   €/sec
-   Employees / capacity
-   Tick duration
-   Next warehouse cost
-   Compact action buttons:
    - `Competences`
    - `Demenager`
    - `Retour au menu`

## Rules

-   Large font for key values
-   Minimal text
-   Always visible
-   Buttons in stats panel must be compact and ergonomic (reduced footprint, clear hierarchy, readable in one glance)
-   Stats panel should be density-optimized (reduced margins/paddings/fonts)
-   In-game stats sidebar uses a single-column compact list (one stat per line)
-   Action buttons order/layout in sidebar:
    - `Competences` first
    - `Demenager` directly below
    - a small spacing before the stats list
    - `Retour au menu` as footer action under the stats list
-   Sidebar width should remain as narrow as possible to maximize warehouse surface

------------------------------------------------------------------------

# 🧱 UPGRADE HOTSPOTS (MANDATORY)

## Structure

Each hotspot must contain (default visible): - Icon - Title - Current level

On hover/focus, the hotspot must reveal: - Functional description sentence of the upgrade (what it does in gameplay terms) - Current/next effect - Cost - Availability feedback (blocked reason or buy action)

## Behavior

-   Hover/focus: reveal detailed upgrade info
-   Click: immediate attempt to purchase corresponding upgrade
-   Blocked state: visually muted but still informative (reason shown in details)

------------------------------------------------------------------------

# 🪟 POPUPS & OVERLAYS

## General rule

Avoid blocking gameplay unless necessary.

Global popup design system (mandatory):

- Same industrial visual language across all popups/modals in the app.
- Overlay backdrop should have a strong workshop/industrial mood (darkened + structured texture allowed).
- Popup surface requirements:
  - hard corners
  - hard border + marked shadow
  - optional hazard/stripe top accent
  - title displayed in an industrial framed badge, slightly offset above the popup top border (mandatory for all popups, including `Charger`)
  - title badge must stay visually above the top stripe/accent (no overlap clipping)
  - popup close action must be a top-right icon button (`xmark`), not a text close button
  - no horizontal scrolling inside popups/modals
  - validation action buttons aligned on the right side
  - strong visual hierarchy for key values and CTA

Form controls inside popups:

- Labels must use industrial styling (framed, uppercase, technical look).
- Inputs must use industrial styling (hard corners, strong border, clear focus state).
- Label and input should be visually attached/stacked with minimal gap.
- Labels and inputs must be visually consistent with button and popup systems.

------------------------------------------------------------------------

## Warehouse upgrade screen

Full-screen overlay with: - Title - New capacity - Skill point reward -
Single primary button

Background must be blurred.

------------------------------------------------------------------------

## Skill tree screen

-   Separate overlay
-   Dark transparent background
-   Popup height fixed to `95vh`, vertically centered in viewport
-   One skill branch card per row (single-column list)
-   Click to unlock
-   Tooltip on hover
-   Branche offline:
    - un seul skill de branche (`Resilience offline`)
    - chaque niveau augmente en meme temps l'efficacite offline et la duree max
-   Branche cachee `Optimisation non conventionnelle` :
    - visible/debloquable uniquement apres completion totale des 7 branches principales (35/35)

------------------------------------------------------------------------

## Offline report popup (mandatory)

Shown when player returns online or loads a save after offline period.

Display rules:

-   Show only if offline duration is above 2 minutes
-   Show only if computed offline rewards are greater than 0
-   Show once per session resume/load event

Content:

-   Title: "Résumé offline"
-   Offline time counted
-   Packages dispatched during offline period
-   Euros earned during offline period
-   Single primary button: "Continuer"

Visual rules:

-   Modal centered, readable in less than 2 seconds
-   Strong value hierarchy (earned € and dispatched packages emphasized)
-   No extra secondary actions

------------------------------------------------------------------------

# 🔤 TYPOGRAPHY

-   Base font: readable sans-serif
-   Controls/buttons: condensed technical sans-serif style (industrial feel)
-   Titles: 20--24px
-   Stats: 28--36px
-   Body: 14--16px

Text must always be readable without effort.

------------------------------------------------------------------------

# 🖼️ AI ASSET GENERATION

## Icons

Prompt examples: - "minimal flat warehouse worker icon" - "flat conveyor
belt icon clean UI" - "logistics scanner icon modern minimal"

Usage: - Upgrade hotspots

------------------------------------------------------------------------

## Warehouse modules

Prompt examples: - "top down warehouse conveyor belt flat design" -
"sorting station top view minimal"

Usage: - Decorative elements in simulation

------------------------------------------------------------------------

## Trucks

Prompt: - "top view delivery truck flat minimal"

Usage: - Animated in output zone

------------------------------------------------------------------------

## Packages

Prompt: - "simple cardboard box icon top view flat"

Can also be generated via CSS.

------------------------------------------------------------------------

# 🧠 UX PRINCIPLES

-   Immediate feedback on every action
-   No unnecessary clicks
-   Always show progression
-   No hidden information
-   Visual \> textual feedback

------------------------------------------------------------------------

# ❌ DO NOT

-   Use too many colors
-   Add complex UI structures
-   Block the main simulation
-   Overuse animations
-   Add long texts

------------------------------------------------------------------------

# ✅ SUCCESS CRITERIA

The UI is successful if: - Player understands system instantly - Player
enjoys watching it idle - Player clearly sees progression - Player wants
to keep the tab open

------------------------------------------------------------------------

End of document.
