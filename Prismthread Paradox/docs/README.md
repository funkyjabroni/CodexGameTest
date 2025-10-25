# Prismthread Paradox

Prismthread Paradox is a solo arcade roguelite woven from iridescent fiberpunk threads. Guide Kyle and the crew (Logan, Kellum, Ethan, Hoff) as they stabilize the solar loom using WASD movement and rhythmic pulses.

## Running the game

1. Open the `Prismthread Paradox` folder in VS Code.
2. Press **F5** (or Run ▶) to launch the included `pwa-chrome` configuration. The browser opens `public/index.html` automatically.
3. Alternatively, open `public/index.html` directly in any modern browser.

No build steps or external assets are required.

## Controls

| Action | Default keys |
| --- | --- |
| Move | WASD / Arrow Keys |
| Pulse (fire) | Space / Mouse primary |
| Alternate pulse | J |
| Pause | Escape |

Controls are fully rebindable from the Settings menu. Keyboard-only play is supported.

## Saving & progression

Progress (meta threads, unlocked relics, settings) persists in `localStorage`. Winning runs award additional meta threads that can unlock relics from the title screen.

## Accessibility & options

* Color palettes for default, deuteranopia, protanopia, and tritanopia.
* Performance mode toggle reduces particles and effects.
* Screen shake and flash intensity sliders (0–100%).
* Captions/subtitles for major audio cues in the HUD.
* Pause menu with resume, settings, and quit.

## Diagnostics & tests

* Press `~` to toggle the diagnostics overlay (FPS, entity count).
* A lightweight test harness executes utility tests on load; see the browser console for results.
