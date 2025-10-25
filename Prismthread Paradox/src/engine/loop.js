// Main render loop with pause-safe delta accumulation.
export function createLoop(step) {
  let last = performance.now();
  let running = false;
  let frame = 0;

  const tick = (now) => {
    if (!running) return;
    const dt = Math.min(1 / 20, (now - last) / 1000); // clamp delta to avoid spiral of death
    last = now;
    frame += 1;
    step({ dt, frame, now });
    requestAnimationFrame(tick);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    },
    stop() {
      running = false;
    },
    isRunning() {
      return running;
    },
  };
}
