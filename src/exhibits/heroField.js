// Hero Atrium: 1,500-particle Living Entropy-to-Cosmos Canvas2D Physics Engine
import { drawCanvasWatermark } from './watermarkHelper.js';

const SHAPE_LABELS = {
  zh: {
    chaos: '当前形态：壹 · 混沌星云（原始熵流）',
    astrolabe: '当前形态：贰 · 天体星盘（同心秩序）',
    phyllotaxis: '当前形态：叁 · 斐波那契螺旋（自然律动）',
    harmonic: '当前形态：肆 · 谐振波矩阵（结构平衡）',
  },
  en: {
    chaos: 'ACTIVE MORPHOLOGY: 01 · RAW NEBULA (ENTROPY)',
    astrolabe: 'ACTIVE MORPHOLOGY: 02 · CELESTIAL ASTROLABE',
    phyllotaxis: 'ACTIVE MORPHOLOGY: 03 · FIBONACCI PHYLLOTAXIS',
    harmonic: 'ACTIVE MORPHOLOGY: 04 · HARMONIC MATRIX',
  },
};

export function initHeroField(canvas, langInit = 'zh') {
  const ctx = canvas.getContext('2d');
  const COUNT = 1500;
  let width = 1200;
  let height = 760;
  let dpr = 1;
  let currentShape = 'astrolabe';
  let currentLang = langInit;
  let time = 0;
  let mouse = { x: -9999, y: -9999, active: false };

  const palette = ['#D4AF37', '#D4AF37', '#F4EFE6', '#3B8EA5', '#E05A47'];

  const particles = Array.from({ length: COUNT }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 0.45 + 0.05;
    return {
      idx: i,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      seedAngle: angle,
      seedRad: rad,
      size: i % 17 === 0 ? 2.4 : i % 5 === 0 ? 1.6 : 1.1,
      color: palette[i % palette.length],
      alpha: 0.35 + (i % 7) * 0.09,
    };
  });

  function updateReadout() {
    const el = document.getElementById('hero-entropy-val');
    if (el) {
      el.textContent = SHAPE_LABELS[currentLang]?.[currentShape] || '';
    }
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, rect.width);
    height = Math.max(480, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function computeTarget(p, t) {
    const cx = width * 0.5;
    const cy = height * 0.48;
    const scale = Math.min(width, height) * 0.41;

    if (currentShape === 'chaos') {
      const swirl = p.seedAngle + t * 0.25 * (p.idx % 2 === 0 ? 1 : -1);
      const r = scale * (0.2 + p.seedRad * 1.6) + Math.sin(t * 0.9 + p.idx) * 38;
      return {
        x: cx + Math.cos(swirl) * r * 1.25 + Math.sin(p.idx * 1.7 + t) * 45,
        y: cy + Math.sin(swirl) * r * 0.9 + Math.cos(p.idx * 1.3 - t) * 45,
      };
    }

    if (currentShape === 'astrolabe') {
      const ring = p.idx % 7;
      const baseR = scale * (0.22 + ring * 0.125);
      const speed = (ring % 2 === 0 ? 1 : -1) * (0.08 + ring * 0.015);
      const theta = (p.idx / COUNT) * Math.PI * 2 * 7 + t * speed;
      const harmonic = Math.sin(theta * (ring + 2) + t * 0.4) * (ring === 3 ? 18 : 6);
      const r = baseR + harmonic;
      return {
        x: cx + Math.cos(theta) * r,
        y: cy + Math.sin(theta) * r,
      };
    }

    if (currentShape === 'phyllotaxis') {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const theta = p.idx * goldenAngle + t * 0.08;
      const r = Math.sqrt(p.idx / COUNT) * scale * 1.15;
      return {
        x: cx + Math.cos(theta) * r,
        y: cy + Math.sin(theta) * r,
      };
    }

    // harmonic wave matrix
    const cols = 50;
    const rows = COUNT / cols;
    const col = p.idx % cols;
    const row = Math.floor(p.idx / cols);
    const gx = (col / (cols - 1) - 0.5) * width * 0.78;
    const gy = (row / (rows - 1) - 0.5) * height * 0.58;
    const waveZ = Math.sin(col * 0.24 - t * 1.6) * 26 + Math.cos(row * 0.35 + t * 1.1) * 18;
    return {
      x: cx + gx,
      y: cy + gy + waveZ,
    };
  }

  function frame() {
    time += 0.016;
    ctx.fillStyle = 'rgba(7, 7, 9, 0.24)';
    ctx.fillRect(0, 0, width, height);

    if (currentShape === 'astrolabe') {
      const cx = width * 0.5;
      const cy = height * 0.48;
      const scale = Math.min(width, height) * 0.41;
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 6; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, scale * (0.22 + r * 0.125), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      const target = computeTarget(p, time);
      const spring = currentShape === 'chaos' ? 0.012 : 0.065;
      const damping = currentShape === 'chaos' ? 0.94 : 0.84;

      p.vx = (p.vx + (target.x - p.x) * spring) * damping;
      p.vy = (p.vy + (target.y - p.y) * spring) * damping;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 18000 && distSq > 1) {
          const force = (1 - distSq / 18000) * 2.8;
          const inv = 1 / Math.sqrt(distSq);
          p.vx += dx * inv * force;
          p.vy += dy * inv * force;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawCanvasWatermark(ctx, width, height, currentLang, 22);
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  particles.forEach((p) => {
    p.x = width * 0.5 + (Math.random() - 0.5) * width * 0.7;
    p.y = height * 0.48 + (Math.random() - 0.5) * height * 0.7;
  });

  updateReadout();
  requestAnimationFrame(frame);

  return {
    setShape(shape) {
      currentShape = shape;
      updateReadout();
    },
    setMode(shape) {
      currentShape = shape;
      updateReadout();
    },
    setLang(newLang) {
      currentLang = newLang;
      updateReadout();
    },
  };
}
