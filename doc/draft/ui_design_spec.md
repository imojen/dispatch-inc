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

# 🖥️ GLOBAL LAYOUT

## Structure (Desktop-first)

-   Left column: Stats panel (fixed width)
-   Center: Warehouse simulation (main focus)
-   Bottom: Upgrade cards

Layout priority: - 60% visual simulation - 20% stats - 20% interactions

------------------------------------------------------------------------

# 🏭 CENTRAL VIEW --- WAREHOUSE SIMULATION

## Requirements

-   Top-down simplified view
-   Grid-based layout
-   No realism required
-   Must be readable at a glance

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
-   Rounded corners (8--12px)
-   Soft shadows only
-   No gradients unless subtle
-   No visual noise

Shadow example: box-shadow: 0 4px 12px rgba(0,0,0,0.05);

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
-   Hover: scale 1.03
-   Click: quick flash

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

## Rules

-   Large font for key values
-   Minimal text
-   Always visible

------------------------------------------------------------------------

# 🧱 UPGRADE CARDS

## Structure

Each card must contain: - Icon - Title - Current level/value - Cost -
Short effect description

## Behavior

-   Hover: highlight + slight scale
-   Click: immediate feedback
-   Disabled: visually muted

------------------------------------------------------------------------

# 🪟 POPUPS & OVERLAYS

## General rule

Avoid blocking gameplay unless necessary.

------------------------------------------------------------------------

## Warehouse upgrade screen

Full-screen overlay with: - Title - New capacity - Skill point reward -
Single primary button

Background must be blurred.

------------------------------------------------------------------------

## Skill tree screen

-   Separate overlay
-   Dark transparent background
-   Node-based layout
-   Click to unlock
-   Tooltip on hover

------------------------------------------------------------------------

# 🔤 TYPOGRAPHY

-   Font: Inter or Roboto
-   Titles: 20--24px
-   Stats: 28--36px
-   Body: 14--16px

Text must always be readable without effort.

------------------------------------------------------------------------

# 🖼️ AI ASSET GENERATION

## Icons

Prompt examples: - "minimal flat warehouse worker icon" - "flat conveyor
belt icon clean UI" - "logistics scanner icon modern minimal"

Usage: - Upgrade cards

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
