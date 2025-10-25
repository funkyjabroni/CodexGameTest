import { gameConfig } from './config.js';
import { spawnPlayer, spawnEnemy, spawnProjectile, spawnBoss } from './entities.js';
import { updateEnemyAI } from './ai.js';
import { updateBoss } from './boss.js';
import { narrative } from './narrative.js';

export function registerGameSystems(context) {
  const { ecs, input, particles, renderer, audio, collision, worldgen, menus, rng, save } =
    context;

  const run = {
    active: false,
    paused: false,
    time: 0,
    score: 0,
    wave: 0,
    waveTimer: 0,
    bossSpawned: false,
    seed: worldgen.generateRunSeed(),
    captions: [],
    accessibilityCaptions: [],
  };

  context.run = run;
  context.player = null;
  context.gameConfig = gameConfig;

  const resetParticles = () => {
    context.particles.particles.length = 0;
  };

  const spawnWave = () => {
    const waveConfig = worldgen.generateWave(run.wave);
    for (const entry of waveConfig) {
      const enemy = spawnEnemy(ecs, rng, entry.type, entry, worldgen.arena);
      particles.spawn({
        x: enemy.components.transform.x,
        y: enemy.components.transform.y,
        radius: 12,
        color: renderer.palette[entry.colorIndex % renderer.palette.length],
        life: 0.7,
      });
    }
    menus.showCaption(narrative.captions.enemySpawn, 1.2);
  };

  const startBoss = () => {
    spawnBoss(ecs, worldgen.arena, gameConfig.boss);
    menus.showCaption(narrative.captions.bossIntro, 2);
    run.bossSpawned = true;
  };

  context.startRun = ({ seed } = {}) => {
    ecs.clear();
    resetParticles();
    run.seed = rng.reseed(seed);
    run.time = 0;
    run.score = 0;
    run.wave = 0;
    run.waveTimer = 0;
    run.bossSpawned = false;
    run.active = true;
    run.paused = false;
    context.player = spawnPlayer(ecs, context.settings, context.profile);
    spawnWave();
    audio.setMusicState(0.3);
    menus.hide('title');
    menus.hide('gameOver');
    menus.hide('pause');
    menus.hide('intro');
  };

  context.endRun = (result) => {
    run.active = false;
    run.paused = false;
    if (result.win) {
      context.profile.metaThreads += 1;
    }
    context.profile.bestScore = Math.max(context.profile.bestScore || 0, run.score);
    save.saveProfile(context.profile);
    menus.showGameOver(context, { ...result, score: run.score, time: run.time });
  };

  input.onAction('pause', (pressed) => {
    if (!pressed) return;
    if (!run.active) return;
    if (!run.paused) {
      menus.pause(context, { auto: false });
    } else {
      menus.resume(context);
    }
  });

  ecs.registerSystem(({ dt, context: ctx }) => {
    audio.update();
    if (!run.active || run.paused) return;
    run.time += dt;
    run.waveTimer += dt;

    if (run.waveTimer > gameConfig.waves[Math.min(run.wave, gameConfig.waves.length - 1)].time) {
      run.wave += 1;
      run.waveTimer = 0;
      if (run.wave >= gameConfig.waves.length && !run.bossSpawned) {
        startBoss();
      } else {
        spawnWave();
      }
    }
  });

  ecs.registerSystem(({ dt }) => {
    if (!run.active || run.paused) return;
    const player = context.player;
    if (!player) return;
    const { transform, motion, player: playerData, collider } = player.components;
    const move = input.getMovementVector();
    motion.vx += move.x * playerData.speed * dt * 4;
    motion.vy += move.y * playerData.speed * dt * 4;
    motion.vx *= 0.92;
    motion.vy *= 0.92;
    transform.x += motion.vx * dt;
    transform.y += motion.vy * dt;
    const arena = worldgen.arena;
    transform.x = Math.max(collider.radius, Math.min(arena.width - collider.radius, transform.x));
    transform.y = Math.max(collider.radius, Math.min(arena.height - collider.radius, transform.y));

    if (playerData.invuln > 0) playerData.invuln -= dt;

    const pointer = input.getPointer();
    const dir = {
      x: pointer.x - transform.x,
      y: pointer.y - transform.y,
    };
    const len = Math.hypot(dir.x, dir.y) || 1;
    dir.x /= len;
    dir.y /= len;

    player.components.pulse.cooldown -= dt;
    if (player.components.pulse.cooldown <= 0 && (input.isPressed('weave') || input.isPointerDown(0))) {
      player.components.pulse.cooldown = 0.25;
      spawnProjectile(ecs, transform, dir, 360, 'player');
      particles.burst(transform.x, transform.y, context.settings.performanceMode ? 6 : 12, renderer.palette[3]);
      audio.playSfx({ type: 'pulse', pitch: 520, duration: 0.15 });
      playerData.energy = Math.max(0, playerData.energy - 5);
    }

    playerData.energy = Math.min(playerData.maxEnergy, playerData.energy + gameConfig.player.energyRegen * dt);
  });

  ecs.registerSystem(({ dt }) => {
    if (!run.active || run.paused) return;
    const enemies = ecs.query('enemy');
    for (const enemy of enemies) {
      updateEnemyAI(enemy, { dt, context });
      const motion = enemy.components.motion;
      const transform = enemy.components.transform;
      transform.x += motion.vx * dt;
      transform.y += motion.vy * dt;
    }
  });

  ecs.registerSystem(({ dt }) => {
    if (!run.active || run.paused) return;
    const projectiles = ecs.query('projectile');
    for (const proj of projectiles) {
      const transform = proj.components.transform;
      const motion = proj.components.motion;
      transform.x += motion.vx * dt;
      transform.y += motion.vy * dt;
      proj.components.renderable.pulse += dt * 4;
      if (
        transform.x < -50 ||
        transform.x > worldgen.arena.width + 50 ||
        transform.y < -50 ||
        transform.y > worldgen.arena.height + 50
      ) {
        ecs.removeEntity(proj);
      }
    }
  });

  ecs.registerSystem(({ dt }) => {
    if (!run.active || run.paused) return;
    const bossEntities = ecs.query('boss');
    for (const boss of bossEntities) {
      updateBoss(boss, { dt, context });
    }
  });

  ecs.registerSystem(({ dt }) => {
    if (!run.active || run.paused) return;
    const player = context.player;
    if (!player) return;
    const playerCollider = { ...player.components.transform, radius: player.components.collider.radius };
    const enemies = ecs.query('enemy');
    for (const enemy of enemies) {
      const colliderData = {
        x: enemy.components.transform.x,
        y: enemy.components.transform.y,
        radius: enemy.components.collider.radius,
      };
      if (collision.circle(playerCollider, colliderData) && player.components.player.invuln <= 0) {
        player.components.player.health -= 1;
        player.components.player.invuln = 1.2;
        particles.burst(playerCollider.x, playerCollider.y, 24, renderer.palette[4]);
        renderer.addShake(3);
        audio.playSfx({ type: 'burst', pitch: 180, duration: 0.3, volume: 0.8 });
        context.hud.flash(context.settings.flashIntensity);
        if (player.components.player.health <= 1) {
          menus.showCaption('Logan: "Kyle, the loom is fraying!"', 2, context);
        }
        if (player.components.player.health <= 0) {
          context.endRun({ win: false, reason: 'Thread severed' });
        }
      }
    }
  });

  ecs.registerSystem(() => {
    if (!run.active || run.paused) return;
    const projectiles = ecs.query('projectile');
    const enemies = ecs.query('enemy');
    for (const proj of projectiles) {
      if (proj.components.projectile.source !== 'player') continue;
      for (const enemy of enemies) {
        if (enemy.components.enemy.health <= 0) continue;
        const colliderData = {
          x: enemy.components.transform.x,
          y: enemy.components.transform.y,
          radius: enemy.components.collider.radius,
        };
        const projCollider = {
          x: proj.components.transform.x,
          y: proj.components.transform.y,
          radius: proj.components.collider.radius,
        };
        if (collision.circle(colliderData, projCollider)) {
          enemy.components.enemy.health -= proj.components.projectile.damage;
          particles.spawn({
            x: projCollider.x,
            y: projCollider.y,
            radius: 6,
            color: renderer.palette[enemy.components.renderable.colorIndex],
            life: 0.4,
          });
          ecs.removeEntity(proj);
          if (enemy.components.enemy.health <= 0) {
            run.score += 10;
            particles.burst(colliderData.x, colliderData.y, 16, renderer.palette[3]);
            renderer.addShake(2);
            audio.playSfx({ type: 'pulse', pitch: 260, duration: 0.2, volume: 0.7 });
            ecs.removeEntity(enemy);
          }
          break;
        }
      }
    }
  });

  ecs.registerSystem(() => {
    if (!run.active || run.paused) return;
    const bossEntities = ecs.query('boss');
    const projectiles = ecs.query('projectile');
    const player = context.player;
    if (!player) return;
    for (const boss of bossEntities) {
      const bossCollider = {
        x: boss.components.transform.x,
        y: boss.components.transform.y,
        radius: boss.components.collider.radius,
      };
      for (const proj of projectiles) {
        const projData = proj.components.projectile;
        if (projData.source !== 'player') continue;
        const projCollider = {
          x: proj.components.transform.x,
          y: proj.components.transform.y,
          radius: proj.components.collider.radius,
        };
        if (collision.circle(bossCollider, projCollider)) {
          boss.components.boss.health -= projData.damage;
          particles.spawn({
            x: projCollider.x,
            y: projCollider.y,
            radius: 12,
            color: renderer.palette[2],
            life: 0.5,
          });
          ecs.removeEntity(proj);
          run.score += 25;
          if (boss.components.boss.health <= 0) {
            particles.burst(bossCollider.x, bossCollider.y, 60, renderer.palette[3]);
            audio.playSfx({ type: 'burst', pitch: 480, duration: 0.6, volume: 1 });
            renderer.addShake(5);
            ecs.removeEntity(boss);
            context.endRun({ win: true, reason: 'The Snarl loosened' });
          }
        }
      }
      const projPlayerHits = projectiles.filter((proj) => proj.components.projectile.source === 'boss');
      for (const proj of projPlayerHits) {
        const projCollider = {
          x: proj.components.transform.x,
          y: proj.components.transform.y,
          radius: proj.components.collider.radius,
        };
        const playerCollider = {
          x: player.components.transform.x,
          y: player.components.transform.y,
          radius: player.components.collider.radius,
        };
        if (collision.circle(playerCollider, projCollider) && player.components.player.invuln <= 0) {
          player.components.player.health -= 1;
          player.components.player.invuln = 1.2;
          ecs.removeEntity(proj);
          particles.burst(playerCollider.x, playerCollider.y, 20, renderer.palette[4]);
          renderer.addShake(3);
          audio.playSfx({ type: 'burst', pitch: 160, duration: 0.3, volume: 0.8 });
          if (player.components.player.health <= 1) {
            menus.showCaption('Hoff: "Breathe, we steady the weave."', 2, context);
          }
          if (player.components.player.health <= 0) {
            context.endRun({ win: false, reason: 'Overwhelmed by the Snarl' });
          }
        }
      }
    }
  });

  ecs.registerDraw(({ renderer, entities }) => {
    const arena = worldgen.arena;
    const marginX = (renderer.ctx.canvas.width - arena.width) / 2;
    const marginY = (renderer.ctx.canvas.height - arena.height) / 2;
    renderer.drawRect(marginX, marginY, arena.width, arena.height, '#070915', 0.8, 24);

    const drawEntity = (entity) => {
      const { transform, collider, renderable } = entity.components;
      const x = marginX + transform.x;
      const y = marginY + transform.y;
      const radius = collider?.radius || 12;
      const palette = renderer.palette;
      const color = palette[renderable?.colorIndex ?? 2] ?? '#fff';
      const pulse = (Math.sin(renderer.frame / 10 + (renderable?.pulse ?? 0)) + 1) / 2;
      renderer.drawCircle(x, y, radius + pulse * 2, color, 0.9);
    };

    for (const entity of entities.values()) {
      if (entity.components.player) {
        drawEntity(entity);
        renderer.drawText(
          'Kyle',
          marginX + entity.components.transform.x,
          marginY + entity.components.transform.y - entity.components.collider.radius - 16,
          { size: 16, color: renderer.palette[2] }
        );
      } else if (entity.components.enemy || entity.components.boss || entity.components.projectile) {
        drawEntity(entity);
      }
    }
  });
}
