import './style.css';
import { I18N } from './i18n.js';
import { initHeroField } from './exhibits/heroField.js';
import { initChronosAstrolabe } from './exhibits/chronosAstrolabe.js';
import { initValueLoom } from './exhibits/valueLoom.js';
import { initScenarioConstellation } from './exhibits/scenarioConstellation.js';
import { initTruthPrism } from './exhibits/truthPrism.js';

let initialized = false;

function bootstrap() {
  if (initialized) return;
  initialized = true;

  let currentLang = 'zh';
  let globalIsOrder = true;
  let toastTimer = null;

  const exhibits = {
    hero: null,
    chronos: null,
    flux: null,
    constellation: null,
    prism: null,
  };

  function showProvenanceToast() {
    const toast = document.getElementById('provenance-toast');
    if (!toast) return;
    toast.textContent = I18N[currentLang].toastMsg;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  function updateDynamicLabels() {
    const dict = I18N[currentLang];
    const globalLabel = document.getElementById('global-mode-label');
    if (globalLabel) {
      globalLabel.textContent = globalIsOrder ? dict.globalOrder : dict.globalChaos;
    }

    const interventionBtn = document.getElementById('flux-intervention-btn');
    if (interventionBtn) {
      const isAwakened = exhibits.flux?.isAwakened?.() || interventionBtn.classList.contains('active');
      interventionBtn.textContent = isAwakened ? dict.interventionOn : dict.interventionOff;
    }

    const atlasLink = document.getElementById('atlas-doc-link');
    if (atlasLink) {
      atlasLink.href =
        currentLang === 'zh'
          ? 'https://github.com/dycshow/pantheon-of-data-art/blob/main/docs/OPEN_SOURCE_ATLAS.md'
          : 'https://github.com/dycshow/pantheon-of-data-art/blob/main/docs/OPEN_SOURCE_ATLAS_EN.md';
    }
  }

  function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'zh';
    const dict = I18N[currentLang];

    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.title = dict.docTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', dict.metaDesc);

    // Update language switch pills
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    // Update all pure text keys
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // Update rich HTML keys
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Update classical Chinese vs Roman numerals
    const cnNums = { 1: '壹', 2: '贰', 3: '叁', 4: '肆', 5: '伍' };
    const enNums = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    document.querySelectorAll('[data-nav-idx]').forEach((el) => {
      const idx = el.getAttribute('data-nav-idx');
      el.textContent = currentLang === 'zh' ? cnNums[idx] : enNums[idx];
    });

    document.querySelectorAll('[data-stat-num]').forEach((el) => {
      const id = el.getAttribute('data-stat-num');
      if (id === '1') el.textContent = currentLang === 'zh' ? '零肆' : '04';
      if (id === '2') el.textContent = currentLang === 'zh' ? '零叁' : '03';
    });

    // Update active lightbox caption if open
    const lightbox = document.getElementById('art-lightbox');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const activePlateKey = lightbox?.getAttribute('data-active-plate');
    if (activePlateKey && lightboxCaption) {
      const capKey = `${activePlateKey}LightTitle`;
      if (dict[capKey]) lightboxCaption.textContent = dict[capKey];
    }

    updateDynamicLabels();

    // Propagate language change into all interactive exhibits
    Object.values(exhibits).forEach((api) => {
      try {
        api?.setLang?.(currentLang);
      } catch (err) {
        console.error('Exhibit setLang error:', err);
      }
    });
  }

  function openLightbox(plateKey, src) {
    const lightbox = document.getElementById('art-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (!lightbox || !lightboxImg) return;

    const dict = I18N[currentLang];
    const capKey = `${plateKey}LightTitle`;
    lightbox.setAttribute('data-active-plate', plateKey || 'plate1');
    lightboxImg.src = src;
    if (lightboxCaption) {
      lightboxCaption.textContent = dict[capKey] || '';
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    const lightbox = document.getElementById('art-lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  // 1. Bind ALL UI interactions via resilient document-level event delegation FIRST
  document.addEventListener('click', (e) => {
    // a. Language toggle
    const langBtn = e.target.closest('.lang-btn');
    if (langBtn) {
      e.preventDefault();
      applyLanguage(langBtn.dataset.lang);
      return;
    }

    // b. Smooth scroll anchor jump links (handles top nav + hero enter button)
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.replaceState) {
          history.replaceState(null, '', `#${targetId}`);
        }
      }
      return;
    }

    // c. Atrium morph shape buttons
    const morphBtn = e.target.closest('.morph-btn');
    if (morphBtn) {
      document.querySelectorAll('.morph-btn').forEach((b) => b.classList.remove('active'));
      morphBtn.classList.add('active');
      exhibits.hero?.setShape?.(morphBtn.dataset.shape);
      return;
    }

    // d. Per-hall Chaos / Order buttons
    const stateBtn = e.target.closest('.state-btn');
    if (stateBtn) {
      const group = stateBtn.closest('.state-toggle');
      const key = group?.dataset?.exhibit;
      const nextState = stateBtn.dataset.state;
      if (group) {
        group.querySelectorAll('.state-btn').forEach((b) => b.classList.remove('active'));
        stateBtn.classList.add('active');
      }
      exhibits[key]?.setMode?.(nextState);
      return;
    }

    // e. Hall I dimension filter pills
    const filterBtn = e.target.closest('#chronos-filters .pill-btn');
    if (filterBtn) {
      document.querySelectorAll('#chronos-filters .pill-btn').forEach((b) => b.classList.remove('active'));
      filterBtn.classList.add('active');
      exhibits.chronos?.setFilter?.(filterBtn.dataset.filter);
      return;
    }

    // f. Hall II cognitive intervention toggle
    const interventionBtn = e.target.closest('#flux-intervention-btn');
    if (interventionBtn) {
      const active = exhibits.flux?.toggleIntervention?.();
      interventionBtn.classList.toggle('active', Boolean(active));
      updateDynamicLabels();
      return;
    }

    // g. Hall IV encoding stage buttons
    const prismBtn = e.target.closest('#prism-modes .prism-btn');
    if (prismBtn) {
      document.querySelectorAll('#prism-modes .prism-btn').forEach((b) => b.classList.remove('active'));
      prismBtn.classList.add('active');
      exhibits.prism?.setMode?.(prismBtn.dataset.mode);
      return;
    }

    // h. Global Master Chaos / Order Switch
    const globalBtn = e.target.closest('#global-entropy-btn');
    if (globalBtn) {
      globalIsOrder = !globalIsOrder;
      const state = globalIsOrder ? 'order' : 'chaos';
      globalBtn.classList.toggle('chaos-active', !globalIsOrder);
      updateDynamicLabels();

      const heroTargetShape = globalIsOrder ? 'astrolabe' : 'chaos';
      exhibits.hero?.setShape?.(heroTargetShape);
      document.querySelectorAll('.morph-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.shape === heroTargetShape);
      });

      ['chronos', 'flux', 'constellation'].forEach((key) => {
        exhibits[key]?.setMode?.(state);
        const group = document.querySelector(`.state-toggle[data-exhibit="${key}"]`);
        if (group) {
          group.querySelectorAll('.state-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.state === state);
          });
        }
      });

      const prismTarget = globalIsOrder ? 'glyphs' : 'chaos';
      exhibits.prism?.setMode?.(prismTarget);
      document.querySelectorAll('#prism-modes .prism-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.mode === prismTarget);
      });
      return;
    }

    // i. Lightbox Open (Zoom button or clicking on protected image frame)
    const zoomBtn = e.target.closest('.zoom-art-btn');
    if (zoomBtn) {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(zoomBtn.dataset.plate, zoomBtn.dataset.plateSrc);
      return;
    }

    const protectedBox = e.target.closest('.protected-img-box, .gallery-img-wrap');
    if (protectedBox && !e.target.closest('button')) {
      const container = protectedBox.closest('[data-plate]');
      const targetNode = container || protectedBox;
      const plateKey = targetNode.dataset.plate;
      const plateSrc = targetNode.dataset.plateSrc || protectedBox.querySelector('img')?.getAttribute('src');
      if (plateSrc) {
        openLightbox(plateKey, plateSrc);
      }
      return;
    }

    // j. Lightbox Close
    if (e.target.closest('#close-lightbox') || e.target.classList.contains('lightbox-backdrop') || e.target.id === 'art-lightbox') {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // 2. Anti-Copy Context Menu & Drag Interception on Artworks & Interactive Canvases
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.plaque-art-frame, .gallery-img-wrap, .art-lightbox, .canvas-viewport, .hero-canvas')) {
      e.preventDefault();
      showProvenanceToast();
    }
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('.plaque-art-frame, .gallery-img-wrap, .art-lightbox')) {
      e.preventDefault();
      showProvenanceToast();
    }
  });

  // 3. Isolate each exhibit initialization inside try/catch so no visual engine can block UI controls
  try {
    exhibits.hero = initHeroField(document.getElementById('hero-canvas'), currentLang);
  } catch (err) {
    console.error('Hero initialization failed:', err);
  }

  try {
    exhibits.chronos = initChronosAstrolabe(
      document.getElementById('chronos-canvas'),
      document.getElementById('chronos-metrics'),
      currentLang
    );
  } catch (err) {
    console.error('Chronos initialization failed:', err);
  }

  try {
    exhibits.flux = initValueLoom(
      document.getElementById('flux-canvas'),
      document.getElementById('flux-metrics'),
      currentLang
    );
  } catch (err) {
    console.error('Value Loom initialization failed:', err);
  }

  try {
    exhibits.constellation = initScenarioConstellation(
      document.getElementById('constellation-svg-host'),
      {
        title: document.getElementById('ci-title'),
        meta: document.getElementById('ci-meta'),
        pain: document.getElementById('ci-pain'),
        solution: document.getElementById('ci-solution'),
        anti: document.getElementById('ci-anti'),
      },
      currentLang
    );
  } catch (err) {
    console.error('Constellation initialization failed:', err);
  }

  try {
    exhibits.prism = initTruthPrism(
      document.getElementById('prism-svg-host'),
      {
        stageTitle: document.getElementById('prism-stage-title'),
        stageDesc: document.getElementById('prism-stage-desc'),
        lesson: document.getElementById('prism-lesson'),
        hudMetrics: document.getElementById('prism-metrics'),
      },
      currentLang
    );
  } catch (err) {
    console.error('Truth Prism initialization failed:', err);
  }

  // Ensure initial pure-Chinese DOM consistency
  applyLanguage('zh');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
