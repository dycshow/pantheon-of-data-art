// Hall IV: 《真相的棱镜 · The Prism of Truth》
// Same 120-specimen dataset morphing across 5 encodings:
// 0. Chaos -> A. Bar Averages (The Lie) -> B. Beeswarm Distribution -> C. Trade-off Scatter -> D. Giorgia Lupi Botanical Glyphs
import * as d3 from 'd3';
import { generateDecisionCohort } from '../data/curatedData.js';

const STAGE_ESSAYS = {
  chaos: {
    title: '0 · 未经编码的原始个体噪音',
    desc: '120 位探索者的职业与生活决策杂乱堆叠，没有任何统计尺度，大脑只能看见一片无解的尘埃。',
    lesson: '没有视觉编码的数据只是噪声；但错误的编码甚至比噪声更危险。',
  },
  bar: {
    title: '视角 A · 平均值的谎言 (The Tyranny of the Mean)',
    desc: '柱状图冷冰冰地告诉你：四类赛道的「综合均值」几乎都在 50–65 分之间相差无几！这是 AI 一键做表最常制造的“盲区”——它抹平了一切极端代价与个体分化。',
    lesson: '只要看见只给平均值的柱状图，立刻追问：它的方差、双峰分化与尾部代价是什么？',
  },
  beeswarm: {
    title: '视角 B · 个体颗粒度回归 (Force Beeswarm)',
    desc: '把柱状图打散成 120 个真实个体，惊人真相瞬间浮现：「独立数字工匠」内部呈现明显的双峰撕裂，而「传统高压赛道」高财务回报背后伴随极高聚集密度。',
    lesson: 'Beeswarm（蜂群图）既保留了分布形态，又让每一个真实个体都不被“平均”掉。',
  },
  scatter: {
    title: '视角 C · 时间自由度 × 焦虑代价前沿',
    desc: '横轴是「时间自由度」，纵轴是「长期焦虑指数」。那些表面光鲜的赛道往往左上角扎堆（高焦虑低自由），而 AI 协同杠杆者正在向右下角“帕累托前沿”突围。',
    lesson: '二维关系散点图揭示隐藏的权衡法则（Trade-off），破除单维度攀比。',
  },
  glyphs: {
    title: '视角 D · 数据人文主义繁花 (Botanical Data Glyphs)',
    desc: '灵感源自 Giorgia Lupi 收藏于 MoMA 的《Dear Data》：每朵几何花完整编码一个人的五维生命质感（创造力、财务、自由、韧性、复利），一眼看见繁杂人生的全息秩序。',
    lesson: '最高级的可视化不只是为了算术效率，更是为了让人重新看见复杂生命本身的尊严与美感。',
  },
};

