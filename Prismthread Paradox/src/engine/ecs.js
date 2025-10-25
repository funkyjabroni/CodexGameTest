let entityId = 1;

export function createECS() {
  const entities = new Map();
  const systems = [];
  const drawSystems = [];

  const createEntity = (components = {}) => {
    const id = entityId++;
    entities.set(id, { id, components: { ...components } });
    return entities.get(id);
  };

  const removeEntity = (id) => {
    const entity = typeof id === 'object' ? id : entities.get(id);
    if (entity) {
      entities.delete(entity.id);
    }
  };

  const clear = () => {
    entities.clear();
  };

  const update = (dt, context) => {
    for (const system of systems) {
      system({ dt, entities, context });
    }
  };

  const draw = (renderer, particles, settings) => {
    for (const draw of drawSystems) {
      draw({ renderer, particles, settings, entities });
    }
  };

  const registerSystem = (system) => systems.push(system);
  const registerDraw = (system) => drawSystems.push(system);

  const query = (...components) => {
    return [...entities.values()].filter((entity) =>
      components.every((key) => key in entity.components)
    );
  };

  return {
    createEntity,
    removeEntity,
    update,
    draw,
    registerSystem,
    registerDraw,
    entities,
    query,
    clear,
  };
}
