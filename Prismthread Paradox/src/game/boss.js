import { spawnProjectile } from './entities.js';

export function updateBoss(entity, { dt, context }) {
  const { boss } = entity.components;
  const { renderer, rng, ecs, particles, audio, collision } = context;
  const { palette } = renderer;
  boss.timer += dt;

  const healthRatio = boss.health / boss.maxHealth;
  const phase = boss.phaseIndex;
  const patterns = ['spirals', 'rifts', 'overload'];
  const pattern = patterns[phase] || 'overload';

  const emitProjectile = (angle, speed) => {
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    spawnProjectile(ecs, entity.components.transform, dir, speed, 'boss');
    particles.spawn({
      x: entity.components.transform.x + dir.x * entity.components.collider.radius,
      y: entity.components.transform.y + dir.y * entity.components.collider.radius,
      vx: dir.x * 180,
      vy: dir.y * 180,
      radius: 6,
      color: palette[3],
      life: 0.4,
    });
  };

  if (pattern === 'spirals' && boss.timer > 0.5) {
    boss.timer = 0;
    const base = rng.random() * Math.PI * 2;
    for (let i = 0; i < 6; i++) {
      emitProjectile(base + i * (Math.PI / 3), 220);
    }
  } else if (pattern === 'rifts' && boss.timer > 1.2) {
    boss.timer = 0;
    const bursts = 3 + Math.floor((1 - healthRatio) * 4);
    for (let i = 0; i < bursts; i++) {
      const angle = (i / bursts) * Math.PI * 2;
      emitProjectile(angle, 160 + i * 10);
    }
  } else if (pattern === 'overload' && boss.timer > 0.25) {
    boss.timer = 0;
    for (let i = 0; i < 8; i++) {
      emitProjectile((i / 8) * Math.PI * 2 + rng.random() * 0.1, 240 + rng.random() * 60);
    }
  }

  for (let i = 0; i < context.ecs.query('projectile').length; i++) {
    // Boss collision handled in systems.
  }

  const phaseThresholds = [0.66, 0.33, 0];
  const nextPhase = Math.max(0, Math.min(2, phase + 1));
  if (healthRatio <= phaseThresholds[nextPhase] && phase < nextPhase) {
    boss.phaseIndex = nextPhase;
    audio.playSfx({ type: 'burst', pitch: 330, volume: 0.9, duration: 0.5 });
    context.menus.showCaption(`${boss.name} twists the loom!`, 1.5);
  }
}
