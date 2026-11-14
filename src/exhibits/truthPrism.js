// Hall IV: The Prism of Truth
// Same 120-specimen dataset morphing across 5 encodings:
// 0. Chaos -> A. Bar Averages -> B. Force Beeswarm -> C. Trade-off Scatter -> D. Five-Petal Botanical Glyphs
import * as d3 from 'd3';
import {
  PRISM_ARCHETYPES,
  PRISM_STAGE_ESSAYS,
  generateDecisionCohort,
} from '../data/curatedData.js';

export function initTruthPrism(hostEl, els, langInit = 'zh') {
  const cohort = generateDecisionCohort();
  let currentMode = 'glyphs';
  let currentLang = langInit;

  const width = 820;
  const height = 620;
  const margin = { top: 88, right: 44, bottom: 92, left: 74 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  hostEl.innerHTML = '';
  const svg = d3
    .select(hostEl)
    .append('svg')
    .attr('class', 'prism-svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('width', '100%')
    .style('height', '100%');

  // Embedded SVG provenance watermark layer
  const wmGroup = svg.append('g').attr('class', 'svg-watermark-layer').attr('pointer-events', 'none');
  const wmDiagGroup = wmGroup
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2}) rotate(-26)`);
  const wmDiagLabels = [];
  for (let wy = -260; wy <= 260; wy += 180) {
    for (let wx = -320; wx <= 320; wx += 320) {
      wmDiagLabels.push(
        wmDiagGroup
          .append('text')
          .attr('x', wx)
          .attr('y', wy)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', 'rgba(212, 175, 55, 0.045)')
      );
    }
  }
  const wmCornerText = wmGroup
    .append('text')
    .attr('x', width - 20)
    .attr('y', height - 88)
    .attr('text-anchor', 'end')
    .style('font-size', '10.5px')
    .style('fill', 'rgba(212, 175, 55, 0.72)');

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const avgByArch = PRISM_ARCHETYPES.map((a) => {
    const sub = cohort.filter((d) => d.archetype === a.key);
    const mean = d3.mean(sub, (d) => d.composite);
    return { ...a, mean };
  });

  // 0. Chaos
  cohort.forEach((d, i) => {
    const a = (i * 2.39996) % (Math.PI * 2);
    const r = 40 + ((i * 31) % 210);
    d.posChaos = {
      x: innerW * 0.5 + Math.cos(a) * r * 1.35,
      y: innerH * 0.5 + Math.sin(a) * r * 0.85,
    };
  });

  // A. Bar Averages
  const xArch = d3.scaleBand().domain(PRISM_ARCHETYPES.map((a) => a.key)).range([20, innerW - 20]).padding(0.32);
  const yBar = d3.scaleLinear().domain([0, 100]).range([innerH - 24, 24]);

  const archBuckets = new Map(PRISM_ARCHETYPES.map((a) => [a.key, []]));
  cohort.forEach((d) => archBuckets.get(d.archetype).push(d));
  archBuckets.forEach((items, key) => {
    const bx = xArch(key);
    const bw = xArch.bandwidth();
    const meanVal = d3.mean(items, (d) => d.composite);
    const barTop = yBar(meanVal);
    const barBottom = yBar(0);
    const cols = 5;
    const rows = Math.ceil(items.length / cols);
    items.forEach((d, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      d.posBar = {
        x: bx + ((col + 0.5) / cols) * bw,
        y: barBottom - ((row + 0.5) / rows) * (barBottom - barTop),
      };
    });
  });

  // B. Force Beeswarm
  const xBee = d3.scaleLinear().domain([0, 100]).range([24, innerW - 24]);
  const yBandBee = d3.scaleBand().domain(PRISM_ARCHETYPES.map((a) => a.key)).range([20, innerH - 30]).padding(0.15);

  const beeNodes = cohort.map((d) => ({
    ...d,
    x: xBee(d.freedom),
    y: yBandBee(d.archetype) + yBandBee.bandwidth() * 0.5,
  }));
  const beeSim = d3
    .forceSimulation(beeNodes)
    .force('x', d3.forceX((d) => xBee(d.freedom)).strength(0.85))
    .force('y', d3.forceY((d) => yBandBee(d.archetype) + yBandBee.bandwidth() * 0.5).strength(0.65))
    .force('collide', d3.forceCollide(6.2))
    .stop();
  for (let i = 0; i < 160; i++) beeSim.tick();
  beeNodes.forEach((b, i) => {
    cohort[i].posBee = { x: b.x, y: b.y };
  });

  // C. Scatter
  const xScat = d3.scaleLinear().domain([0, 100]).range([28, innerW - 24]);
  const yScat = d3.scaleLinear().domain([0, 100]).range([innerH - 28, 22]);
  cohort.forEach((d) => {
    d.posScatter = { x: xScat(d.freedom), y: yScat(d.anxiety) };
  });

  // D. Botanical Glyphs Grid
  const sortedForGrid = [...cohort].sort((a, b) => b.compounding - a.compounding);
  const gCols = 12;
  const gRows = 10;
  sortedForGrid.forEach((d, idx) => {
    const c = idx % gCols;
    const r = Math.floor(idx / gCols);
    d.posGlyph = {
      x: ((c + 0.5) / gCols) * innerW,
      y: ((r + 0.5) / gRows) * innerH,
    };
  });

  const guideLayer = g.append('g').attr('class', 'prism-guides');
  const specimenLayer = g.append('g').attr('class', 'prism-specimens');

  function buildFlowerPath(d, scale = 1) {
    const dims = [d.creativity, d.financial, d.freedom, d.resilience, d.compounding];
    let path = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const len = (5 + (dims[i] / 100) * 14) * scale;
      const a1 = a - 0.28;
      const a2 = a + 0.28;
      const cx1 = Math.cos(a1) * len * 0.68;
      const cy1 = Math.sin(a1) * len * 0.68;
      const cx2 = Math.cos(a2) * len * 0.68;
      const cy2 = Math.sin(a2) * len * 0.68;
      const tipX = Math.cos(a) * len;
      const tipY = Math.sin(a) * len;
      path += `M0,0 Q${cx1.toFixed(1)},${cy1.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} Q${cx2.toFixed(1)},${cy2.toFixed(1)} 0,0 `;
    }
    return path;
  }

  const specimenGroups = specimenLayer
    .selectAll('g.specimen')
    .data(cohort)
    .join('g')
    .attr('class', 'specimen')
    .style('cursor', 'pointer')
    .style('transition', 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)')
    .attr('transform', (d) => `translate(${d.posGlyph.x}, ${d.posGlyph.y})`)
    .style('transform', (d) => `translate(${d.posGlyph.x}px, ${d.posGlyph.y}px)`);

  specimenGroups
    .append('path')
    .attr('class', 'petal-shape')
    .attr('d', (d) => buildFlowerPath(d, 1))
    .attr('fill', (d) => d.color)
    .attr('fill-opacity', 0.24)
    .attr('stroke', (d) => d.color)
    .attr('stroke-width', 1.1)
    .style('transition', 'opacity 0.55s ease');

  specimenGroups
    .append('circle')
    .attr('class', 'core-dot')
    .attr('r', 2.4)
    .attr('fill', (d) => d.color)
    .attr('stroke', '#070709')
    .attr('stroke-width', 0.8)
    .style('transition', 'r 0.45s ease');

  function updateHudDefault() {
    if (!els.hudMetrics) return;
    if (currentLang === 'zh') {
      els.hudMetrics.textContent = '当前视窗：一百二十个真实样本正在以多维几何形态并置呈现';
    } else {
      els.hudMetrics.textContent = 'Active Viewport: 120 human decision specimens mapped across multi-dimensional visual encodings.';
    }
  }

  specimenGroups
    .on('mouseenter', function (_, d) {
      d3.select(this).select('.core-dot').attr('r', 5).attr('fill', '#F4EFE6');
      d3.select(this).select('.petal-shape').attr('fill-opacity', 0.55).attr('stroke', '#F4EFE6');
      if (els.hudMetrics) {
        if (currentLang === 'zh') {
          els.hudMetrics.innerHTML =
            `<strong>${d.code.zh} · ${d.archetypeLabel.zh}</strong> —— 创造力 ${d.creativity} · 财务 ${d.financial} · 自由度 ${d.freedom} · 韧性 ${d.resilience} · 十年复利 ${d.compounding}（综合均值 ${d.composite}）`;
        } else {
          els.hudMetrics.innerHTML =
            `<strong>${d.code.en} · ${d.archetypeLabel.en}</strong> — Creativity ${d.creativity} · Finance ${d.financial} · Sovereignty ${d.freedom} · Resilience ${d.resilience} · Compounding ${d.compounding} (Mean ${d.composite})`;
        }
      }
    })
    .on('mouseleave', function (_, d) {
      d3.select(this)
        .select('.core-dot')
        .attr('r', currentMode === 'glyphs' ? 2.4 : 4.2)
        .attr('fill', d.color);
      d3.select(this).select('.petal-shape').attr('fill-opacity', 0.24).attr('stroke', d.color);
      updateHudDefault();
    });

  function renderWatermarks() {
    const fontFamily =
      currentLang === 'zh'
        ? '"Noto Serif SC", "Songti SC", serif'
        : '"Cormorant Garamond", Georgia, serif';
    const diagText = currentLang === 'zh' ? 'DYCSHOW · 万象归序' : 'DYCSHOW · PANTHEON OF ORDER';
    wmDiagLabels.forEach((el) => el.style('font-family', fontFamily).text(diagText));
    wmCornerText
      .style('font-family', fontFamily)
      .text(currentLang === 'zh' ? '© DYCSHOW · 万象归序艺术殿堂' : '© DYCSHOW · THE PANTHEON OF ORDER');
  }

  function renderGuides(mode) {
    guideLayer.selectAll('*').remove();
    const fontFamily =
      currentLang === 'zh'
        ? '"Noto Serif SC", "Songti SC", serif'
        : '"Cormorant Garamond", Georgia, serif';

    if (mode === 'bar') {
      avgByArch.forEach((a) => {
        guideLayer
          .append('rect')
          .attr('x', xArch(a.key))
          .attr('y', yBar(a.mean))
          .attr('width', xArch.bandwidth())
          .attr('height', yBar(0) - yBar(a.mean))
          .attr('fill', 'rgba(244,239,230,0.03)')
          .attr('stroke', a.color)
          .attr('stroke-dasharray', '4 3')
          .attr('stroke-opacity', 0.7);

        guideLayer
          .append('text')
          .attr('x', xArch(a.key) + xArch.bandwidth() * 0.5)
          .attr('y', yBar(a.mean) - 10)
          .attr('text-anchor', 'middle')
          .style('font-family', fontFamily)
          .style('font-size', '12px')
          .style('fill', '#F4EFE6')
          .text(
            currentLang === 'zh' ? `均值 ${a.mean.toFixed(1)}` : `MEAN ${a.mean.toFixed(1)}`
          );

        guideLayer
          .append('text')
          .attr('x', xArch(a.key) + xArch.bandwidth() * 0.5)
          .attr('y', innerH + 6)
          .attr('text-anchor', 'middle')
          .style('font-family', fontFamily)
          .style('font-size', '11.5px')
          .style('fill', a.color)
          .text(a.label[currentLang]);
      });
    } else if (mode === 'beeswarm') {
      guideLayer
        .append('g')
        .attr('transform', `translate(0, ${innerH - 16})`)
        .call(d3.axisBottom(xBee).ticks(5))
        .call((ax) => ax.selectAll('path,line').attr('stroke', 'rgba(244,239,230,0.22)'))
        .call((ax) => ax.selectAll('text').attr('fill', '#8C92A4').style('font-family', fontFamily));

      guideLayer
        .append('text')
        .attr('x', innerW * 0.5)
        .attr('y', innerH + 20)
        .attr('text-anchor', 'middle')
        .style('font-family', fontFamily)
        .style('font-size', '11px')
        .style('fill', '#D4AF37')
        .text(
          currentLang === 'zh'
            ? '时间自由度分布（零至一百）· 留意独立工匠群体内部的双峰撕裂'
            : 'Time Sovereignty Distribution (0 → 100) · Observe the sharp bimodal split inside Indie Craft'
        );

      PRISM_ARCHETYPES.forEach((a) => {
        const cy = yBandBee(a.key) + yBandBee.bandwidth() * 0.5;
        guideLayer
          .append('line')
          .attr('x1', 0)
          .attr('x2', innerW)
          .attr('y1', cy)
          .attr('y2', cy)
          .attr('stroke', 'rgba(244,239,230,0.07)');
        guideLayer
          .append('text')
          .attr('x', -8)
          .attr('y', cy)
          .attr('text-anchor', 'end')
          .attr('dy', '0.32em')
          .style('font-family', fontFamily)
          .style('font-size', '10.5px')
          .style('fill', a.color)
          .text(currentLang === 'zh' ? a.label.zh.slice(0, 4) : a.label.en.split(' ')[0]);
      });
    } else if (mode === 'scatter') {
      guideLayer
        .append('g')
        .attr('transform', `translate(0, ${innerH - 22})`)
        .call(d3.axisBottom(xScat).ticks(5))
        .call((ax) => ax.selectAll('path,line').attr('stroke', 'rgba(244,239,230,0.22)'))
        .call((ax) => ax.selectAll('text').attr('fill', '#8C92A4').style('font-family', fontFamily));

      guideLayer
        .append('g')
        .attr('transform', 'translate(24, 0)')
        .call(d3.axisLeft(yScat).ticks(5))
        .call((ax) => ax.selectAll('path,line').attr('stroke', 'rgba(244,239,230,0.22)'))
        .call((ax) => ax.selectAll('text').attr('fill', '#8C92A4').style('font-family', fontFamily));

      guideLayer
        .append('text')
        .attr('x', innerW * 0.5)
        .attr('y', innerH + 18)
        .attr('text-anchor', 'middle')
        .style('font-family', fontFamily)
        .style('font-size', '11px')
        .style('fill', '#D4AF37')
        .text(currentLang === 'zh' ? '时间自由度 →' : 'Time Sovereignty →');

      guideLayer
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH * 0.5)
        .attr('y', -18)
        .attr('text-anchor', 'middle')
        .style('font-family', fontFamily)
        .style('font-size', '11px')
        .style('fill', '#E05A47')
        .text(currentLang === 'zh' ? '← 长期焦虑指数' : '← Chronic Anxiety Index');

      guideLayer
        .append('path')
        .attr('d', `M ${xScat(55)},${yScat(55)} Q ${xScat(76)},${yScat(30)} ${xScat(94)},${yScat(16)}`)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(212,175,55,0.4)')
        .attr('stroke-dasharray', '4 4');

      guideLayer
        .append('text')
        .attr('x', xScat(80))
        .attr('y', yScat(14))
        .attr('text-anchor', 'middle')
        .style('font-family', fontFamily)
        .style('font-size', '10.5px')
        .style('fill', '#D4AF37')
        .text(currentLang === 'zh' ? '帕累托最优前沿 · 高自由低焦虑区' : 'PARETO FRONTIER // SOVEREIGN & CALM');
    } else if (mode === 'glyphs') {
      const legendStr =
        currentLang === 'zh'
          ? '五片花瓣朝向编码：上为创造力 · 右上为财务 · 右下为自由度 · 左下为韧性 · 左上为十年复利'
          : 'Five-Petal Glyph Legend: Top Creativity · Upper-Right Finance · Lower-Right Sovereignty · Lower-Left Resilience · Upper-Left Compounding';
      guideLayer
        .append('text')
        .attr('x', innerW * 0.5)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-family', fontFamily)
        .style('font-size', '10.5px')
        .style('fill', 'rgba(244,239,230,0.68)')
        .text(legendStr);
    }
  }

  function syncEssay(mode) {
    const essay = PRISM_STAGE_ESSAYS[mode]?.[currentLang];
    if (essay && els.stageTitle) {
      els.stageTitle.textContent = essay.title;
      els.stageDesc.textContent = essay.desc;
      els.lesson.textContent = essay.lesson;
    }
  }

  function setMode(mode) {
    currentMode = mode;
    renderGuides(mode);
    renderWatermarks();

    specimenGroups
      .attr('transform', (d) => {
        const pt =
          mode === 'chaos'
            ? d.posChaos
            : mode === 'bar'
              ? d.posBar
              : mode === 'beeswarm'
                ? d.posBee
                : mode === 'scatter'
                  ? d.posScatter
                  : d.posGlyph;
        return `translate(${pt.x}, ${pt.y})`;
      })
      .style('transform', (d) => {
        const pt =
          mode === 'chaos'
            ? d.posChaos
            : mode === 'bar'
              ? d.posBar
              : mode === 'beeswarm'
                ? d.posBee
                : mode === 'scatter'
                  ? d.posScatter
                  : d.posGlyph;
        return `translate(${pt.x}px, ${pt.y}px)`;
      });

    specimenGroups
      .select('.petal-shape')
      .style('opacity', mode === 'glyphs' ? 1 : 0);

    specimenGroups
      .select('.core-dot')
      .attr('r', mode === 'glyphs' ? 2.4 : mode === 'bar' ? 3.8 : 4.5);

    syncEssay(mode);
  }

  setMode('glyphs');
  updateHudDefault();

  return {
    setMode,
    setStage(mode) {
      setMode(mode);
    },
    setLang(newLang) {
      currentLang = newLang;
      renderGuides(currentMode);
      renderWatermarks();
      syncEssay(currentMode);
      updateHudDefault();
    },
  };
}
