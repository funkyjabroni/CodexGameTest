export function createParticleSystem(renderer, settings) {
  const particles = [];

  const spawn = (config) => {
    if (settings.performanceMode && particles.length > 120) return;
    particles.push({
      life: config.life || 0.6,
      maxLife: config.life || 0.6,
      x: config.x,
      y: config.y,
      vx: config.vx ?? 0,
      vy: config.vy ?? 0,
      radius: config.radius ?? 4,
      color: config.color ?? renderer.palette[3],
    });
  };

  const burst = (x, y, count, color) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      spawn({
        x,
        y,
        vx: Math.cos(angle) * (Math.random() * 100 + 40),
        vy: Math.sin(angle) * (Math.random() * 100 + 40),
        radius: Math.random() * 4 + 2,
        life: 0.5 + Math.random() * 0.5,
        color,
      });
    }
  };

  const update = (dt) => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.9;
      p.vy *= 0.9;
    }
  };

  const draw = () => {
    const ctx = renderer.ctx;
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  return { spawn, burst, update, draw, particles };
}
