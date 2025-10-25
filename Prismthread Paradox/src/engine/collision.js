export function createCollisionSystem() {
  const aabb = (a, b) =>
    Math.abs(a.x - b.x) < a.radius + b.radius && Math.abs(a.y - b.y) < a.radius + b.radius;

  const circle = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const r = a.radius + b.radius;
    return dx * dx + dy * dy <= r * r;
  };

  return { aabb, circle };
}
