// Mulberry32 deterministic RNG with seed utilities.
function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRNG() {
  let seed = Date.now() >>> 0;
  let rand = mulberry32(seed);

  const reseed = (value) => {
    if (typeof value === 'string') {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
      }
      seed = hash || 1;
    } else if (typeof value === 'number') {
      seed = value >>> 0;
    } else {
      seed = (Math.random() * 2 ** 32) >>> 0;
    }
    rand = mulberry32(seed);
    return seed;
  };

  return {
    random() {
      return rand();
    },
    range(min, max) {
      return rand() * (max - min) + min;
    },
    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    },
    choice(list) {
      return list[Math.floor(rand() * list.length)];
    },
    weighted(weights) {
      const total = weights.reduce((acc, w) => acc + w.weight, 0);
      let roll = rand() * total;
      for (const entry of weights) {
        if ((roll -= entry.weight) <= 0) return entry.value;
      }
      return weights[weights.length - 1].value;
    },
    reseed,
    get seed() {
      return seed;
    },
  };
}
