# UI / UX & Artistic Direction --- Incremental Logistics Game

## 🎯 Purpose of this document

This document defines the **complete visual, UI, and UX expectations**
for the game. It is written to be interpreted and executed by an AI or
developer.

The goal is: - Retro terminal / Minitel - Highly readable - Playful industrial console - Extremely satisfying
in idle

------------------------------------------------------------------------

# 🧭 CORE DESIGN PRINCIPLE

> The player must enjoy watching the system run as if operating an old industrial terminal.

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

## Structure (Vertical-first)

-   Single column layout
-   Top header: large terminal frame with system label + action keys + `Entrepot niveau X`
-   Under header: compact terminal stats modules (`Euros / sec`, `Colis / sec`, `Equipe`, `Cadence`) with secondary values on each module
-   Upgrade controls are displayed below as a direct vertical list of terminal rows
-   Once the warehouse package objective is reached, the stat bar and upgrade list disappear and are replaced by a clear migration call-to-action state
-   No dedicated left stats column in game view
-   Footer: persistent terminal log / command hint bar
-   Main panel is docked to the top of the viewport with a clean neutral surface
-   On game view, the main panel must fill viewport height (`100dvh`) and page must not scroll

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

# 🏭 CENTRAL VIEW --- HOTSPOT CONTROL PANEL

## Requirements

-   No warehouse background asset in V1
-   No regional overlay / positioned zones in V1
-   Display a simple explicit list: one entry per hotspot / upgrade
-   Must be readable at a glance
-   Each list entry triggers the corresponding gameplay action (quick upgrade purchase)
-   The panel can later host a redesigned simulation, but the interaction model must stay list-first for now

## Elements to display

-   Employees
-   Scanners
-   Conveyors
-   Carts / sorting
-   Trucks / shipping

## Dynamic behavior

-   No animated warehouse scene is required for this phase
-   Focus on clarity, upgrade readability, and fast action feedback

------------------------------------------------------------------------

# 🎨 COLOR SYSTEM

## Base colors

-   Background: #020403
-   Panels: #020403 / very dark green-black
-   Borders: rgba(60,255,122,0.4)

## Functional colors

-   Primary phosphor: #3CFF7A
-   Secondary phosphor: #1F8F4F
-   Warning / blocked: #FF5F3C
-   Error: #FF5F3C

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

-   Official direction: retro terminal / Minitel / ASCII
-   Monospace typography everywhere in game view
-   Uppercase headers and labels
-   CRT-inspired scanlines and subtle phosphor glow are allowed
-   Use frame lines, separators, and pseudo-ASCII composition instead of SaaS cards
-   No visual noise outside the terminal fantasy
-   Forbidden:
    - white cards
    - rounded modern dashboard buttons
    - glassmorphism
    - SaaS gradients
    - soft modern drop shadows

------------------------------------------------------------------------

# 🔘 GLOBAL BUTTON SYSTEM (MANDATORY)

- All game buttons must use the same terminal command style system (home + in-game + popups).
- Visual requirements:
  - square corners (`border-radius: 0`)
  - thin phosphor outline
  - monospace typography
  - clear pressed state
  - restrained hover motion or line highlight
  - command phrasing preferred: `[A] ACHETER`, `[Q] QUITTER`
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
-   Terminal style rules:
    - dark background
    - phosphor text
    - thin green border
    - no modern notification styling
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

-   Terminal stat modules must expose:
    - `Euros / sec` + total euros
    - `Colis / sec` + total colis
    - `Equipe` + employees/capacity
    - `Cadence` + tick duration + next warehouse package objective

Example spirit:

`┌──────────────┬──────────────┬──────────────┬──────────────┐`
`│ EUROS / SEC  │ COLIS / SEC  │ EQUIPE       │ CADENCE      │`
`│ 10           │ 0            │ 0 / 10       │ 1000 MS      │`
`│ TOTAL: 10    │ TOTAL: 0     │ CAP: 10      │ NEXT: 1K     │`
`└──────────────┴──────────────┴──────────────┴──────────────┘`
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

Each hotspot/list entry must contain (default visible): - Icon - Title - Current level

Each hotspot/list entry must also expose: - Functional description sentence of the upgrade (what it does in gameplay terms) - Current/next effect - Cost - Availability feedback (blocked reason, unlock action, or buy action)

Run unlock rule:
- `Employees` is always available
- `Scanners`, `Conveyors`, `Carts`, and `Trucks` start each run locked
- a locked row must display a one-time run unlock cost
- once unlocked, the row switches back to normal purchase mode for the rest of the run
- after warehouse reset / relocation, non-employee upgrades lock again

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
