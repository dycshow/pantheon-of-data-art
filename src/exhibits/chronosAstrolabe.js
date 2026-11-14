// Hall I: Chronos Astrolabe
// D3 radial geometry + Canvas2D spring physics transforming 365 fragmented days into an astronomical radial rose
import * as d3 from 'd3';
import {
  CHRONOS_CATEGORIES,
  CHRONOS_MONTHS,
  generateChronosYearData,
} from '../data/curatedData.js';
import { I18N } from '../i18n.js';
import { drawCanvasWatermark } from './watermarkHelper.js';

export function initChronosAstrolabe(canvas, hudMetricsEl, langInit = 'zh') {
  const ctx = canvas.getContext('2d');
  const days = generateChronosYearData();
  let width = 800;
  let height = 620;
  let dpr = 1;
  let mode = 'order'; // 'order' | 'chaos'
  let activeFilter = 'all';
  let currentLang = langInit;
  let hoveredDay = null;
  let t = 0;

  const dayParticles = days.map((d, i) => ({
    ...d,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ox: 0,
    oy: 0,
    chaosAngle: (i * 2.39996) % (Math.PI * 2),
    chaosRad: 0.12 + ((i * 37) % 100) / 140,
  }));

  const noiseSparks = Array.from({ length: 380 }, (_, i) => ({
    idx: i,
    x: 0,
    y: 0,
    seedA: Math.random() * Math.PI * 2,
    seedR: 0.15 + Math.random() * 0.72,
    color: i % 3 === 0 ? '#E05A47' : 'rgba(244,239,230,0.45)',
  }));

  function updateHudDefault() {
    if (!hudMetricsEl) return;
    const dict = I18N[currentLang] || I18N.zh;
    hudMetricsEl.textContent = mode === 'order' ? dict.chronosHudOrder : dict.chronosHudChaos;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, rect.width);
    height = Math.max(620, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getOrderGeometry(d) {
    const cx = width * 0.5;
    const cy = height * 0.53;
    const maxR = Math.min(width, height) * 0.36;
    const innerR = maxR * 0.34;
    const angleScale = d3.scaleLinear().domain([0, 365]).range([-Math.PI / 2, Math.PI * 1.5]);
    const theta = angleScale(d.dayIndex);

    let metricVal = d.totalFocus;
    if (activeFilter === 'deep') metricVal = d.deepHours * 1.25;
    else if (activeFilter === 'ai') metricVal = d.aiHours * 1.85;
    else if (activeFilter === 'frag') metricVal = d.fragHours * 1.3;
    else if (activeFilter === 'rest') metricVal = d.restHours * 1.5;

    const r = innerR + Math.min(1, metricVal / 10.5) * (maxR - innerR);
    return {
      cx,
      cy,
      innerR,
      maxR,
      theta,
      r,
      tx: cx + Math.cos(theta) * r,
      ty: cy + Math.sin(theta) * r,
      ix: cx + Math.cos(theta) * innerR,
      iy: cy + Math.sin(theta) * innerR,
    };
  }

  function draw() {
    t += 0.014;
    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.53;
    const maxR = Math.min(width, height) * 0.36;
    const innerR = maxR * 0.34;

    const dialAlpha = mode === 'order' ? 1 : 0.14;
    ctx.save();
    ctx.globalAlpha = dialAlpha;

    [0.34, 0.56, 0.78, 1.0].forEach((ratio, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 0 ? 'rgba(212,175,55,0.4)' : 'rgba(244,239,230,0.09)';
      ctx.lineWidth = idx === 0 ? 1.2 : 1;
      if (idx === 2) ctx.setLineDash([3, 5]);
      else ctx.setLineDash([]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const monthNames = CHRONOS_MONTHS[currentLang] || CHRONOS_MONTHS.zh;
    ctx.font =
      currentLang === 'zh'
        ? '11px "Noto Serif SC", "Songti SC", serif'
        : '10px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    monthNames.forEach((m, mIdx) => {
      const a = (mIdx / 12) * Math.PI * 2 - Math.PI / 2;
      const sx = cx + Math.cos(a) * innerR;
      const sy = cy + Math.sin(a) * innerR;
      const ex = cx + Math.cos(a) * (maxR + 14);
      const ey = cy + Math.sin(a) * (maxR + 14);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = 'rgba(244,239,230,0.08)';
      ctx.stroke();

      const lx = cx + Math.cos(a + Math.PI / 12) * (maxR + 28);
      const ly = cy + Math.sin(a + Math.PI / 12) * (maxR + 28);
      ctx.fillText(m, lx, ly);
    });
    ctx.restore();

    dayParticles.forEach((p, idx) => {
      const geo = getOrderGeometry(p);
      let targetX, targetY;

      if (mode === 'order') {
        targetX = geo.tx;
        targetY = geo.ty;
      } else {
        const driftAngle = p.chaosAngle + t * 0.22 * (idx % 2 === 0 ? 1 : -1);
        const driftR = maxR * p.chaosRad + Math.sin(t + idx * 0.2) * 26;
        targetX = cx + Math.cos(driftAngle) * driftR * 1.25;
        targetY = cy + Math.sin(driftAngle) * driftR * 0.9;
      }

      const k = mode === 'order' ? 0.09 : 0.025;
      const damp = mode === 'order' ? 0.8 : 0.92;
      p.vx = (p.vx + (targetX - p.x) * k) * damp;
      p.vy = (p.vy + (targetY - p.y) * k) * damp;
      p.x += p.vx;
      p.y += p.vy;
      p.ox = geo.ix;
      p.oy = geo.iy;

      const isMatch = activeFilter === 'all' || p.dominant === activeFilter;
      const isHovered = hoveredDay && hoveredDay.dayIndex === p.dayIndex;
      const baseColor = CHRONOS_CATEGORIES[p.dominant].color;

      if (mode === 'order') {
        ctx.beginPath();
        ctx.moveTo(geo.ix, geo.iy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = isHovered ? '#F4EFE6' : baseColor;
        ctx.globalAlpha = isHovered ? 0.95 : isMatch ? 0.42 : 0.08;
        ctx.lineWidth = isHovered ? 2.2 : p.streakLen >= 4 ? 1.5 : 0.85;
        ctx.stroke();
      }

      ctx.beginPath();
      const radius = isHovered ? 5.5 : p.streakLen >= 4 && isMatch ? 2.8 : 1.9;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#F4EFE6' : baseColor;
      ctx.globalAlpha = isHovered ? 1 : isMatch ? 0.92 : 0.16;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (mode === 'order' && (activeFilter === 'all' || activeFilter === 'deep' || activeFilter === 'ai')) {
      ctx.save();
      for (let i = 1; i < dayParticles.length; i++) {
        const prev = dayParticles[i - 1];
        const curr = dayParticles[i];
        if (curr.streakLen >= 3 && prev.streakLen >= 2) {
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.quadraticCurveTo(cx, cy, curr.x, curr.y);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.17)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    if (mode === 'chaos') {
      noiseSparks.forEach((s) => {
        const a = s.seedA + t * 0.45 * (s.idx % 2 === 0 ? 1 : -1);
        const r = maxR * s.seedR + Math.cos(t * 1.4 + s.idx) * 28;
        const tx = cx + Math.cos(a) * r * 1.25;
        const ty = cy + Math.sin(a) * r * 0.95;
        s.x += (tx - s.x) * 0.04;
        s.y += (ty - s.y) * 0.04;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.48;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Center Astrolabe Medallion Summary (pure Chinese or pure English)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F4EFE6';
    const titleFont =
      currentLang === 'zh'
        ? '600 17px "Noto Serif SC", "Songti SC", serif'
        : '600 18px "Cormorant Garamond", Georgia, serif';
    const subFont =
      currentLang === 'zh'
        ? '500 11px "Noto Serif SC", "Songti SC", serif'
        : '500 10.5px "Cormorant Garamond", Georgia, serif';

    ctx.font = titleFont;
    const centerMain =
      currentLang === 'zh'
        ? mode === 'order'
          ? '三百六十五日'
          : '混沌之境'
        : mode === 'order'
          ? '365 DAYS'
          : 'RAW ENTROPY';
    ctx.fillText(centerMain, cx, cy - 6);

    ctx.fillStyle = mode === 'order' ? '#D4AF37' : '#E05A47';
    ctx.font = subFont;
    const centerSub =
      currentLang === 'zh'
        ? mode === 'order'
          ? '径向天体年轮'
          : '未映射时间碎片'
        : mode === 'order'
          ? 'RADIAL COSMOS'
          : 'UNMAPPED NOISE';
    ctx.fillText(centerSub, cx, cy + 14);
    ctx.restore();

    drawCanvasWatermark(ctx, width, height, currentLang, 82);
    requestAnimationFrame(draw);
  }

  resize();
  dayParticles.forEach((p) => {
    const geo = getOrderGeometry(p);
    p.x = geo.tx;
    p.y = geo.ty;
  });
  noiseSparks.forEach((s) => {
    s.x = width * 0.5 + (Math.random() - 0.5) * 300;
    s.y = height * 0.5 + (Math.random() - 0.5) * 300;
  });

  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = null;
    let bestDist = 420;
    for (const p of dayParticles) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        best = p;
      }
    }
    hoveredDay = best;
    if (best && hudMetricsEl) {
      const catName = CHRONOS_CATEGORIES[best.dominant].name[currentLang];
      const dateStr = best.dateLabel[currentLang];
      if (currentLang === 'zh') {
        hudMetricsEl.innerHTML =
          `<strong>${dateStr}</strong> —— 深度创造 ${best.deepHours} 小时 · AI 协同杠杆 ${best.aiHours} 小时 · 碎片打断 ${best.fragHours} 小时 · 主导状态：${catName}` +
          (best.streakLen >= 3 ? ` · 连续心流第 ${best.streakLen} 天` : '');
      } else {
        hudMetricsEl.innerHTML =
          `<strong>${dateStr}</strong> — Deep Work ${best.deepHours}h · AI Leverage ${best.aiHours}h · Interrupted ${best.fragHours}h · Dominant: ${catName}` +
          (best.streakLen >= 3 ? ` · Flow Streak Day ${best.streakLen}` : '');
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredDay = null;
    updateHudDefault();
  });

  updateHudDefault();
  requestAnimationFrame(draw);

  return {
    setMode(nextMode) {
      mode = nextMode;
      updateHudDefault();
    },
    setFilter(filter) {
      activeFilter = filter;
    },
    setLang(newLang) {
      currentLang = newLang;
      updateHudDefault();
    },
  };
}
