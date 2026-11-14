// Hall II: 《价值的河床 · The Loom of Value》
// Multi-stage Cubic-Bezier Alluvial Loom + 600 flowing luminescent particles
// Supports Chaos Rain <-> Order Loom AND "认知觉醒干预 (AI + 系统重构)" live flow rerouting
import { VALUE_FLOW_MODEL } from '../data/curatedData.js';

export function initValueLoom(canvas, hudMetricsEl) {
  const ctx = canvas.getContext('2d');
  let width = 820;
  let height = 620;
  let dpr = 1;
  let mode = 'order'; // 'order' | 'chaos'
  let awakened = false;
  let hoveredNodeId = null;
  let t = 0;

  let currentLinks = VALUE_FLOW_MODEL.baselineLinks.map((l) => ({ ...l }));
  let targetLinks = VALUE_FLOW_MODEL.baselineLinks;

  const droplets = Array.from({ length: 560 }, (_, i) => ({
    idx: i,
    linkIdx: i % currentLinks.length,
    progress: (i * 0.037) % 1,
    speed: 0.0022 + (i % 9) * 0.00028,
    offsetNorm: ((i * 19) % 100) / 100 - 0.5,
    rainX: Math.random(),
    rainY: Math.random(),
    rainVy: 0.0025 + Math.random() * 0.0045,
    size: i % 11 === 0 ? 2.4 : 1.5,
  }));

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = Math.max(620, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function computeLayout() {
    const padX = Math.max(76, width * 0.09);
    const topY = 92;
    const bottomY = height - 88;
    const usableH = bottomY - topY;
    const colXs = [padX, width * 0.5, width - padX];

    const nodeRects = {};
    for (let col = 0; col < 3; col++) {
      const colNodes = VALUE_FLOW_MODEL.nodes.filter((n) => n.col === col);
      const totals = colNodes.map((n) => {
        const inSum = currentLinks.filter((l) => l.target === n.id).reduce((s, l) => s + l.value, 0);
        const outSum = currentLinks.filter((l) => l.source === n.id).reduce((s, l) => s + l.value, 0);
        return Math.max(inSum, outSum, 8);
      });
      const sumTotal = totals.reduce((a, b) => a + b, 0);
      const gap = 22;
      const availH = usableH - gap * (colNodes.length - 1);

      let cursorY = topY;
      colNodes.forEach((n, idx) => {
        const h = Math.max(26, (totals[idx] / sumTotal) * availH);
        nodeRects[n.id] = {
          ...n,
          x: colXs[col],
          y: cursorY,
          h,
          total: totals[idx],
          outCursor: cursorY,
          inCursor: cursorY,
        };
        cursorY += h + gap;
      });
    }

    const ribbonPaths = currentLinks.map((link, idx) => {
      const src = nodeRects[link.source];
      const dst = nodeRects[link.target];
      const srcH = (link.value / src.total) * src.h;
      const dstH = (link.value / dst.total) * dst.h;

      const sy0 = src.outCursor;
      const sy1 = sy0 + srcH;
      src.outCursor = sy1;

      const dy0 = dst.inCursor;
      const dy1 = dy0 + dstH;
      dst.inCursor = dy1;

      return {
        idx,
        source: link.source,
        target: link.target,
        value: link.value,
        x0: src.x + 8,
        x1: dst.x - 8,
        sy0,
        sy1,
        dy0,
        dy1,
        srcColor: src.color,
        dstColor: dst.color,
      };
    });

    return { nodeRects, ribbonPaths };
  }

  function cubicPt(x0, y0, x1, y1, p) {
    const cx0 = x0 + (x1 - x0) * 0.5;
    const cx1 = x0 + (x1 - x0) * 0.5;
    const u = 1 - p;
    const x = u * u * u * x0 + 3 * u * u * p * cx0 + 3 * u * p * p * cx1 + p * p * p * x1;
    const y = u * u * u * y0 + 3 * u * u * p * y0 + 3 * u * p * p * y1 + p * p * p * y1;
    return { x, y };
  }

  function draw() {
    t += 0.016;
    // Smoothly interpolate flow weights toward targetLinks (Baseline vs Awakened)
    for (let i = 0; i < currentLinks.length; i++) {
      currentLinks[i].value += (targetLinks[i].value - currentLinks[i].value) * 0.07;
    }

    ctx.clearRect(0, 0, width, height);
    const { nodeRects, ribbonPaths } = computeLayout();

    if (mode === 'chaos') {
      // Chaotic resource rainstorm: unreadable noise droplets falling endlessly
      droplets.forEach((d) => {
        d.rainY += d.rainVy;
        d.rainX += Math.sin(t * 1.4 + d.idx) * 0.0008;
        if (d.rainY > 1.04) {
          d.rainY = -0.04;
          d.rainX = Math.random();
        }
        const px = d.rainX * width;
        const py = d.rainY * height;
        const col = d.idx % 5 === 0 ? '#E05A47' : d.idx % 3 === 0 ? '#D4AF37' : '#3B8EA5';
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(px, py, d.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(244,239,230,0.82)';
      ctx.font = '600 20px "Cormorant Garamond", serif';
      ctx.fillText('UNCHARTED ENTROPY STREAM', width * 0.5, height * 0.48);
      ctx.fillStyle = '#E05A47';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('数百笔开销与时间碎片如暴雨般坠落，无法看出因果流向', width * 0.5, height * 0.53);
      ctx.restore();

      requestAnimationFrame(draw);
      return;
    }

    // Order Mode: Draw Alluvial Silk Ribbons
    ribbonPaths.forEach((r) => {
      const isHighlighted =
        !hoveredNodeId || r.source === hoveredNodeId || r.target === hoveredNodeId;
      const cx = (r.x0 + r.x1) * 0.5;

      const grad = ctx.createLinearGradient(r.x0, 0, r.x1, 0);
      grad.addColorStop(0, r.srcColor);
      grad.addColorStop(1, r.dstColor);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(r.x0, r.sy0);
      ctx.bezierCurveTo(cx, r.sy0, cx, r.dy0, r.x1, r.dy0);
      ctx.lineTo(r.x1, r.dy1);
      ctx.bezierCurveTo(cx, r.dy1, cx, r.sy1, r.x0, r.sy1);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.globalAlpha = isHighlighted ? (hoveredNodeId ? 0.34 : 0.17) : 0.04;
      ctx.fill();

      // Delicate silk hairline edge
      ctx.beginPath();
      ctx.moveTo(r.x0, (r.sy0 + r.sy1) * 0.5);
      ctx.bezierCurveTo(cx, (r.sy0 + r.sy1) * 0.5, cx, (r.dy0 + r.dy1) * 0.5, r.x1, (r.dy0 + r.dy1) * 0.5);
      ctx.strokeStyle = grad;
      ctx.globalAlpha = isHighlighted ? 0.48 : 0.07;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    // Update & draw flowing luminescent energy droplets along ribbons
    const totalVal = ribbonPaths.reduce((s, r) => s + r.value, 0);
    droplets.forEach((d) => {
      d.progress += d.speed;
      if (d.progress > 1) {
        d.progress -= 1;
        // Pick ribbon proportional to current flow weight
        let targetW = ((d.idx * 97 + Math.floor(t * 10)) % 1000) / 1000 * totalVal;
        let chosen = 0;
        for (let i = 0; i < ribbonPaths.length; i++) {
          targetW -= ribbonPaths[i].value;
          if (targetW <= 0) {
            chosen = i;
            break;
          }
        }
        d.linkIdx = chosen;
      }

      const r = ribbonPaths[d.linkIdx] || ribbonPaths[0];
      const isHighlighted =
        !hoveredNodeId || r.source === hoveredNodeId || r.target === hoveredNodeId;

      const sy = (r.sy0 + r.sy1) * 0.5 + d.offsetNorm * (r.sy1 - r.sy0) * 0.85;
      const dy = (r.dy0 + r.dy1) * 0.5 + d.offsetNorm * (r.dy1 - r.dy0) * 0.85;
      const pt = cubicPt(r.x0, sy, r.x1, dy, d.progress);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = d.progress < 0.5 ? r.srcColor : r.dstColor;
      ctx.globalAlpha = isHighlighted ? 0.85 : 0.12;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Architectural Node Pillars & Labels
    Object.values(nodeRects).forEach((n) => {
      const isActive = !hoveredNodeId || hoveredNodeId === n.id;
      ctx.save();
      ctx.globalAlpha = isActive ? 1 : 0.35;
      ctx.fillStyle = n.color;
      ctx.fillRect(n.x - 4, n.y, 8, n.h);
      ctx.strokeStyle = 'rgba(244,239,230,0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(n.x - 4, n.y, 8, n.h);

      const alignRight = n.col === 2;
      const alignCenter = n.col === 1;
      const textX = alignRight ? n.x - 14 : alignCenter ? n.x + 14 : n.x + 14;
      ctx.textAlign = alignRight ? 'right' : 'left';
      ctx.fillStyle = '#F4EFE6';
      ctx.font = '600 13px "Noto Serif SC", serif';
      ctx.fillText(n.label, textX, n.y + n.h * 0.5 - 4);
      ctx.fillStyle = 'rgba(244,239,230,0.56)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${n.en} · ${Math.round(n.total)}u`, textX, n.y + n.h * 0.5 + 12);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    if (mode !== 'order') return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { nodeRects } = computeLayout();
    let hit = null;
    for (const n of Object.values(nodeRects)) {
      if (Math.abs(mx - n.x) < 95 && my >= n.y - 6 && my <= n.y + n.h + 6) {
        hit = n;
        break;
      }
    }
    hoveredNodeId = hit ? hit.id : null;
    if (hit && hudMetricsEl) {
      hudMetricsEl.innerHTML = `<strong>${hit.label} (${hit.en})</strong> — 当前总流量 ${Math.round(hit.total)} 能量单位`;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredNodeId = null;
  });

  requestAnimationFrame(draw);

  return {
    setMode(nextMode) {
      mode = nextMode;
      if (hudMetricsEl) {
        hudMetricsEl.textContent =
          nextMode === 'order'
            ? awakened
              ? '认知觉醒干预已激活：34% 隐形内耗已重构为「深度学习」与「时间自由度净值」'
              : '基准现实流向：点击右上角「认知觉醒干预」观察资源流向如何剧变'
            : '混沌雨幕：没有流向结构的账单，让人根本找不到真正的价值漏斗';
      }
    },
    toggleIntervention() {
      awakened = !awakened;
      targetLinks = awakened ? VALUE_FLOW_MODEL.awakenedLinks : VALUE_FLOW_MODEL.baselineLinks;
      if (hudMetricsEl) {
        hudMetricsEl.textContent = awakened
          ? '认知觉醒干预已开启：隐形熵增损耗从 68u 锐减至 20u，长期护城河与自由度翻倍扩张'
          : '已切换回基准现实流向（存在明显的情绪内耗与隐形订阅漏损）';
      }
      return awakened;
    },
  };
}
