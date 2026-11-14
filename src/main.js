import './style.css';
import { initHeroField } from './exhibits/heroField.js';
import { initChronosAstrolabe } from './exhibits/chronosAstrolabe.js';
import { initValueLoom } from './exhibits/valueLoom.js';
import { initScenarioConstellation } from './exhibits/scenarioConstellation.js';
import { initTruthPrism } from './exhibits/truthPrism.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Hero Atrium Particle Field
  const hero = initHeroField(document.getElementById('hero-canvas'));
  document.querySelectorAll('.morph-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.morph-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      hero.setShape(btn.dataset.shape);
    });
  });

  // 2. Hall I: Chronos Astrolabe
  const chronos = initChronosAstrolabe(
    document.getElementById('chronos-canvas'),
    document.getElementById('chronos-metrics')
  );
  document.querySelectorAll('#chronos-filters .pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#chronos-filters .pill-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      chronos.setFilter(btn.dataset.filter);
    });
  });

  // 3. Hall II: The Loom of Value
  const flux = initValueLoom(
    document.getElementById('flux-canvas'),
    document.getElementById('flux-metrics')
  );
  const interventionBtn = document.getElementById('flux-intervention-btn');
  interventionBtn.addEventListener('click', () => {
    const active = flux.toggleIntervention();
    interventionBtn.classList.toggle('active', active);
    interventionBtn.querySelector('span:last-child').textContent = active
      ? '已开启认知觉醒干预 · 恢复基准状态'
      : '开启认知觉醒干预 · AI + 系统重构';
  });

  // 4. Hall III: Constellation of Open Source & Scenarios
  const constellation = initScenarioConstellation(
    document.getElementById('constellation-svg-host'),
    {
      title: document.getElementById('ci-title'),
      meta: document.getElementById('ci-meta'),
      pain: document.getElementById('ci-pain'),
      solution: document.getElementById('ci-solution'),
      anti: document.getElementById('ci-anti'),
    }
  );

  // 5. Hall IV: The Prism of Truth
  const prism = initTruthPrism(document.getElementById('prism-svg-host'), {
    stageTitle: document.getElementById('prism-stage-title'),
    stageDesc: document.getElementById('prism-stage-desc'),
    lesson: document.getElementById('prism-lesson'),
    hudMetrics: document.getElementById('prism-metrics'),
  });

  document.querySelectorAll('#prism-modes .prism-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#prism-modes .prism-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      prism.setMode(btn.dataset.mode);
    });
  });

  // Wire per-exhibit Chaos / Order toggles
  const exhibitMap = { chronos, flux, constellation };
  document.querySelectorAll('.state-toggle').forEach((group) => {
    const key = group.dataset.exhibit;
    const api = exhibitMap[key];
    group.querySelectorAll('.state-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.state-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        api?.setMode(btn.dataset.state);
      });
    });
  });

  // 6. Global Master Entropy / Order Switch
  let globalIsOrder = true;
  const globalBtn = document.getElementById('global-entropy-btn');
  const globalLabel = document.getElementById('global-mode-label');

  globalBtn.addEventListener('click', () => {
    globalIsOrder = !globalIsOrder;
    const state = globalIsOrder ? 'order' : 'chaos';

    globalBtn.classList.toggle('chaos-active', !globalIsOrder);
    globalLabel.textContent = globalIsOrder ? '全局秩序态 · COSMOS' : '全局混沌态 · ENTROPY';

    // Update Hero shape
    hero.setShape(globalIsOrder ? 'astrolabe' : 'chaos');
    document.querySelectorAll('.morph-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.shape === (globalIsOrder ? 'astrolabe' : 'chaos'));
    });

    // Update Exhibits I, II, III
    Object.entries(exhibitMap).forEach(([key, api]) => {
      api.setMode(state);
      const group = document.querySelector(`.state-toggle[data-exhibit="${key}"]`);
      if (group) {
        group.querySelectorAll('.state-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.state === state);
        });
      }
    });

    // Update Exhibit IV
    const prismTarget = globalIsOrder ? 'glyphs' : 'chaos';
    prism.setMode(prismTarget);
    document.querySelectorAll('#prism-modes .prism-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === prismTarget);
    });
  });

  // 7. Archival Artwork Lightbox
  const lightbox = document.getElementById('art-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('close-lightbox');

  document.querySelectorAll('.zoom-art-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      lightboxImg.src = btn.dataset.plateSrc;
      lightboxCaption.textContent = btn.dataset.plateTitle;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
});
