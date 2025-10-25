export function updateEnemyAI(entity, { dt, context }) {
  const { player } = context;
  const enemy = entity.components.enemy;
  const transform = entity.components.transform;
  const motion = entity.components.motion;
  enemy.stateTime += dt;

  if (!player) return;
  const pPos = player.components.transform;
  const dx = pPos.x - transform.x;
  const dy = pPos.y - transform.y;
  const dist = Math.hypot(dx, dy) || 1;
  const dir = { x: dx / dist, y: dy / dist };

  switch (enemy.behavior) {
    case 'swarm':
      motion.vx += dir.x * enemy.data.speed * dt;
      motion.vy += dir.y * enemy.data.speed * dt;
      break;
    case 'dash':
      if (!enemy.target) enemy.target = { dir, winding: true };
      if (enemy.target.winding) {
        if (enemy.stateTime > enemy.data.windup) {
          enemy.target = { dir: { ...dir }, winding: false };
          enemy.stateTime = 0;
        } else {
          motion.vx += dir.x * enemy.data.speed * 0.4 * dt;
          motion.vy += dir.y * enemy.data.speed * 0.4 * dt;
        }
      } else {
        motion.vx = enemy.target.dir.x * enemy.data.speed * 3;
        motion.vy = enemy.target.dir.y * enemy.data.speed * 3;
        if (enemy.stateTime > 0.4) {
          enemy.stateTime = 0;
          enemy.target = null;
        }
      }
      break;
    case 'support':
      if (enemy.stateTime > 3) {
        enemy.stateTime = 0;
        const allies = context.ecs
          .query('enemy')
          .filter((e) => e !== entity && e.components.enemy.health > 0);
        if (allies.length) {
          const ally = context.rng.choice(allies);
          ally.components.enemy.health += enemy.data.healAmount;
          context.particles.spawn({
            x: ally.components.transform.x,
            y: ally.components.transform.y,
            radius: 8,
            color: context.renderer.palette[4],
            life: 0.6,
          });
        }
      }
      motion.vx += dir.x * enemy.data.speed * 0.6 * dt;
      motion.vy += dir.y * enemy.data.speed * 0.6 * dt;
      break;
  }

  motion.vx *= 0.98;
  motion.vy *= 0.98;
}