export function initTruthPrism(hostEl, els) {
  const cohort = generateDecisionCohort();
  let currentMode = 'glyphs';

  const width = 820;
  const height = 620;
  const margin = { top: 86, right: 44, bottom: 78, left: 68 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3
    .select(hostEl)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('width', '100%')
    .style('height', '100%');

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const archetypes = [
    { key: 'high_burn', label: '传统高压赛道', color: '#E05A47' },
    { key: 'steady_drift', label: '惯性舒适区', color: '#8C92A4' },
    { key: 'indie_craft', label: '独立数字工匠', color: '#3B8EA5' },
    { key: 'ai_leveraged', label: 'AI 协同杠杆者', color: '#D4AF37' },
  ];

  // Precompute Group Averages for Stage A (Bar Lie)
  const avgByArch = archetypes.map((a) => {
    const sub = cohort.filter((d) => d.archetype === a.key);
    const mean = d3.mean(sub, (d) => d.composite);
    return { ...a, mean };
  });

  // Precompute positions for every mode
  // 0. Chaos
  cohort.forEach((d, i) => {
    const a = (i * 2.39996) % (Math.PI * 2);
    const r = 40 + ((i * 31) % 210);
    d.posChaos = {
      x: innerW * 0.5 + Math.cos(a) * r * 1.35,
      y: innerH * 0.5 + Math.sin(a) * r * 0.85,
    };
  });

  // A. Bar Averages (particles pack into deceptive uniform bars)
  const xArch = d3.scaleBand().domain(archetypes.map((a) => a.key)).range([20, innerW - 20]).padding(0.32);
  const yBar = d3.scaleLinear().domain([0, 100]).range([innerH - 24, 24]);

  const archBuckets = new Map(archetypes.map((a) => [a.key, []]));
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

  // B. Beeswarm (X = Freedom Score, Y grouped by Archetype band via synchronous d3.forceSimulation)
  const xBee = d3.scaleLinear().domain([0, 100]).range([24, innerW - 24]);
  const yBandBee = d3.scaleBand().domain(archetypes.map((a) => a.key)).range([20, innerH - 30]).padding(0.15);

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

  // C. Scatter (X = Freedom, Y = Anxiety)
  const xScat = d3.scaleLinear().domain([0, 100]).range([28, innerW - 24]);
  const yScat = d3.scaleLinear().domain([0, 100]).range([innerH - 28, 22]);
  cohort.forEach((d) => {
    d.posScatter = { x: xScat(d.freedom), y: yScat(d.anxiety) };
  });

  // D. Botanical Glyphs Grid (12 cols × 10 rows sorted by compounding)
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

  // Layer groups: Axes/Bar outlines + Specimens
  const guideLayer = g.append('g').attr('class', 'prism-guides');
  const specimenLayer = g.append('g').attr('class', 'prism-specimens');

  // Create 5-petal botanical path generator for each specimen
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
    .attr('transform', (d) => `translate(${d.posGlyph.x}, ${d.posGlyph.y})`);

  specimenGroups
    .append('path')
    .attr('class', 'petal-shape')
    .attr('d', (d) => buildFlowerPath(d, 1))
    .attr('fill', (d) => d.color)
    .attr('fill-opacity', 0.24)
    .attr('stroke', (d) => d.color)
    .attr('stroke-width', 1.1);

  specimenGroups
    .append('circle')
    .attr('class', 'core-dot')
    .attr('r', 2.4)
    .attr('fill', (d) => d.color)
    .attr('stroke', '#070709')
    .attr('stroke-width', 0.8);

  specimenGroups.on('mouseenter', function (_, d) {
    d3.select(this).select('.core-dot').attr('r', 5).attr('fill', '#F4EFE6');
    d3.select(this).select('.petal-shape').attr('fill-opacity', 0.55).attr('stroke', '#F4EFE6');
    if (els.hudMetrics) {
      els.hudMetrics.innerHTML =
        `<strong>${d.code} · ${d.archetypeLabel}</strong> — 创造力 ${d.creativity} · 财务 ${d.financial} · 自由度 ${d.freedom} · 韧性 ${d.resilience} · 十年复利 ${d.compounding} (综合均值 ${d.composite})`;
    }
  }).on('mouseleave', function (_, d) {
    d3.select(this).select('.core-dot').attr('r', currentMode === 'glyphs' ? 2.4 : 4.2).attr('fill', d.color);
    d3.select(this).select('.petal-shape').attr('fill-opacity', 0.24).attr('stroke', d.color);
  });

  function renderGuides(mode) {
    guideLayer.selectAll('*').remove();

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
          .style('font-family', '"JetBrains Mono", monospace')
          .style('font-size', '12px')
          .style('fill', '#F4EFE6')
          .text(`AVG ${a.mean.toFixed(1)}`);

        guideLayer
          .append('text')
          .attr('x', xArch(a.key) + xArch.bandwidth() * 0.5)
          .attr('y', innerH + 4)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', a.color)
          .text(a.label);
      });
    } else if (mode === 'beeswarm') {
      guideLayer
        .append('g')
        .attr('transform', `translate(0, ${innerH - 16})`)
        .call(d3.axisBottom(xBee).ticks(5))
        .call((ax) => ax.selectAll('path,line').attr('stroke', 'rgba(244,239,230,0.22)'))
        .call((ax) => ax.selectAll('text').attr('fill', '#8C92A4').style('font-family', 'JetBrains Mono'));

      guideLayer
        .append('text')
        .attr('x', innerW * 0.5)
        .attr('y', innerH + 18)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#D4AF37')
        .text('时间自由度分布 (0 → 100) · 注意蓝点群体内部的双峰撕裂');

      archetypes.forEach((a) => {
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
          .style('font-size', '11px')
          .style('fill', a.color)
          .text(a.label.slice(0, 4));
      });
    } else if (mode === 'scatter') {
      guideLayer
        .append('g')
        .attr('transform', `translate(0, ${innerH - 22})`)
        .call(d3.axisBottom(xScat).ticks(5))
        .call((ax) => ax.selectAll('path,line').attr('stroke', 'rgba(244,239,230,0.22)'))
        .call((ax) => ax.selectAll('text').attr('fill', '#8C92A4').style('font-family', 'JetBrains Mono'));

      guideLayer
        .append('g')
        .attr('transform', 'translate(24, 0)')
        .call(d3.axisLeft(yScat).ticks(5))
        .call((ax) => ax.selectAll('path,line').attr('stroke', 'rgba(244,239,230,0.22)'))
        .call((ax) => ax.selectAll('text').attr('fill', '#8C92A4').style('font-family', 'JetBrains Mono'));

      guideLayer
        .append('text')
        .attr('x', innerW * 0.5)
        .attr('y', innerH + 16)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#D4AF37')
        .text('时间自由度 (Freedom) →');

      guideLayer
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH * 0.5)
        .attr('y', -18)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#E05A47')
        .text('← 长期焦虑指数 (Anxiety)');

      // Pareto frontier subtle dashed guide
      guideLayer
        .append('path')
        .attr('d', `M ${xScat(55)},${yScat(55)} Q ${xScat(76)},${yScat(30)} ${xScat(94)},${yScat(16)}`)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(212,175,55,0.4)')
        .attr('stroke-dasharray', '4 4');

      guideLayer
        .append('text')
        .attr('x', xScat(82))
        .attr('y', yScat(14))
        .attr('text-anchor', 'middle')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '10px')
        .style('fill', '#D4AF37')
        .text('PARETO FRONTIER // 高自由低焦虑区');
    } else if (mode === 'glyphs') {
      // Subtle botanical legend at top
      const labels = ['上: 创造力', '右上: 财务', '右下: 自由度', '左下: 韧性', '左上: 十年复利'];
      guideLayer
        .append('text')
        .attr('x', innerW * 0.5)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-family', 'JetBrains Mono')
        .style('font-size', '10.5px')
        .style('fill', 'rgba(244,239,230,0.62)')
        .text(`五片花瓣朝向编码：${labels.join(' · ')}（按十年复利从左上至右下排序）`);
    }
  }

  function setMode(mode) {
    currentMode = mode;
    renderGuides(mode);

    specimenGroups
      .transition()
      .duration(950)
      .ease(d3.easeCubicInOut)
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
      });

    specimenGroups
      .select('.petal-shape')
      .transition()
      .duration(650)
      .style('opacity', mode === 'glyphs' ? 1 : 0);

    specimenGroups
      .select('.core-dot')
      .transition()
      .duration(650)
      .attr('r', mode === 'glyphs' ? 2.4 : mode === 'bar' ? 3.8 : 4.5);

    const essay = STAGE_ESSAYS[mode];
    if (essay && els.stageTitle) {
      els.stageTitle.textContent = essay.title;
      els.stageDesc.textContent = essay.desc;
      els.lesson.textContent = essay.lesson;
    }
  }

  setMode('glyphs');

  return { setMode };
}
