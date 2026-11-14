// Deterministic PRNG so the museum exhibits are mathematically reproducible
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CHRONOS_MONTHS = {
  zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

const EN_MONTH_FULL = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const CHRONOS_CATEGORIES = {
  deep: {
    color: '#D4AF37',
    name: { zh: '深度创造', en: 'Deep Creation' },
  },
  ai: {
    color: '#3B8EA5',
    name: { zh: 'AI 协同杠杆', en: 'AI Leverage' },
  },
  frag: {
    color: '#E05A47',
    name: { zh: '碎片打断', en: 'Fragmented Drift' },
  },
  rest: {
    color: '#8C92A4',
    name: { zh: '身心修复', en: 'Restoration' },
  },
};

export function generateChronosYearData() {
  const rng = mulberry32(20261114);
  const days = [];
  let monthIdx = 0;
  let dayInMonth = 1;
  let inStreak = false;
  let streakLen = 0;

  for (let i = 0; i < 365; i++) {
    if (dayInMonth > MONTH_DAYS[monthIdx]) {
      monthIdx++;
      dayInMonth = 1;
    }
    const weekday = i % 7;
    const isWeekend = weekday === 5 || weekday === 6;
    const wave = Math.sin((i / 365) * Math.PI * 4) * 0.8;

    const deep = Math.max(0.4, Math.min(7.5, (isWeekend ? 2.1 : 3.2) + wave + (rng() - 0.35) * 3.4));
    const ai = Math.max(0.2, Math.min(4.8, 1.4 + (i / 365) * 1.4 + (rng() - 0.4) * 2.2));
    const frag = Math.max(0.3, Math.min(7.2, (isWeekend ? 1.5 : 3.8) - wave * 0.6 + (rng() - 0.42) * 3.6));
    const rest = Math.max(1.0, Math.min(6.0, (isWeekend ? 4.4 : 2.3) + (rng() - 0.45) * 1.8));

    const vals = { deep, ai, frag, rest };
    const dominant = Object.entries(vals).sort((a, b) => b[1] - a[1])[0][0];

    if (deep + ai > 5.8 && frag < 3.4) {
      if (!inStreak) {
        inStreak = true;
        streakLen = 1;
      } else {
        streakLen++;
      }
    } else {
      inStreak = false;
      streakLen = 0;
    }

    days.push({
      dayIndex: i,
      monthIdx,
      dateLabel: {
        zh: `${monthIdx + 1}月${dayInMonth}日`,
        en: `${EN_MONTH_FULL[monthIdx]} ${dayInMonth}`,
      },
      deepHours: +deep.toFixed(1),
      aiHours: +ai.toFixed(1),
      fragHours: +frag.toFixed(1),
      restHours: +rest.toFixed(1),
      totalFocus: +(deep + ai).toFixed(1),
      dominant,
      streakLen,
    });
    dayInMonth++;
  }
  return days;
}

export const VALUE_FLOW_MODEL = {
  nodes: [
    // Col 0: Sources
    { id: 'src_time', col: 0, label: { zh: '主动时间与专注力', en: 'Active Focus Hours' }, sub: { zh: '原初生命投入', en: 'TIME INPUT' }, color: '#D4AF37' },
    { id: 'src_capital', col: 0, label: { zh: '现金流与既有积蓄', en: 'Capital Base' }, sub: { zh: '经济资源投入', en: 'CAPITAL' }, color: '#3B8EA5' },
    { id: 'src_ai', col: 0, label: { zh: 'AI 协同杠杆', en: 'AI Leverage' }, sub: { zh: '工具倍率放大', en: 'AMPLIFIER' }, color: '#8ad6ea' },
    // Col 1: Channels
    { id: 'ch_compounding', col: 1, label: { zh: '深度学习与复用资产', en: 'Compounding Craft' }, sub: { zh: '正反馈积累', en: 'DURABLE' }, color: '#D4AF37' },
    { id: 'ch_vitality', col: 1, label: { zh: '核心关系与身心修复', en: 'Vitality & Trust' }, sub: { zh: '能量涵养', en: 'RECOVERY' }, color: '#3B8EA5' },
    { id: 'ch_friction', col: 1, label: { zh: '情绪内耗与决策迟疑', en: 'Cognitive Friction' }, sub: { zh: '隐性耗散', en: 'DRAG' }, color: '#E05A47' },
    { id: 'ch_leaks', col: 1, label: { zh: '隐形订阅与冲动消费', en: 'Invisible Leaks' }, sub: { zh: '资本漏损', en: 'LEAKAGE' }, color: '#c44d3c' },
    { id: 'ch_noise', col: 1, label: { zh: '低效社交与会议噪音', en: 'Meeting Noise' }, sub: { zh: '注意分散', en: 'NOISE' }, color: '#8C92A4' },
    // Col 2: Long-term Outcomes
    { id: 'out_freedom', col: 2, label: { zh: '时间自由度净值', en: 'Time Sovereignty' }, sub: { zh: '长期收益', en: 'FREEDOM' }, color: '#D4AF37' },
    { id: 'out_moat', col: 2, label: { zh: '跨界稀缺护城河', en: 'Rare Craft Moat' }, sub: { zh: '核心壁垒', en: 'MOAT' }, color: '#3B8EA5' },
    { id: 'out_entropy', col: 2, label: { zh: '不可逆熵增损耗', en: 'Irreversible Entropy' }, sub: { zh: '永久消耗', en: 'ENTROPY' }, color: '#E05A47' },
  ],
  baselineLinks: [
    { source: 'src_time', target: 'ch_compounding', value: 22 },
    { source: 'src_time', target: 'ch_vitality', value: 14 },
    { source: 'src_time', target: 'ch_friction', value: 18 },
    { source: 'src_time', target: 'ch_noise', value: 24 },
    { source: 'src_capital', target: 'ch_compounding', value: 16 },
    { source: 'src_capital', target: 'ch_vitality', value: 12 },
    { source: 'src_capital', target: 'ch_leaks', value: 22 },
    { source: 'src_ai', target: 'ch_compounding', value: 12 },
    { source: 'src_ai', target: 'ch_noise', value: 8 },

    { source: 'ch_compounding', target: 'out_moat', value: 32 },
    { source: 'ch_compounding', target: 'out_freedom', value: 18 },
    { source: 'ch_vitality', target: 'out_freedom', value: 26 },
    { source: 'ch_friction', target: 'out_entropy', value: 18 },
    { source: 'ch_leaks', target: 'out_entropy', value: 22 },
    { source: 'ch_noise', target: 'out_entropy', value: 28 },
    { source: 'ch_noise', target: 'out_moat', value: 4 },
  ],
  awakenedLinks: [
    { source: 'src_time', target: 'ch_compounding', value: 42 },
    { source: 'src_time', target: 'ch_vitality', value: 22 },
    { source: 'src_time', target: 'ch_friction', value: 6 },
    { source: 'src_time', target: 'ch_noise', value: 8 },
    { source: 'src_capital', target: 'ch_compounding', value: 28 },
    { source: 'src_capital', target: 'ch_vitality', value: 16 },
    { source: 'src_capital', target: 'ch_leaks', value: 6 },
    { source: 'src_ai', target: 'ch_compounding', value: 18 },
    { source: 'src_ai', target: 'ch_noise', value: 2 },

    { source: 'ch_compounding', target: 'out_moat', value: 54 },
    { source: 'ch_compounding', target: 'out_freedom', value: 34 },
    { source: 'ch_vitality', target: 'out_freedom', value: 38 },
    { source: 'ch_friction', target: 'out_entropy', value: 6 },
    { source: 'ch_leaks', target: 'out_entropy', value: 6 },
    { source: 'ch_noise', target: 'out_entropy', value: 8 },
    { source: 'ch_noise', target: 'out_moat', value: 2 },
  ],
};

export const SCENARIO_ECOSYSTEM_NODES = [
  // Scenarios (10)
  {
    id: 'root.scenarios.personal_chronos',
    group: 'scenarios',
    targets: ['root.engines.d3', 'root.engines.observable_plot', 'root.engines.echarts'],
    name: { zh: '个人十年时间账单', en: 'Decade Time Ledger' },
    domain: { zh: '生活秩序 · 时间韵律', en: 'Life Order · Temporal Rhythm' },
    pain: {
      zh: '日程记录散落在日历、笔记与待办清单里，难以察觉自己多年以来真正的注意力流向。',
      en: 'Calendar logs and to-do lists shatter across apps, concealing how your core attention shifts across years.',
    },
    solution: {
      zh: '采用极坐标年轮图或流式主题河，把离散时间戳编码为季节韵律与连续心流弧线。',
      en: 'Encode discrete timestamps onto a polar circadian rose and ThemeRiver so multi-year momentum gleams.',
    },
    antiPattern: {
      zh: '切忌做成密密麻麻的年度电子表格打卡方格，毫无时间质感与叙事张力。',
      en: 'Never settle for dense spreadsheet grids devoid of seasonal cadence or narrative arc.',
    },
  },
  {
    id: 'root.scenarios.family_cashflow',
    group: 'scenarios',
    targets: ['root.engines.d3', 'root.engines.rawgraphs', 'root.engines.antv_g2'],
    name: { zh: '家庭资产与隐形漏损', en: 'Wealth & Silent Leaks' },
    domain: { zh: '生活秩序 · 资本守恒', en: 'Life Order · Capital Flow' },
    pain: {
      zh: '常规记账工具只告诉你某一项花了多少，却无法揭示哪种惯性支出正在悄悄吞噬长期自由度。',
      en: 'Expense apps tally totals per category yet fail to expose which recurring drags quietly erode long-term sovereignty.',
    },
    solution: {
      zh: '用多阶段冲积织锦强制展现守恒关系，追踪每一分输入如何流向复利资产或隐形消耗。',
      en: 'Use conserved multi-stage alluvial weaves to trace every unit of inflow straight into compounding moats or entropy.',
    },
    antiPattern: {
      zh: '拒绝多个孤立的环形饼图——饼图只能切片，永远看不出因果流向。',
      en: 'Reject disconnected donut pies—slices cannot communicate causal flow or conservation.',
    },
  },
  {
    id: 'root.scenarios.habit_humanism',
    group: 'scenarios',
    targets: ['root.engines.d3', 'root.engines.p5_generative'],
    name: { zh: '情绪日记与人文度量', en: 'Data Humanism Journal' },
    domain: { zh: '生活秩序 · 人文尺度', en: 'Life Order · Human Measure' },
    pain: {
      zh: '冰冷的十分制打分表无法承载人类日常生活里细腻的情绪起伏、陪伴记忆与创造时刻。',
      en: 'Clinical 1–10 wellness sliders flatten subtle emotions, companionship, and creative breakthroughs into sterile numbers.',
    },
    solution: {
      zh: '运用五维几何繁花符号编码个人状态，把主观体验雕刻为独一无二的生命图腾。',
      en: 'Craft five-petal botanical glyphs inspired by Giorgia Lupi, encoding human texture without erasing vulnerability.',
    },
    antiPattern: {
      zh: '切忌用标准红绿灯绩效仪表盘来量化人的幸福感。',
      en: 'Never score human flourishing through corporate traffic-light KPI gauges.',
    },
  },
  {
    id: 'root.scenarios.city_commute',
    group: 'scenarios',
    targets: ['root.engines.deckgl', 'root.engines.maplibre'],
    name: { zh: '城市通勤与空间脉搏', en: 'Urban Mobility Pulse' },
    domain: { zh: '空间维度 · 城市韵律', en: 'Spatial Order · Civic Pulse' },
    pain: {
      zh: '数百万条早晚高峰出行轨迹在传统平面地图上会重叠成一团死黑，无法辨识真正拥堵走廊。',
      en: 'Millions of daily commuter trajectories collapse into opaque blobs on flat 2D maps, masking congestion bottlenecks.',
    },
    solution: {
      zh: '利用三维六边形密度柱与动态飞弧图层分离高度与流速，清晰呈现城市呼吸节拍。',
      en: 'Deploy GPU-accelerated 3D hexbin density spires and directional arc layers to separate velocity from density.',
    },
    antiPattern: {
      zh: '千万不要直接在底图上暴力渲染十万个不透明圆点造成严重遮挡。',
      en: 'Avoid dumping hundreds of thousands of opaque circles directly onto a basemap (catastrophic overplotting).',
    },
  },
  {
    id: 'root.scenarios.supply_chain',
    group: 'scenarios',
    targets: ['root.engines.antv_g6', 'root.engines.d3', 'root.engines.deckgl'],
    name: { zh: '跨国供应链脆弱性拓扑', en: 'Supply Chain Fragility' },
    domain: { zh: '工作秩序 · 工业拓扑', en: 'Work Order · Network Risk' },
    pain: {
      zh: '上下游数千家供应商层层嵌套依赖，一旦关键二级节点断供，普通报表无法预警级联冲击。',
      en: 'Deep multi-tier vendor graphs hide single-point vulnerabilities until a tier-2 bottleneck triggers cascading outages.',
    },
    solution: {
      zh: '采用分层边捆绑或因果穿透画布，实时高亮脆弱枢纽与多级传导路径。',
      en: 'Apply hierarchical edge bundling and interactive ego-network isolation to expose brittle choke points.',
    },
    antiPattern: {
      zh: '绝对避免把所有连线直接摊成一团无序的力导向毛线球。',
      en: 'Absolutely avoid naive unbundled hairball networks where every crossed edge obscures causality.',
    },
  },
  {
    id: 'root.scenarios.code_dependency',
    group: 'scenarios',
    targets: ['root.engines.d3', 'root.engines.antv_g6', 'root.engines.threejs'],
    name: { zh: '复杂系统与代码依赖图谱', en: 'Software Architecture Map' },
    domain: { zh: '工作秩序 · 工程架构', en: 'Work Order · Engineering' },
    pain: {
      zh: '大型工程仓库经年演进后，模块循环引用与隐形耦合极深，新人理解全貌成本极高。',
      en: 'Decade-old codebases accumulate cyclic imports and hidden coupling that resist mental modeling by newcomers.',
    },
    solution: {
      zh: '使用三百六十度径向聚类捆绑环，将高度耦合的功能簇聚合为秩序星团。',
      en: 'Arrange modules around a 360-degree radial clustering ring with smooth edge bundling to reveal architectural seams.',
    },
    antiPattern: {
      zh: '切忌依赖巨型平铺直叙的静态架构框图，放大失焦、缩小失真。',
      en: 'Ditch giant static wall-sized class diagrams that become illegible when zoomed out.',
    },
  },
  {
    id: 'root.scenarios.ai_literacy',
    group: 'scenarios',
    targets: ['root.engines.vega_lite', 'root.engines.observable_plot', 'root.engines.d3'],
    name: { zh: 'AI 生成图表的真相甄别', en: 'Truth Auditing for AI Charts' },
    domain: { zh: '认知教育 · 视觉素养', en: 'Cognitive Craft · Literacy' },
    pain: {
      zh: 'AI 能在数秒内生成看似严谨的统计图表，却常因单一均值、截断纵轴或掩藏双峰分布而误导判断。',
      en: 'AI can generate polished statistical charts in seconds, yet often misleads perception through standalone means, truncated axes, or hidden bimodal splits.',
    },
    solution: {
      zh: '用声明式图形语法对同一数据集并列呈现均值、蜂群分布与权衡散点，直观戳破均值幻觉。',
      en: 'Use declarative grammars to display means, beeswarms, and trade-offs side by side on the same underlying cohort.',
    },
    antiPattern: {
      zh: '切忌盲从单一汇总柱状图或双纵轴伪相关性曲线。',
      en: 'Never trust a standalone summary bar or a dual-axis coincidence line without distribution proof.',
    },
  },
  {
    id: 'root.scenarios.market_regime',
    group: 'scenarios',
    targets: ['root.engines.echarts', 'root.engines.vega_lite', 'root.engines.d3'],
    name: { zh: '多因子金融周期与波动', en: 'Multi-Factor Macro Regimes' },
    domain: { zh: '工作秩序 · 量化研究', en: 'Work Order · Macro & Quant' },
    pain: {
      zh: '十几个宏观指标并发震荡时，人眼极难看清周期轮动先后与尾部风险聚集效应。',
      en: 'Dozen concurrent macroeconomic indicators create visual chaos when overlaid simultaneously on one plot.',
    },
    solution: {
      zh: '运用地平线图高效压缩多通道序列，或以连通散点图呈现相空间轨线演化。',
      en: 'Compress parallel time series into layered Horizon Charts or connected phase-space scatter trajectories.',
    },
    antiPattern: {
      zh: '避免将十几条折线强行挤在同一坐标系里扭成乱麻。',
      en: 'Reject multi-series spaghetti line charts stacked indiscriminately inside a single frame.',
    },
  },
  {
    id: 'root.scenarios.story_journalism',
    group: 'scenarios',
    targets: ['root.engines.scrollama', 'root.engines.d3', 'root.engines.rawgraphs'],
    name: { zh: '公共议题交互长文叙事', en: 'Scrollytelling Public Essays' },
    domain: { zh: '认知教育 · 视觉叙事', en: 'Cognitive Craft · Narrative' },
    pain: {
      zh: '冗长枯燥的静态分析报告难以吸引普通读者耐心读完，公共议题很难实现广泛启蒙。',
      en: 'Dense static PDF reports alienate general readers, keeping urgent systemic insights locked behind jargon.',
    },
    solution: {
      zh: '随阅读滚动节奏驱动单一核心图表逐层演化，做到一屏专注讲透一个视觉洞察。',
      en: 'Orchestrate scroll-triggered visual transitions where one focused frame morphs alongside concise prose.',
    },
    antiPattern: {
      zh: '不要把二十张互无关联的静态截图直接塞进同一篇长文章里。',
      en: 'Do not paste twenty uncoordinated static screenshots inline down a wall of text.',
    },
  },
  {
    id: 'root.scenarios.knowledge_cosmos',
    group: 'scenarios',
    targets: ['root.engines.threejs', 'root.engines.antv_g6', 'root.engines.d3'],
    name: { zh: '个人与团队第二大脑星系', en: 'Knowledge Cosmos Graph' },
    domain: { zh: '工作秩序 · 知识图谱', en: 'Work Order · Epistemic Map' },
    pain: {
      zh: '数千篇笔记一旦按层级文件夹埋藏便会沦为信息坟墓，跨学科灵感几乎无法碰面。',
      en: 'Thousands of notes buried inside deep nested folders become dark silos where cross-domain insights never collide.',
    },
    solution: {
      zh: '借助语义嵌入降维与立体点云星系渲染，让隐性思维共鸣在空间星群中自动显现。',
      en: 'Project semantic embeddings onto interactive WebGL starfields to surface hidden bridges between disciplines.',
    },
    antiPattern: {
      zh: '目录树嵌套超过四层之后，本质上就是在隐藏知识而不是整理知识。',
      en: 'Deeply nested directory trees beyond four levels bury ideas rather than connecting them.',
    },
  },

  // Open-Source Engines (12)
  {
    id: 'root.engines.d3',
    group: 'engines',
    targets: [
      'root.scenarios.personal_chronos',
      'root.scenarios.family_cashflow',
      'root.scenarios.habit_humanism',
      'root.scenarios.code_dependency',
      'root.scenarios.ai_literacy',
      'root.scenarios.story_journalism',
    ],
    name: { zh: '精密数据几何引擎 · D3', en: 'D3.js Geometric Kernel' },
    domain: { zh: '开源基座 · 数学比例尺与力场', en: 'Open Kernel · Mathematical Scales' },
    pain: {
      zh: '成品模板库无法绘制独一无二的径向星盘、花瓣图腾与精确过渡物理效果。',
      en: 'Off-the-shelf charting suites cannot express bespoke astrolabes, botanical petals, or spring morph physics.',
    },
    solution: {
      zh: '可视化领域的底层数学标杆，完整提供极坐标比例尺、边捆绑算法、桑基流场与精确几何控制。',
      en: 'The gold-standard mathematical foundation mapping empirical arrays straight into custom polar scales, bundles, and paths.',
    },
    antiPattern: {
      zh: '不适合五分钟临时贴一张标准后台柱状表的粗糙场景。',
      en: 'Overkill when all you need is a disposable five-minute administrative summary chart.',
    },
  },
  {
    id: 'root.engines.echarts',
    group: 'engines',
    targets: ['root.scenarios.personal_chronos', 'root.scenarios.market_regime'],
    name: { zh: '高性能画布引擎 · ECharts', en: 'Apache ECharts Engine' },
    domain: { zh: '开源基座 · 双渲染工业级画布', en: 'Open Kernel · Canvas Analytics' },
    pain: {
      zh: '十万级金融与日志时序数据在普通矢量节点下容易严重掉帧卡顿。',
      en: 'Hundred-thousand-point financial logs choke standard DOM/SVG renderers inside the browser.',
    },
    solution: {
      zh: '兼具工业级稳定性与渐进式画布加速，内置日历热力矩阵、多轴联动与时间刷选交互。',
      en: 'Battle-tested Apache canvas renderer offering fluid brushing, zooming, heat calendars, and large-scale stability.',
    },
    antiPattern: {
      zh: '极度打破常规坐标体系的纯艺术雕塑性布局会受到预设配置制约。',
      en: 'Less suited when breaking coordinate rules completely for organic experimental art forms.',
    },
  },
  {
    id: 'root.engines.vega_lite',
    group: 'engines',
    targets: ['root.scenarios.ai_literacy', 'root.scenarios.market_regime'],
    name: { zh: '声明式图形语法 · Vega-Lite', en: 'Vega-Lite Visual Grammar' },
    domain: { zh: '开源基座 · 结构化视觉编码规范', en: 'Open Kernel · Grammar of Graphics' },
    pain: {
      zh: '对比多种统计假设时若反复手写底层绘图指令，探索效率会非常低。',
      en: 'Rewriting imperative canvas code just to compare statistical hypotheses slows analytical curiosity.',
    },
    solution: {
      zh: '遵循经典图形语法理论，以简洁结构化声明即可将字段快速映射至分面、密度与交互过滤。',
      en: 'Compiles concise declarative JSON specifications into honest multi-view statistical comparisons rapidly.',
    },
    antiPattern: {
      zh: '需要电影级自由粒子物理动效与定制手势雕刻时灵活性较弱。',
      en: 'Too rigid for custom particle simulations or free-form artistic museum motion.',
    },
  },
  {
    id: 'root.engines.deckgl',
    group: 'engines',
    targets: ['root.scenarios.city_commute', 'root.scenarios.supply_chain'],
    name: { zh: '空间大数据GPU引擎 · deck.gl', en: 'deck.gl Spatial WebGL2' },
    domain: { zh: '开源基座 · 百万级地理飞弧', en: 'Open Kernel · GPU Geovisualization' },
    pain: {
      zh: '百万条轨迹与动态空间飞弧在常规中央处理器绘制下会瞬间崩溃卡死。',
      en: 'Rendering millions of live trajectory arcs on CPU stalls UI responsiveness immediately.',
    },
    solution: {
      zh: '依托显卡着色器流水线，将三维六边形蜂窝聚合与动态空间弧线渲染得丝滑流畅。',
      en: 'Harnesses WebGL2 shader layers for crisp 3D hexbin columns and global dynamic flow arcs at 60 fps.',
    },
    antiPattern: {
      zh: '纯统计逻辑关系切忌生硬套用世界地图外壳。',
      en: 'Do not wrap purely abstract relational datasets inside geographic maps unnecessarily.',
    },
  },
  {
    id: 'root.engines.antv_g6',
    group: 'engines',
    targets: ['root.scenarios.supply_chain', 'root.scenarios.code_dependency', 'root.scenarios.knowledge_cosmos'],
    name: { zh: '图拓扑关系引擎 · AntV G6', en: 'AntV G6 Graph Topology' },
    domain: { zh: '开源基座 · 复杂关系推演', en: 'Open Kernel · Network Reasoning' },
    pain: {
      zh: '复杂业务依赖网、数据血缘与节点逐层展开折叠用普通图表工具难以维护。',
      en: 'Interactive lineage exploration, sub-graph folding, and combo clustering overwhelm basic chart widgets.',
    },
    solution: {
      zh: '聚焦网络拓扑分析，内置十余种专业图布局与聚焦交互，精准显现多跳结构因果。',
      en: 'Purpose-built graph visualization engine featuring hierarchical layouts, hull grouping, and path tracing.',
    },
    antiPattern: {
      zh: '若实体关系少于十个，直接手绘精细矢量架构图通常更加清晰直观。',
      en: 'For fewer than ten nodes, clean bespoke editorial diagrams communicate faster.',
    },
  },
  {
    id: 'root.engines.antv_g2',
    group: 'engines',
    targets: ['root.scenarios.family_cashflow'],
    name: { zh: '克制美学语法库 · AntV G2', en: 'AntV G2 Visual System' },
    domain: { zh: '开源基座 · 现代产品视觉系统', en: 'Open Kernel · Unified Grammar' },
    pain: {
      zh: '产品级应用既要求视觉编码具备语法扩展度，又要保持高度克制与统一审美。',
      en: 'Production systems demand both expressive visual grammar and disciplined typographic harmony.',
    },
    solution: {
      zh: '融合图形语法与东方克制秩序美学，兼顾精密阅读性与优雅质感。',
      en: 'Combines extensible marks and scales with calm editorial visual restraint.',
    },
    antiPattern: {
      zh: '超大规模三维实时点云需交由专门渲染层处理。',
      en: 'Delegate multi-million 3D point clouds to dedicated WebGL spatial layers.',
    },
  },
  {
    id: 'root.engines.rawgraphs',
    group: 'engines',
    targets: ['root.scenarios.family_cashflow', 'root.scenarios.story_journalism'],
    name: { zh: '零代码矢量生成工坊 · RAWGraphs', en: 'RAWGraphs Vector Studio' },
    domain: { zh: '开源基座 · 本地矢量精修桥梁', en: 'Open Kernel · Editorial SVG Export' },
    pain: {
      zh: '策展人手握结构化表格却缺乏底层的冲积图或弦图编码工具，难以直接导出印刷级矢量稿。',
      en: 'Designers hold rich tabular spreadsheets yet lack fast ways to export print-grade alluvial or Voronoi SVGs.',
    },
    solution: {
      zh: '完全在本地浏览器运行的开源视觉桥梁，拖入表格即生矢量图，无缝衔接入版式精修。',
      en: 'Privacy-preserving browser studio converting raw CSV matrices into publication-ready vector graphics.',
    },
    antiPattern: {
      zh: '不适合需要直接对接高频实时流接口的在线看板。',
      en: 'Not intended for live streaming web applications wired to telemetry sockets.',
    },
  },
  {
    id: 'root.engines.observable_plot',
    group: 'engines',
    targets: ['root.scenarios.personal_chronos', 'root.scenarios.ai_literacy'],
    name: { zh: '探索式统计原型 · Observable Plot', en: 'Observable Plot' },
    domain: { zh: '开源基座 · 快速分面洞察', en: 'Open Kernel · Exploratory Sight' },
    pain: {
      zh: '探索数据早期若花费大量篇幅编写坐标刻度代码，会直接打断灵感节奏。',
      en: 'Boilerplate axis configuration interrupts iterative curiosity during early dataset exploration.',
    },
    solution: {
      zh: '以简洁语义迅速构造高水准蜂群图与分面矩阵，几分钟之内揭晓分布真相。',
      en: 'Distills statistical conventions into concise exploratory syntax for instant faceting and beeswarms.',
    },
    antiPattern: {
      zh: '需要全屏粒子物理与艺术舞台统筹时仍需结合底层画布。',
      en: 'Pair with raw Canvas2D or D3 selections for theatrical interactive installations.',
    },
  },
  {
    id: 'root.engines.threejs',
    group: 'engines',
    targets: ['root.scenarios.code_dependency', 'root.scenarios.knowledge_cosmos'],
    name: { zh: '三维空间雕塑引擎 · Three.js', en: 'Three.js Spatial WebGL' },
    domain: { zh: '开源基座 · 立体点云与景深', en: 'Open Kernel · 3D Data Sculpture' },
    pain: {
      zh: '高维知识语义空间与数字孪生结构在二维平面上无法展现景深与空间包裹感。',
      en: 'Flat canvases flatten volumetric point clouds and semantic proximity fields that live naturally in 3D space.',
    },
    solution: {
      zh: '凭借三维场景图与自定义着色器，把枯燥索引转化为可漫游的立体星系雕塑。',
      en: 'Transforms abstract vector spaces and spatial telemetry into luminous navigable architectural sculptures.',
    },
    antiPattern: {
      zh: '严禁使用三维透视柱状图进行精密财务数值对比。',
      en: 'Never use tilted 3D bar charts for quantitative comparisons where perspective lies.',
    },
  },
  {
    id: 'root.engines.maplibre',
    group: 'engines',
    targets: ['root.scenarios.city_commute'],
    name: { zh: '开源矢量底图引擎 · MapLibre GL', en: 'MapLibre GL Vector Basemaps' },
    domain: { zh: '开源基座 · 暗曜石定制底图', en: 'Open Kernel · Sovereign Maps' },
    pain: {
      zh: '商业封闭地图受限于风格锁定与高昂配额，极难融汇美术馆级别的暗曜石审美基调。',
      en: 'Commercial closed map styles clash with dark museum obsidian palettes and impose restrictive quotas.',
    },
    solution: {
      zh: '完全开放自主可控的矢量瓦片引擎，可深度定制暗金建筑线条并与地理流层无缝叠加。',
      en: 'Open vector tile engine supporting bespoke obsidian architectural basemaps under spatial flow layers.',
    },
    antiPattern: {
      zh: '若只比较各区域抽象指标高低，采用等积方块拓扑地图更为公正。',
      en: 'Use balanced tile-grid cartograms rather than literal borders when land area biases attention.',
    },
  },
  {
    id: 'root.engines.scrollama',
    group: 'engines',
    targets: ['root.scenarios.story_journalism'],
    name: { zh: '滚动叙事编排器 · Scrollama', en: 'Scrollama Choreography' },
    domain: { zh: '开源基座 · 渐进式舞台转场', en: 'Open Kernel · Scrollytelling' },
    pain: {
      zh: '复杂视觉模型若一次性堆满视窗，读者往往瞬间迷失视线焦点。',
      en: 'Presenting ten visual dimensions at once induces cognitive paralysis before readers grasp the premise.',
    },
    solution: {
      zh: '轻量精确触发视野交叉事件，配合文本章节逐步揭晓复杂图景的内在规律。',
      en: 'Lightweight IntersectionObserver choreography synchronizing narrative prose steps with graphic morphs.',
    },
    antiPattern: {
      zh: '日常高频检索操作界面切勿滥用强制滚动拦截动效。',
      en: 'Avoid scroll-hijacking transitions inside high-frequency productivity consoles.',
    },
  },
  {
    id: 'root.engines.p5_generative',
    group: 'engines',
    targets: ['root.scenarios.habit_humanism'],
    name: { zh: '生成式粒子画布 · Canvas2D', en: 'Generative Canvas2D Physics' },
    domain: { zh: '开源基座 · 弹簧粒子与混沌秩序', en: 'Open Kernel · Spring Particle Systems' },
    pain: {
      zh: '页面矢量节点超过三千个时，传统节点系统会开始丧失流体动画的丝滑质感。',
      en: 'Standard DOM trees lose silky 60 fps fluid motion once particle counts surpass several thousand.',
    },
    solution: {
      zh: '直接操控像素缓冲区与阻尼弹簧方程，让混沌星尘瞬间坍缩归位为秩序神殿。',
      en: 'Integrates damped spring kinematics directly onto high-DPI canvases for breathtaking chaos-to-order motion.',
    },
    antiPattern: {
      zh: '需要读屏无障碍检索的精密文本卡片仍以语义结构化容器为佳。',
      en: 'Keep crisp SVG/DOM overlays when screen-reader text selection is primary.',
    },
  },
];

export const PRISM_ARCHETYPES = [
  { key: 'high_burn', color: '#E05A47', label: { zh: '传统高压赛道', en: 'High-Burn Track' } },
  { key: 'steady_drift', color: '#8C92A4', label: { zh: '惯性舒适区', en: 'Steady Drift' } },
  { key: 'indie_craft', color: '#3B8EA5', label: { zh: '独立数字工匠', en: 'Indie Craftsperson' } },
  { key: 'ai_leveraged', color: '#D4AF37', label: { zh: 'AI 协同探索者', en: 'AI-Leveraged Pioneer' } },
];

export const PRISM_STAGE_ESSAYS = {
  chaos: {
    zh: {
      title: '视角零 · 混沌原始散点',
      desc: '120 位探索者的职业与生活决策杂乱堆叠，没有任何统计尺度，大脑只能看见一片无解的尘埃。',
      lesson: '没有视觉编码的数据只是噪声；但错误的视觉编码甚至比噪声更具误导性。',
    },
    en: {
      title: 'View 0 · Unencoded Raw Scatter',
      desc: 'One hundred twenty real career and life specimens scatter across space with no scale or reference—leaving perception lost in raw dust.',
      lesson: 'Unencoded telemetry is noise; misleadingly encoded charts are even more dangerous.',
    },
  },
  bar: {
    zh: {
      title: '视角甲 · 平均值的谎言',
      desc: '柱状图冷冰冰地告诉你：四类赛道的「综合均值」几乎都在 50 至 65 分之间相差无几！这是 AI 生成图表最常制造的盲区——它抹平了一切极端代价与内部分化。',
      lesson: '只要看见只给平均值的柱状图，请立刻追问：它的方差、双峰分化与尾部代价是什么？',
    },
    en: {
      title: 'View A · The Lie of Averages',
      desc: 'Cold summary bars claim all four life tracks share virtually identical composite averages (50–65). AI-generated summary charts love this illusion—erasing hidden divergence and anxiety cost.',
      lesson: 'Whenever you are handed a standalone average bar, ask immediately for variance, bimodality, and hidden trade-offs.',
    },
  },
  beeswarm: {
    zh: {
      title: '视角乙 · 个体蜂群分布',
      desc: '把柱状图打散成 120 个真实个体，惊人真相瞬间浮现：「独立数字工匠」内部呈现明显的双峰撕裂，而「传统高压赛道」则向低自由区密集挤压。',
      lesson: '蜂群分布图既保留了整体分布形态，又让每一个真实个体都不被冷冰冰地“平均”掉。',
    },
    en: {
      title: 'View B · Individual Force Beeswarm',
      desc: 'Breaking bars back into 120 individual specimens exposes startling truth: Indie Craftspeople split along a sharp bimodal chasm while High-Burn workers cluster tightly toward low time freedom.',
      lesson: 'Force beeswarms preserve overall distribution density without erasing a single individual specimen.',
    },
  },
  scatter: {
    zh: {
      title: '视角丙 · 自由与焦虑前沿',
      desc: '横轴是「时间自由度」，纵轴是「长期焦虑指数」。表面回报优渥却高压的赛道往往扎堆于高焦虑区，而善用 AI 协同杠杆的探索者正稳定挺进右下角帕累托最优前沿。',
      lesson: '二维权衡散点图一眼揭示结构性取舍，打破单维度数字攀比。',
    },
    en: {
      title: 'View C · Freedom vs. Anxiety Frontier',
      desc: 'Plotting Time Sovereignty (X) against Chronic Anxiety (Y) uncovers hidden trade-offs: traditional intensity bunches high on distress while AI-leveraged pioneers push toward the calm Pareto frontier.',
      lesson: 'Relational scatter plots expose hidden opportunity costs masked by single-score leaderboards.',
    },
  },
  glyphs: {
    zh: {
      title: '视角丁 · 数据人文繁花',
      desc: '每朵几何花完整编码一个真实个体的五维生命质感（创造力、财务、自由度、韧性、十年复利）。当数据拒绝被粗暴压缩成单一均值，每个人的立体质地就能被尊严地看见。',
      lesson: '最高级的数据可视化不只是算术压缩，而是以几何仪式感归还生命本身的尊严与秩序之美。',
    },
    en: {
      title: 'View D · Botanical Humanism Glyphs',
      desc: 'Each geometric blossom encodes one human life across five dimensions: Creativity, Financial Yield, Sovereignty, Resilience, and 10-Year Compounding. Complexity is preserved with dignity rather than flattened.',
      lesson: 'The highest visual art does not merely accelerate arithmetic—it honors human nuance and beauty.',
    },
  },
};

export function generateDecisionCohort() {
  const rng = mulberry32(998877);
  const archConfigs = [
    {
      key: 'high_burn',
      label: { zh: '传统高压赛道', en: 'High-Burn Track' },
      color: '#E05A47',
      base: { creativity: 34, financial: 82, freedom: 22, resilience: 31, compounding: 45 },
    },
    {
      key: 'ai_leveraged',
      label: { zh: 'AI 协同探索者', en: 'AI-Leveraged Pioneer' },
      color: '#D4AF37',
      base: { creativity: 86, financial: 79, freedom: 84, resilience: 78, compounding: 90 },
    },
    {
      key: 'indie_craft',
      label: { zh: '独立数字工匠', en: 'Indie Craftsperson' },
      color: '#3B8EA5',
      base: { creativity: 88, financial: 56, freedom: 89, resilience: 72, compounding: 76 },
    },
    {
      key: 'steady_drift',
      label: { zh: '惯性舒适区', en: 'Steady Drift' },
      color: '#8C92A4',
      base: { creativity: 42, financial: 54, freedom: 51, resilience: 44, compounding: 32 },
    },
  ];

  const cohort = [];
  for (let i = 0; i < 120; i++) {
    const arch = archConfigs[i % 4];
    const jitter = () => (rng() - 0.5) * 26;
    const clamp = (v) => Math.max(8, Math.min(98, Math.round(v)));

    const bimodalShift = i % 8 < 4 ? -11 : 11;
    const creativity = clamp(arch.base.creativity + jitter());
    const financial = clamp(arch.base.financial + jitter() + (arch.key === 'indie_craft' ? bimodalShift * 1.4 : 0));
    const freedom = clamp(arch.base.freedom + jitter());
    const resilience = clamp(arch.base.resilience + jitter());
    const compounding = clamp(arch.base.compounding + jitter());

    const composite = Math.round((creativity + financial + freedom + resilience + compounding) / 5);

    cohort.push({
      id: i + 1,
      code: {
        zh: `样本编号 ${String(i + 1).padStart(3, '0')}`,
        en: `SPECIMEN-${String(i + 1).padStart(3, '0')}`,
      },
      archetype: arch.key,
      archetypeLabel: arch.label,
      color: arch.color,
      creativity,
      financial,
      freedom,
      resilience,
      compounding,
      composite,
      anxiety: clamp(108 - resilience * 0.75 - freedom * 0.28 + (rng() - 0.5) * 14),
    });
  }
  return cohort;
}
