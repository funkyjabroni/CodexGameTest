import { createLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { createRenderer } from './engine/renderer.js';
import { createAudio } from './engine/audio.js';
import { createECS } from './engine/ecs.js';
import { createRNG } from './engine/rng.js';
import { createParticleSystem } from './engine/particles.js';
import { createTweenManager } from './engine/tween.js';
import { createSaveSystem } from './engine/save.js';
import { createUIManager } from './engine/ui.js';
import { createCollisionSystem } from './engine/collision.js';
import { createHUD } from './ui/hud.js';
import { createMenus } from './ui/menus.js';
import { createAccessibility } from './ui/accessibility.js';
import { createWorldGenerator } from './game/worldgen.js';
import { registerGameSystems } from './game/systems.js';
import { narrative } from './game/narrative.js';
import { runDevTests } from './dev/test.js';
import { createDebugOverlay } from './dev/debugOverlay.js';

const canvas = document.getElementById('game');
const uiRoot = document.getElementById('ui-root');

const save = createSaveSystem('prismthread.paradox');
const settings = save.loadSettings();
const profile = save.loadProfile();

const renderer = createRenderer(canvas, settings);
const input = createInput(canvas, settings, save);
const audio = createAudio(settings);
const ecs = createECS();
const particles = createParticleSystem(renderer, settings);
const tweens = createTweenManager();
const rng = createRNG();
const collision = createCollisionSystem();
const ui = createUIManager(uiRoot);
const hud = createHUD(ui, settings);
const menus = createMenus(ui, settings, input, save, rng, narrative);
const accessibility = createAccessibility(ui, settings, renderer, particles);
const debugOverlay = createDebugOverlay(ui, settings);

const worldgen = createWorldGenerator(rng);

const context = {
  canvas,
  renderer,
  input,
  audio,
  ecs,
  particles,
  tweens,
  rng,
  save,
  settings,
  profile,
  ui,
  hud,
  menus,
  accessibility,
  collision,
  worldgen,
  debugOverlay,
};

registerGameSystems(context);

const loop = createLoop(({ dt, frame }) => {
  debugOverlay.update({ dt, frame, ecs });
  ecs.update(dt, context);
  particles.update(dt);
  tweens.update(dt);
  renderer.beginFrame(settings.performanceMode);
  ecs.draw(renderer, particles, settings);
  particles.draw();
  hud.update(context);
});

loop.start();

menus.showTitle(context).then((seed) => {
  audio.ensureContext();
  menus.showIntro(context, narrative.intro, seed);
});

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    menus.pause(context, { auto: true });
  }
});

window.__PRISM_context = context;

runDevTests();
