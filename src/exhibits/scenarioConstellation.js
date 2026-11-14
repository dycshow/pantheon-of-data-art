// Hall III: Constellation of Order
// D3 Hierarchical Edge Bundling (d3.cluster + d3.lineRadial + d3.curveBundle.beta(0.85))
import * as d3 from 'd3';
import { SCENARIO_ECOSYSTEM_NODES } from '../data/curatedData.js';

export function initScenarioConstellation(hostEl, inspectorEls, langInit = 'zh') {
  let mode = 'order'; // 'order' | 'chaos'
  let activeId = 'root.scenarios.personal_chronos';
  let currentLang = langInit;

  const width = 760;
  const height = 700;
  const radius = Math.min(width, height) * 0.34;

  hostEl.innerHTML = '';
  const svg = d3
    .select(hostEl)
    .append('svg')
    .attr('class', 'constellation-svg')
    .attr('viewBox', `${-width / 2} ${-height / 2 + 12} ${width} ${height}`)
    .style('width', '100%')
    .style('height', '100%');

  // Subtle diagonal SVG watermark overlay + corner curator mark
  const wmGroup = svg.append('g').attr('class', 'svg-watermark-layer').attr('pointer-events', 'none');
  const wmDiagGroup = wmGroup.append('g').attr('transform', 'rotate(-26)');
  const wmDiagLabels = [];
  for (let wy = -320; wy <= 320; wy += 190) {
    for (let wx = -360; wx <= 360; wx += 340) {
      const tEl = wmDiagGroup
        .append('text')
        .attr('x', wx)
        .attr('y', wy)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'rgba(212, 175, 55, 0.045)');
      wmDiagLabels.push(tEl);
    }
  }
  const wmCornerText = wmGroup
    .append('text')
    .attr('x', width / 2 - 22)
    .attr('y', height / 2 - 14)
    .attr('text-anchor', 'end')
    .style('font-size', '10.5px')
    .style('fill', 'rgba(212, 175, 55, 0.72)');

  const bgGroup = svg.append('g').attr('class', 'constellation-bg').style('transition', 'opacity 0.6s ease');
  [radius * 0.55, radius * 0.84, radius, radius + 34].forEach((r, idx) => {
    bgGroup
      .append('circle')
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', idx === 2 ? 'rgba(212,175,55,0.28)' : 'rgba(244,239,230,0.08)')
      .attr('stroke-dasharray', idx === 1 ? '3 5' : null);
  });

  const hierarchyData = {
    id: 'root',
    children: [
      {
        id: 'root.scenarios',
        children: SCENARIO_ECOSYSTEM_NODES.filter((d) => d.group === 'scenarios'),
      },
      {
        id: 'root.engines',
        children: SCENARIO_ECOSYSTEM_NODES.filter((d) => d.group === 'engines'),
      },
    ],
  };

  const root = d3.hierarchy(hierarchyData);
  const cluster = d3.cluster().size([2 * Math.PI, radius]);
  cluster(root);

  const leaves = root.leaves();
  const leafById = new Map(leaves.map((d) => [d.data.id, d]));

  const links = [];
  leaves.forEach((src) => {
    (src.data.targets || []).forEach((tid) => {
      const dst = leafById.get(tid);
      if (dst) {
        links.push({
          source: src,
          target: dst,
          path: src.path(dst),
        });
      }
    });
  });

  leaves.forEach((d, i) => {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const dist = radius * (0.28 + ((i * 37) % 68) / 100);
    d.chaosX = Math.cos(angle) * dist * 1.1;
    d.chaosY = Math.sin(angle) * dist * 0.9;
  });

  const lineRadial = d3
    .lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius((d) => d.y)
    .angle((d) => d.x);

  const linkGroup = svg.append('g').attr('fill', 'none');
  const linkEls = linkGroup
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('d', (d) => lineRadial(d.path))
    .attr('stroke-linecap', 'round')
    .style('transition', 'stroke-opacity 0.25s ease, stroke-width 0.25s ease');

  const nodeGroup = svg.append('g');
  const nodeEls = nodeGroup
    .selectAll('g')
    .data(leaves)
    .join('g')
    .style('cursor', 'pointer')
    .style('transition', 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)')
    .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`);

  nodeEls
    .append('circle')
    .attr('r', 4.5)
    .attr('stroke', '#070709')
    .attr('stroke-width', 1.2);

  nodeEls
    .append('text')
    .attr('dy', '0.32em')
    .attr('x', (d) => (d.x < Math.PI ? 10 : -10))
    .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
    .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
    .style('font-size', '11px');

  const centerGroup = svg.append('g').attr('text-anchor', 'middle');
  const centerTitle = centerGroup
    .append('text')
    .attr('y', -6)
    .style('font-size', '16px')
    .style('font-weight', '600')
    .style('fill', '#F4EFE6');
  const centerSub = centerGroup
    .append('text')
    .attr('y', 14)
    .style('font-size', '10.5px')
    .style('fill', '#D4AF37');

  function syncLanguageVisuals() {
    const fontFamily =
      currentLang === 'zh'
        ? '"Noto Serif SC", "Songti SC", serif'
        : '"Cormorant Garamond", Georgia, serif';

    const diagText = currentLang === 'zh' ? 'DYCSHOW · 万象归序' : 'DYCSHOW · PANTHEON OF ORDER';
    wmDiagLabels.forEach((el) => el.style('font-family', fontFamily).text(diagText));
    wmCornerText
      .style('font-family', fontFamily)
      .text(currentLang === 'zh' ? '© DYCSHOW · 万象归序艺术殿堂' : '© DYCSHOW · THE PANTHEON OF ORDER');

    nodeEls
      .select('text')
      .style('font-family', fontFamily)
      .text((d) => d.data.name[currentLang]);

    centerTitle.style('font-family', fontFamily);
    centerSub.style('font-family', fontFamily);

    if (mode === 'chaos') {
      centerTitle.text(currentLang === 'zh' ? '孤岛混沌星云' : 'SILOED ENTROPY');
      centerSub
        .style('fill', '#E05A47')
        .text(currentLang === 'zh' ? '未捆绑的无序毛线球' : 'UNBUNDLED HAIRBALL');
    } else {
      centerTitle.text(currentLang === 'zh' ? '十类现实命题 × 十二底层引擎' : '10 SCENARIOS × 12 ENGINES');
      centerSub
        .style('fill', '#D4AF37')
        .text(currentLang === 'zh' ? '三百六十度分层边捆绑拓扑' : 'HIERARCHICAL EDGE BUNDLING');
    }
  }

  function updateHighlight(selectedId) {
    activeId = selectedId;
    const selectedNode = leafById.get(selectedId);
    const connectedIds = new Set([selectedId]);
    links.forEach((l) => {
      if (l.source.data.id === selectedId) connectedIds.add(l.target.data.id);
      if (l.target.data.id === selectedId) connectedIds.add(l.source.data.id);
    });

    linkEls
      .attr('stroke', (d) => {
        if (mode === 'chaos') return 'rgba(224, 90, 71, 0.25)';
        const isHit = d.source.data.id === selectedId || d.target.data.id === selectedId;
        if (!isHit) return 'rgba(244, 239, 230, 0.08)';
        return d.source.data.group === 'scenarios' ? '#D4AF37' : '#3B8EA5';
      })
      .attr('stroke-width', (d) =>
        d.source.data.id === selectedId || d.target.data.id === selectedId ? 2 : 0.9
      )
      .attr('stroke-opacity', (d) => {
        if (mode === 'chaos') return 0.22;
        return d.source.data.id === selectedId || d.target.data.id === selectedId ? 0.92 : 0.18;
      });

    nodeEls
      .select('circle')
      .attr('fill', (d) => {
        if (d.data.id === selectedId) return '#F4EFE6';
        return d.data.group === 'scenarios' ? '#D4AF37' : '#3B8EA5';
      })
      .attr('r', (d) => (d.data.id === selectedId ? 6.5 : connectedIds.has(d.data.id) ? 5 : 3.5))
      .attr('opacity', (d) => (connectedIds.has(d.data.id) ? 1 : 0.35));

    nodeEls
      .select('text')
      .attr('fill', (d) => {
        if (d.data.id === selectedId) return '#F4EFE6';
        if (connectedIds.has(d.data.id)) return d.data.group === 'scenarios' ? '#D4AF37' : '#8ad6ea';
        return 'rgba(244,239,230,0.45)';
      })
      .style('font-weight', (d) => (connectedIds.has(d.data.id) ? '600' : '400'));

    if (selectedNode && inspectorEls) {
      const info = selectedNode.data;
      const peers = Array.from(connectedIds)
        .filter((id) => id !== selectedId)
        .map((id) => leafById.get(id)?.data.name[currentLang])
        .filter(Boolean)
        .join(' · ');

      inspectorEls.title.textContent = info.name[currentLang];
      if (currentLang === 'zh') {
        inspectorEls.meta.textContent = `${info.domain.zh} · 关联节点：${peers}`;
        inspectorEls.pain.innerHTML = `<strong>混沌痛点：</strong>${info.pain.zh}`;
        inspectorEls.solution.innerHTML = `<strong>秩序解法：</strong>${info.solution.zh}`;
        inspectorEls.anti.innerHTML = `<strong>拒绝平庸：</strong>${info.antiPattern.zh}`;
      } else {
        inspectorEls.meta.textContent = `${info.domain.en} · Connected: ${peers}`;
        inspectorEls.pain.innerHTML = `<strong>Raw Chaos:</strong> ${info.pain.en}`;
        inspectorEls.solution.innerHTML = `<strong>Ordered Form:</strong> ${info.solution.en}`;
        inspectorEls.anti.innerHTML = `<strong>Reject Mediocrity:</strong> ${info.antiPattern.en}`;
      }
    }
  }

  nodeEls
    .on('mouseenter', (_, d) => updateHighlight(d.data.id))
    .on('click', (_, d) => updateHighlight(d.data.id));

  syncLanguageVisuals();
  updateHighlight(activeId);

  return {
    setMode(nextMode) {
      mode = nextMode;
      bgGroup.style('opacity', nextMode === 'order' ? 1 : 0.12);

      if (nextMode === 'chaos') {
        nodeEls
          .attr('transform', (d) => `translate(${d.chaosX}, ${d.chaosY})`);

        nodeEls
          .select('text')
          .attr('x', 8)
          .attr('text-anchor', 'start')
          .attr('transform', null);

        linkEls
          .attr('d', (d) => `M${d.source.chaosX},${d.source.chaosY} L${d.target.chaosX},${d.target.chaosY}`);
      } else {
        nodeEls
          .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`);

        nodeEls
          .select('text')
          .attr('x', (d) => (d.x < Math.PI ? 10 : -10))
          .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
          .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null));

        linkEls
          .attr('d', (d) => lineRadial(d.path));
      }
      syncLanguageVisuals();
      updateHighlight(activeId);
    },
    setLang(newLang) {
      currentLang = newLang;
      syncLanguageVisuals();
      updateHighlight(activeId);
    },
  };
}
