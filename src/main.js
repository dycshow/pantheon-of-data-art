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

  // Curatorial Audio Guide State (paired with MiMo TTS acoustic tracks)
  const AUDIO_TRACKS = [
    { id: '00-prologue', titleKey: 'audioTitle00', sectionId: 'atrium' },
    { id: '01-chronos', titleKey: 'audioTitle01', sectionId: 'hall-chronos' },
    { id: '02-flux', titleKey: 'audioTitle02', sectionId: 'hall-flux' },
    { id: '03-constellation', titleKey: 'audioTitle03', sectionId: 'hall-constellation' },
    { id: '04-prism', titleKey: 'audioTitle04', sectionId: 'hall-prism' },
    { id: '05-sanctuary', titleKey: 'audioTitle05', sectionId: 'hall-sanctuary' },
  ];
  const guideAudio = new Audio();
  guideAudio.id = 'curatorial-audio-player';
  guideAudio.preload = 'metadata';
  document.getElementById('audio-guide-dock')?.appendChild(guideAudio);

  let activeTrackIdx = -1;
  let autoTourEnabled = true;
  let dockDismissed = false;

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

  function formatAudioTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function getAudioSrc(trackId, lang) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}assets/audio/${trackId}-${lang}.mp3`;
  }

  function syncAudioUI() {
    const dict = I18N[currentLang];
    const hasTrack = activeTrackIdx >= 0 && activeTrackIdx < AUDIO_TRACKS.length;
    const activeTrack = hasTrack ? AUDIO_TRACKS[activeTrackIdx] : null;
    const isPlaying = hasTrack && !guideAudio.paused && !guideAudio.ended;
    const curSec = guideAudio.currentTime || 0;
    const durSec = Number.isFinite(guideAudio.duration) ? guideAudio.duration : 0;
    const timeStr = `${formatAudioTime(curSec)} / ${formatAudioTime(durSec)}`;

    const tourBtn = document.getElementById('btn-audio-tour');
    const tourLabel = document.getElementById('audio-tour-label');
    if (tourBtn && tourLabel) {
      tourBtn.classList.toggle('is-playing', isPlaying);
      tourLabel.textContent = isPlaying ? dict.navAudioTourPlaying : dict.navAudioTour;
    }

    document.querySelectorAll('.audio-guide-btn').forEach((btn) => {
      const btnId = btn.dataset.audioId;
      const isCurrent = Boolean(activeTrack && activeTrack.id === btnId);
      const isThisPlaying = isCurrent && isPlaying;
      btn.classList.toggle('is-playing', isThisPlaying);
      const labelEl = btn.querySelector('.audio-btn-text');
      const timeEl = btn.querySelector('.audio-btn-time');
      if (labelEl) {
        const defaultKey = btn.dataset.labelKey || 'audioListenHall';
        labelEl.textContent = isThisPlaying ? dict.audioPlayingHall : dict[defaultKey];
      }
      if (timeEl) {
        timeEl.textContent = isCurrent && durSec > 0 ? timeStr : '';
      }
    });

    const dock = document.getElementById('audio-guide-dock');
    if (dock) {
      const showDock = hasTrack && !dockDismissed;
      dock.classList.toggle('visible', showDock);
      dock.setAttribute('aria-hidden', showDock ? 'false' : 'true');
    }

    const dockEq = document.getElementById('audio-dock-eq');
    if (dockEq) dockEq.classList.toggle('is-playing', isPlaying);

    const dockTitle = document.getElementById('audio-dock-title');
    if (dockTitle && activeTrack) {
      dockTitle.textContent = dict[activeTrack.titleKey] || '';
    }

    const dockVoice = document.getElementById('audio-dock-voice');
    if (dockVoice) {
      dockVoice.textContent = dict.audioVoiceBadge;
    }

    const dockToggle = document.getElementById('audio-dock-toggle');
    if (dockToggle) {
      dockToggle.textContent = isPlaying ? dict.audioBtnPause : dict.audioBtnPlay;
    }

    const dockPrev = document.getElementById('audio-dock-prev');
    if (dockPrev) {
      dockPrev.title = dict.audioPrevTrack;
      dockPrev.setAttribute('aria-label', dict.audioPrevTrack);
    }

    const dockNext = document.getElementById('audio-dock-next');
    if (dockNext) {
      dockNext.title = dict.audioNextTrack;
      dockNext.setAttribute('aria-label', dict.audioNextTrack);
    }

    const dockClose = document.getElementById('audio-dock-close');
    if (dockClose) {
      dockClose.title = dict.audioCloseDock;
      dockClose.setAttribute('aria-label', dict.audioCloseDock);
    }

    const dockAutoTour = document.getElementById('audio-dock-autotour');
    if (dockAutoTour) {
      dockAutoTour.classList.toggle('active', autoTourEnabled);
      dockAutoTour.textContent = autoTourEnabled ? dict.audioAutoTourOn : dict.audioAutoTourOff;
    }

    const dockSeek = document.getElementById('audio-dock-seek');
    if (dockSeek) {
      dockSeek.max = durSec > 0 ? String(durSec) : '100';
      dockSeek.value = durSec > 0 ? String(Math.min(curSec, durSec)) : '0';
    }

    const dockTime = document.getElementById('audio-dock-time');
    if (dockTime) {
      dockTime.textContent = timeStr;
    }
  }

  function playTrackAt(index, { scroll = false } = {}) {
    if (index < 0 || index >= AUDIO_TRACKS.length) return;
    const track = AUDIO_TRACKS[index];
    dockDismissed = false;
    activeTrackIdx = index;

    const targetUrl = new URL(getAudioSrc(track.id, currentLang), window.location.href).href;
    if (guideAudio.src !== targetUrl) {
      guideAudio.src = targetUrl;
    }
    if (scroll) {
      document.getElementById(track.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const playPromise = guideAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => console.warn('Audio playback warning:', err));
    }
    syncAudioUI();
  }

  function toggleTrackById(trackId) {
    const idx = AUDIO_TRACKS.findIndex((t) => t.id === trackId);
    if (idx === -1) return;
    if (activeTrackIdx === idx) {
      dockDismissed = false;
      if (guideAudio.paused || guideAudio.ended) {
        if (guideAudio.ended) guideAudio.currentTime = 0;
        guideAudio.play().catch((err) => console.warn('Audio playback warning:', err));
      } else {
        guideAudio.pause();
      }
      syncAudioUI();
      return;
    }
    playTrackAt(idx, { scroll: false });
  }

  guideAudio.addEventListener('timeupdate', syncAudioUI);
  guideAudio.addEventListener('loadedmetadata', syncAudioUI);
  guideAudio.addEventListener('play', syncAudioUI);
  guideAudio.addEventListener('pause', syncAudioUI);
  guideAudio.addEventListener('ended', () => {
    if (autoTourEnabled && activeTrackIdx >= 0 && activeTrackIdx + 1 < AUDIO_TRACKS.length) {
      playTrackAt(activeTrackIdx + 1, { scroll: true });
    } else {
      syncAudioUI();
    }
  });

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

    syncAudioUI();
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

    // Update active lightbox caption if open
    const lightbox = document.getElementById('art-lightbox');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const activePlateKey = lightbox?.getAttribute('data-active-plate');
    if (activePlateKey && lightboxCaption) {
      const capKey = `${activePlateKey}LightTitle`;
      if (dict[capKey]) lightboxCaption.textContent = dict[capKey];
    }

    updateDynamicLabels();

    // Seamlessly switch active audio guide language when toggling 中文 <-> EN
    if (activeTrackIdx >= 0 && activeTrackIdx < AUDIO_TRACKS.length) {
      const track = AUDIO_TRACKS[activeTrackIdx];
      const nextUrl = new URL(getAudioSrc(track.id, currentLang), window.location.href).href;
      if (guideAudio.src !== nextUrl) {
        const wasPlaying = !guideAudio.paused && !guideAudio.ended;
        guideAudio.src = nextUrl;
        guideAudio.load();
        if (wasPlaying) {
          guideAudio.play().catch((err) => console.warn('Audio switch playback warning:', err));
        }
        syncAudioUI();
      }
    }

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

    // a2. Header Audio Guide Tour button
    const tourBtn = e.target.closest('#btn-audio-tour');
    if (tourBtn) {
      e.preventDefault();
      autoTourEnabled = true;
      dockDismissed = false;
      if (activeTrackIdx === -1) {
        playTrackAt(0, { scroll: true });
      } else if (guideAudio.paused || guideAudio.ended) {
        if (guideAudio.ended) guideAudio.currentTime = 0;
        guideAudio.play().catch((err) => console.warn('Audio playback warning:', err));
        syncAudioUI();
      } else {
        guideAudio.pause();
        syncAudioUI();
      }
      return;
    }

    // a3. Per-hall Audio Guide buttons
    const audioHallBtn = e.target.closest('.audio-guide-btn');
    if (audioHallBtn) {
      e.preventDefault();
      toggleTrackById(audioHallBtn.dataset.audioId);
      return;
    }

    // a4. Floating Audio Dock controls
    if (e.target.closest('#audio-dock-toggle')) {
      e.preventDefault();
      if (activeTrackIdx === -1) {
        playTrackAt(0, { scroll: false });
      } else if (guideAudio.paused || guideAudio.ended) {
        if (guideAudio.ended) guideAudio.currentTime = 0;
        guideAudio.play().catch((err) => console.warn('Audio playback warning:', err));
      } else {
        guideAudio.pause();
      }
      syncAudioUI();
      return;
    }

    if (e.target.closest('#audio-dock-prev')) {
      e.preventDefault();
      const prevIdx = activeTrackIdx > 0 ? activeTrackIdx - 1 : 0;
      playTrackAt(prevIdx, { scroll: true });
      return;
    }

    if (e.target.closest('#audio-dock-next')) {
      e.preventDefault();
      const nextIdx = activeTrackIdx + 1 < AUDIO_TRACKS.length ? activeTrackIdx + 1 : 0;
      playTrackAt(nextIdx, { scroll: true });
      return;
    }

    if (e.target.closest('#audio-dock-autotour')) {
      e.preventDefault();
      autoTourEnabled = !autoTourEnabled;
      syncAudioUI();
      return;
    }

    if (e.target.closest('#audio-dock-close')) {
      e.preventDefault();
      guideAudio.pause();
      dockDismissed = true;
      syncAudioUI();
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

  document.getElementById('audio-dock-seek')?.addEventListener('input', (e) => {
    const val = Number.parseFloat(e.target.value);
    if (Number.isFinite(val) && Number.isFinite(guideAudio.duration)) {
      guideAudio.currentTime = Math.max(0, Math.min(val, guideAudio.duration));
      syncAudioUI();
    }
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
