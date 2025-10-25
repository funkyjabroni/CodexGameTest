export function createTweenManager() {
  const tweens = new Set();

  const add = (target, key, to, duration, easing = (t) => t, options = {}) => {
    const from = target[key];
    const tween = {
      target,
      key,
      from,
      to,
      duration,
      easing,
      elapsed: 0,
      loop: options.loop || false,
      yoyo: options.yoyo || false,
      onComplete: options.onComplete || (() => {}),
    };
    tweens.add(tween);
    return tween;
  };

  const update = (dt) => {
    for (const tween of [...tweens]) {
      tween.elapsed += dt;
      let t = Math.min(1, tween.elapsed / tween.duration);
      const value = tween.from + (tween.to - tween.from) * tween.easing(t);
      tween.target[tween.key] = value;
      if (t >= 1) {
        if (tween.loop) {
          tween.elapsed = 0;
          if (tween.yoyo) {
            [tween.from, tween.to] = [tween.to, tween.from];
          }
        } else {
          tweens.delete(tween);
          tween.onComplete();
        }
      }
    }
  };

  const clear = () => tweens.clear();

  return { add, update, clear };
}
