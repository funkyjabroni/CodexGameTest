import { createRNG } from '../engine/rng.js';
import { createCollisionSystem } from '../engine/collision.js';

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('rng deterministic sequence', () => {
  const rng = createRNG();
  rng.reseed(123);
  const a = Array.from({ length: 5 }, () => rng.random());
  rng.reseed(123);
  const b = Array.from({ length: 5 }, () => rng.random());
  if (a.some((v, i) => Math.abs(v - b[i]) > 1e-9)) {
    throw new Error('Sequences diverged');
  }
});

test('circle collision symmetrical', () => {
  const collision = createCollisionSystem();
  const a = { x: 0, y: 0, radius: 10 };
  const b = { x: 15, y: 0, radius: 10 };
  if (!collision.circle(a, b)) throw new Error('Expected collision');
  const c = { x: 25, y: 0, radius: 10 };
  if (collision.circle(a, c)) throw new Error('Unexpected collision');
});

export function runDevTests() {
  const results = [];
  for (const { name, fn } of tests) {
    try {
      fn();
      results.push({ name, status: 'pass' });
    } catch (err) {
      console.error('[TEST FAIL]', name, err);
      results.push({ name, status: 'fail', error: err });
    }
  }
  const failed = results.filter((r) => r.status === 'fail');
  const summary = `${results.length} tests, ${failed.length} failed`;
  if (failed.length === 0) {
    console.info('[TESTS]', summary);
  } else {
    console.warn('[TESTS]', summary);
  }
  window.__PRISM_tests = results;
}
