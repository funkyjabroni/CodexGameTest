function button(label) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.margin = '8px';
  btn.style.padding = '12px 20px';
  btn.style.fontSize = '18px';
  btn.style.borderRadius = '12px';
  btn.style.border = '1px solid rgba(255,255,255,0.3)';
  btn.style.background = 'rgba(20, 16, 48, 0.6)';
  btn.style.color = '#f5f2ff';
  btn.style.cursor = 'pointer';
  btn.style.backdropFilter = 'blur(6px)';
  return btn;
}

function panel(title) {
  const container = document.createElement('div');
  container.style.background = 'rgba(10, 8, 24, 0.85)';
  container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  container.style.padding = '32px';
  container.style.borderRadius = '18px';
  container.style.maxWidth = '720px';
  container.style.width = '90%';
  container.style.boxShadow = '0 30px 60px rgba(0,0,0,0.4)';

  const heading = document.createElement('h1');
  heading.textContent = title;
  heading.style.marginTop = '0';
  heading.style.fontSize = '32px';
  heading.style.color = '#fff';
  container.appendChild(heading);

  return { container, heading };
}

export function createMenus(ui, settings, input, save, rng, narrative) {
  const showTitle = (context) => {
    return new Promise((resolve) => {
      ui.show('title', (layer) => {
        const { container } = panel(narrative.title);
        const flavor = document.createElement('p');
        flavor.textContent = narrative.intro;
        flavor.style.fontSize = '18px';
        flavor.style.lineHeight = '1.6';
        container.appendChild(flavor);

        const startRow = document.createElement('div');
        startRow.style.display = 'flex';
        startRow.style.flexWrap = 'wrap';
        startRow.style.justifyContent = 'center';

        const startBtn = button('Begin the Weave');
        startBtn.addEventListener('click', () => {
          resolve(seedInput.value || undefined);
        });

        const seedInput = document.createElement('input');
        seedInput.type = 'text';
        seedInput.placeholder = 'Seed (optional)';
        seedInput.style.margin = '8px';
        seedInput.style.padding = '12px';
        seedInput.style.borderRadius = '12px';
        seedInput.style.border = '1px solid rgba(255,255,255,0.3)';
        seedInput.style.background = 'rgba(25,20,50,0.7)';
        seedInput.style.color = '#fff';

        const settingsBtn = button('Settings & Accessibility');
        settingsBtn.addEventListener('click', () => buildSettings(context, 'title'));

        const meta = document.createElement('div');
        meta.style.marginTop = '16px';
        meta.innerHTML = `
          <p><strong>Meta Threads:</strong> ${context.profile.metaThreads}</p>
          <p><strong>Best Score:</strong> ${context.profile.bestScore.toLocaleString()}</p>
        `;

        const relicsHeader = document.createElement('h2');
        relicsHeader.textContent = 'Resonant Relics';
        const relicList = document.createElement('div');
        relicList.style.display = 'grid';
        relicList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
        relicList.style.gap = '12px';

        context.gameConfig = context.gameConfig || context.worldgen?.gameConfig;
        const relics = context.gameConfig?.relics || [];
        relics.forEach((relic) => {
          const card = document.createElement('div');
          card.style.padding = '12px';
          card.style.border = '1px solid rgba(255,255,255,0.2)';
          card.style.borderRadius = '12px';
          card.style.background = 'rgba(18,16,36,0.6)';
          const title = document.createElement('strong');
          title.textContent = relic.name;
          const desc = document.createElement('p');
          desc.textContent = relic.description;
          const status = document.createElement('p');
          const unlocked = context.profile.unlocked?.[relic.id];
          status.textContent = unlocked ? 'Unlocked' : 'Locked';
          const unlockBtn = button(unlocked ? 'Equipped' : 'Unlock (1 Thread)');
          unlockBtn.disabled = unlocked || context.profile.metaThreads <= 0;
          unlockBtn.addEventListener('click', () => {
            if (context.profile.metaThreads <= 0) return;
            context.profile.metaThreads -= 1;
            context.profile.unlocked = {
              ...context.profile.unlocked,
              [relic.id]: true,
            };
            save.saveProfile(context.profile);
            showTitle(context);
          });
          card.append(title, desc, status, unlockBtn);
          relicList.appendChild(card);
        });

        startRow.append(startBtn, settingsBtn, seedInput);
        container.append(startRow, meta, relicsHeader, relicList);

        layer.appendChild(container);
      });
    });
  };

  const buildSettings = (context, sourceLayer) => {
    ui.show('settings', (layer) => {
      const { container } = panel('Settings & Accessibility');
      const performanceToggle = document.createElement('label');
      const perfInput = document.createElement('input');
      perfInput.type = 'checkbox';
      perfInput.checked = settings.performanceMode;
      perfInput.addEventListener('change', () => {
        settings.performanceMode = perfInput.checked;
        save.saveSettings(settings);
      });
      performanceToggle.append(perfInput, document.createTextNode(' Performance Mode (reduce particles)'));

      const paletteSelect = document.createElement('select');
      ['default', 'deuteranopia', 'protanopia', 'tritanopia'].forEach((p) => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        if (settings.palette === p) option.selected = true;
        paletteSelect.appendChild(option);
      });
      paletteSelect.addEventListener('change', () => {
        settings.palette = paletteSelect.value;
        context.renderer.setPalette(settings.palette);
        save.saveSettings(settings);
      });

      const paletteLabel = document.createElement('label');
      paletteLabel.textContent = ' Palette';
      paletteLabel.prepend(paletteSelect);

      const shakeSlider = document.createElement('input');
      shakeSlider.type = 'range';
      shakeSlider.min = '0';
      shakeSlider.max = '1';
      shakeSlider.step = '0.05';
      shakeSlider.value = settings.screenShake;
      shakeSlider.addEventListener('input', () => {
        settings.screenShake = parseFloat(shakeSlider.value);
        save.saveSettings(settings);
      });

      const flashSlider = document.createElement('input');
      flashSlider.type = 'range';
      flashSlider.min = '0';
      flashSlider.max = '1';
      flashSlider.step = '0.05';
      flashSlider.value = settings.flashIntensity;
      flashSlider.addEventListener('input', () => {
        settings.flashIntensity = parseFloat(flashSlider.value);
        save.saveSettings(settings);
      });

      const controlsSection = document.createElement('div');
      controlsSection.innerHTML = '<h2>Controls</h2>';
      Object.entries(input.bindings).forEach(([action, keys]) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.margin = '6px 0';
        const label = document.createElement('span');
        label.textContent = action;
        const keyBtn = button(keys.join(', '));
        keyBtn.style.flex = '0 0 160px';
        keyBtn.addEventListener('click', () => {
          keyBtn.textContent = 'Press key...';
          input.captureBinding(action);
          const off = input.onAction(action, (pressed) => {
            if (!pressed) return;
            keyBtn.textContent = input.bindings[action].join(', ');
            off();
          });
        });
        row.append(label, keyBtn);
        controlsSection.appendChild(row);
      });
      const resetBtn = button('Reset Bindings');
      resetBtn.addEventListener('click', () => {
        input.resetBindings();
        buildSettings(context, sourceLayer);
      });
      controlsSection.appendChild(resetBtn);

      const captionsInfo = document.createElement('p');
      captionsInfo.textContent = 'Subtitles are shown for major audio cues in the HUD caption box.';

      const backBtn = button('Back');
      backBtn.addEventListener('click', () => {
        ui.hide('settings');
        if (sourceLayer === 'title') {
          showTitle(context);
        } else if (sourceLayer === 'pause') {
          pause(context, { auto: false });
        }
      });

      container.append(
        performanceToggle,
        paletteLabel,
        document.createElement('hr'),
        Object.assign(document.createElement('label'), {
          textContent: ` Screen Shake ${Math.round(settings.screenShake * 100)}%`,
        }),
        shakeSlider,
        Object.assign(document.createElement('label'), {
          textContent: ` Flash Intensity ${Math.round(settings.flashIntensity * 100)}%`,
        }),
        flashSlider,
        document.createElement('hr'),
        controlsSection,
        document.createElement('hr'),
        captionsInfo,
        backBtn
      );

      layer.appendChild(container);
    });
  };

  const showIntro = (context, text, seed) => {
    ui.show('intro', (layer) => {
      const { container } = panel('Briefing');
      const copy = document.createElement('p');
      copy.textContent = text;
      const dive = button('Dive In');
      dive.addEventListener('click', () => {
        ui.hide('intro');
        context.startRun({ seed });
      });
      const skip = button('Skip');
      skip.addEventListener('click', () => {
        ui.hide('intro');
        context.startRun({ seed });
      });
      container.append(copy, dive, skip);
      layer.appendChild(container);
    });
  };

  const pause = (context, { auto }) => {
    if (!context.run.active) return;
    context.run.paused = true;
    ui.show('pause', (layer) => {
      const { container } = panel(auto ? 'Auto-Paused' : 'Paused');
      const resumeBtn = button('Resume');
      resumeBtn.addEventListener('click', () => resume(context));
      const settingsBtn = button('Settings');
      settingsBtn.addEventListener('click', () => buildSettings(context, 'pause'));
      const quitBtn = button('Quit to Title');
      quitBtn.addEventListener('click', () => {
        context.run.active = false;
        context.run.paused = false;
        context.hud.flash(0);
        ui.hide('pause');
        showTitle(context);
      });
      container.append(resumeBtn, settingsBtn, quitBtn);
      layer.appendChild(container);
    });
  };

  const resume = (context) => {
    context.run.paused = false;
    ui.hide('pause');
  };

  const showGameOver = (context, result) => {
    ui.show('gameOver', (layer) => {
      const { container } = panel(result.win ? 'The Loom Holds' : 'Threads Collapse');
      const summary = document.createElement('p');
      summary.innerHTML = `Result: <strong>${result.win ? 'Victory' : 'Defeat'}</strong><br/>Reason: ${
        result.reason
      }<br/>Score: ${result.score.toLocaleString()}<br/>Time: ${result.time.toFixed(1)}s`;
      const replay = button('Weave Again');
      replay.addEventListener('click', () => {
        context.startRun({ seed: context.run.seed });
      });
      const titleBtn = button('Return to Title');
      titleBtn.addEventListener('click', () => showTitle(context));
      container.append(summary, replay, titleBtn);
      layer.appendChild(container);
    });
  };

  const showCaption = (text, duration = 1, ctx = window.__PRISM_context) => {
    if (!text) return;
    const target = ctx || window.__PRISM_context;
    if (!target) return;
    if (target.accessibility && !target.accessibility.captionsEnabled) return;
    ui.hide('caption');
    target.hud.showCaption(text, duration);
  };

  return {
    showTitle,
    showIntro,
    pause,
    resume,
    showGameOver,
    showCaption,
    showCaptionBox: showCaption,
    buildSettings,
    hide: ui.hide.bind(ui),
  };
}
