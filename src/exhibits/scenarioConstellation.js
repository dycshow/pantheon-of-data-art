// Hall III: 《万物的星图 · Astrolabe of Open Source & Scenarios》
// D3 Hierarchical Edge Bundling (d3.cluster + d3.lineRadial + d3.curveBundle.beta(0.85))
import * as d3 from 'd3';
import { SCENARIO_ECOSYSTEM_NODES } from '../data/curatedData.js';

export function initScenarioConstellation(hostEl, inspectorEls) {
  let mode = 'order'; // 'order' | 'chaos'
  let activeId = 'root.scenarios.personal_chronos';

  const width = 760;
  const height = 700;
  const radius = Math.min(width, height) * 0.35;

  const svg = d3
    .select(hostEl)
    .append('svg')
    .attr('viewBox', `${-width / 2} ${-height / 2 + 12} ${width} ${height}`)
    .style('width', '100%')
    .style('height', '100%');

  // Subtle calibration rings
  const bgGroup = svg.append('g').attr('class', 'constellation-bg');
  [radius * 0.55, radius * 0.84, radius, radius + 34].forEach((r, idx) => {
    bgGroup
      .append('circle')
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', idx === 2 ? 'rgba(212,175,55,0.28)' : 'rgba(244,239,230,0.08)')
      .attr('stroke-dasharray', idx === 1 ? '3 5' : null);
  });

  // Build Hierarchy
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

  // Build bundled links
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

  // Compute deterministic chaos positions
  leaves.forEach((d, i) => {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const dist = radius * (0.28 + ((i * 37) % 68) / 100);
    d.chaosX = Math.cos(angle) * dist * 1.1;
    d.chaosY = Math.sin(angle) * dist * 0.9;
    d.orderX = Math.cos(d.x - Math.PI / 2) * d.y;
    d.orderY = Math.sin(d.x - Math.PI / 2) * d.y;
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
    .style('font-family', '"Noto Serif SC", serif')
    .style('font-size', '11.5px')
    .text((d) => d.data.name);

  // Center Medallion
  const centerGroup = svg.append('g').attr('text-anchor', 'middle');
  const centerTitle = centerGroup
    .append('text')
    .attr('y', -6)
    .style('font-family', '"Cormorant Garamond", serif')
    .style('font-size', '17px')
    .style('font-weight', '600')
    .style('fill', '#F4EFE6')
    .text('10 SCENARIOS × 12 ENGINES');
  const centerSub = centerGroup
    .append('text')
    .attr('y', 14)
    .style('font-family', '"JetBrains Mono", monospace')
    .style('font-size', '10px')
    .style('fill', '#D4AF37')
    .text('HIERARCHICAL EDGE BUNDLING');

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

    nodeEls.select('circle')
      .attr('fill', (d) => {
        if (d.data.id === selectedId) return '#F4EFE6';
        return d.data.group === 'scenarios' ? '#D4AF37' : '#3B8EA5';
      })
      .attr('r', (d) => (d.data.id === selectedId ? 6.5 : connectedIds.has(d.data.id) ? 5 : 3.5))
      .attr('opacity', (d) => (connectedIds.has(d.data.id) ? 1 : 0.35));

    nodeEls.select('text')
      .attr('fill', (d) => {
        if (d.data.id === selectedId) return '#F4EFE6';
        if (connectedIds.has(d.data.id)) return d.data.group === 'scenarios' ? '#D4AF37' : '#8ad6ea';
        return 'rgba(244,239,230,0.42)';
      })
      .style('font-weight', (d) => (connectedIds.has(d.data.id) ? '600' : '400'));

    if (selectedNode && inspectorEls) {
      const info = selectedNode.data;
      const peers = Array.from(connectedIds)
        .filter((id) => id !== selectedId)
        .map((id) => leafById.get(id)?.data.name)
        .filter(Boolean)
        .join(' · ');

      inspectorEls.title.textContent = info.name;
      inspectorEls.meta.textContent = `${info.domain} · 关联节点：${peers}`;
      inspectorEls.pain.innerHTML = `<strong>混沌痛点：</strong>${info.pain}`;
      inspectorEls.solution.innerHTML = `<strong>秩序解法：</strong>${info.solution}`;
      inspectorEls.anti.innerHTML = `<strong>拒绝平庸：</strong>${info.antiPattern}`;
    }
  }

  nodeEls
    .on('mouseenter', (_, d) => updateHighlight(d.data.id))
    .on('click', (_, d) => updateHighlight(d.data.id));

  updateHighlight(activeId);

  return {
    setMode(nextMode) {
      mode = nextMode;
      bgGroup.transition().duration(750).style('opacity', nextMode === 'order' ? 1 : 0.12);

      if (nextMode === 'chaos') {
        centerTitle.text('SILOED ENTROPY');
        centerSub.style('fill', '#E05A47').text('UNBUNDLED HAIRBALL');

        nodeEls
          .transition()
          .duration(900)
          .ease(d3.easeCubicInOut)
          .attr('transform', (d) => `translate(${d.chaosX}, ${d.chaosY})`);

        nodeEls
          .select('text')
          .attr('x', 8)
          .attr('text-anchor', 'start')
          .attr('transform', null);

        linkEls
          .transition()
          .duration(900)
          .attr('d', (d) => `M${d.source.chaosX},${d.source.chaosY} L${d.target.chaosX},${d.target.chaosY}`);
      } else {
        centerTitle.text('10 SCENARIOS × 12 ENGINES');
        centerSub.style('fill', '#D4AF37').text('HIERARCHICAL EDGE BUNDLING');

        nodeEls
          .transition()
          .duration(900)
          .ease(d3.easeCubicInOut)
          .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`);

        nodeEls
          .select('text')
          .attr('x', (d) => (d.x < Math.PI ? 10 : -10))
          .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
          .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null));

        linkEls
          .transition()
          .duration(900)
          .attr('d', (d) => lineRadial(d.path));
      }
      updateHighlight(activeId);
    },
  };
}
