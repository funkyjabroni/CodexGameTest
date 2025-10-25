# Design Notes

## Creative pillars

* **Aurora loom aesthetic** – iridescent fiberpunk visuals made entirely from procedural canvas geometry.
* **Crew banter in crisis** – Kyle leads Logan, Kellum, Ethan, Hoff with short flavorful captions reinforcing character.
* **Rhythmic weaving combat** – constant pulse attacks with timing windows for dodge and aim skill.
* **Weave the roguelite meta** – unlock relics with meta threads to subtly shift each run.

## Systems overview

* **Engine** – modular ES modules under `src/engine/` handle the render loop, ECS, tweens, particles, audio, input, and saves.
* **Gameplay** – `src/game/` contains data-driven configs, AI behaviors, procedural wave generator, and boss patterns.
* **UI** – `src/ui/` builds HUD, menus, and accessibility controls. `ui/menus.js` drives flow for title, pause, settings, and game over.
* **Diagnostics** – `src/dev/` includes a debug overlay toggle (`~`) and a browser-friendly test harness.

## Enemy roster & behaviors

1. **Prism Gnats** – fast swarmers that harry the player, encouraging kiting.
2. **Loom Stalkers** – telegraphed dash enemies; wind-up phase followed by rapid charge.
3. **Echo Menders** – support units periodically healing allies, forcing target priority decisions.

## Boss: The Snarl

A multi-phase knot of light shifting patterns as health drops:

* **Spirals** – radial volleys of projectiles.
* **Rifts** – directional tears with heavier shots.
* **Overload** – frantic omnidirectional bursts.

## Procedural flow

* `worldgen.generateWave` uses the seeded RNG to assemble enemy mixes for each wave budget.
* Wave timers escalate difficulty until The Snarl appears.
* Player projectiles and enemy behaviors rely on deterministic vectors given the seed.

## Meta progression

* Runs award **meta threads** on victory.
* Title menu allows spending threads to unlock relics (movement, health, energy boosts) persisted in `localStorage`.
* Player stats apply unlocked bonuses in `spawnPlayer`.

## Accessibility & UX

* Color-blind-safe palette swaps.
* Adjustable screen shake and flash intensity.
* Captions for major cues displayed in HUD.
* Keyboard-only play with fully rebindable controls.
* Pause menu available at any time (auto-pause on focus loss).

## Extensibility hooks

* Add new enemies/boss phases in `config.js` and `ai.js` without modifying engine code.
* Additional relics can be appended to the `relics` array and automatically surface in the title menu.
* Debug overlay exposes entity counts to watch for performance regressions.
