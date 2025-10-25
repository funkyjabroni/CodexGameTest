export function createAccessibility(ui, settings, renderer, particles) {
  const state = {
    captions: true,
  };

  const applyPerformance = () => {
    renderer.beginFrame(settings.performanceMode);
    if (settings.performanceMode) {
      particles.particles.length = Math.min(particles.particles.length, 60);
    }
  };

  const setCaptions = (enabled) => {
    state.captions = enabled;
  };

  return {
    applyPerformance,
    setCaptions,
    get captionsEnabled() {
      return state.captions;
    },
  };
}
