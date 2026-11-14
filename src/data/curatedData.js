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

const MONTHS_CN = ['一月 JAN', '二月 FEB', '三月 MAR', '四月 APR', '五月 MAY', '六月 JUN', '七月 JUL', '八月 AUG', '九月 SEP', '十月 OCT', '十一月 NOV', '十二月 DEC'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
      monthLabel: MONTHS_CN[monthIdx],
      dateLabel: `${monthIdx + 1}月${dayInMonth}日`,
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
    { id: 'src_time', col: 0, label: '主动时间与专注力', en: 'ACTIVE HOURS', color: '#D4AF37' },
    { id: 'src_capital', col: 0, label: '现金流与既有积蓄', en: 'CAPITAL BASE', color: '#3B8EA5' },
    { id: 'src_ai', col: 0, label: 'AI 自动化杠杆', en: 'AI LEVERAGE', color: '#8ad6ea' },
    // Col 1: Channels
    { id: 'ch_compounding', col: 1, label: '深度学习与复用资产', en: 'COMPOUNDING CRAFT', color: '#D4AF37' },
    { id: 'ch_vitality', col: 1, label: '核心关系与身心修复', en: 'VITALITY & TRUST', color: '#3B8EA5' },
    { id: 'ch_friction', col: 1, label: '情绪内耗与决策迟疑', en: 'COGNITIVE FRICTION', color: '#E05A47' },
    { id: 'ch_leaks', col: 1, label: '隐形订阅与冲动消费', en: 'INVISIBLE LEAKS', color: '#c44d3c' },
    { id: 'ch_noise', col: 1, label: '低效社交与会议噪音', en: 'MEETING NOISE', color: '#8C92A4' },
    // Col 2: Long-term Outcomes
    { id: 'out_freedom', col: 2, label: '时间自由度净值', en: 'SOVEREIGNTY', color: '#D4AF37' },
    { id: 'out_moat', col: 2, label: '跨界稀缺护城河', en: 'RARE MOAT', color: '#3B8EA5' },
    { id: 'out_entropy', col: 2, label: '不可逆熵增损耗', en: 'ENTROPY LOSS', color: '#E05A47' },
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
  // Scenarios
  {
    id: 'root.scenarios.personal_chronos',
    name: '个人十年时间账单',
    group: 'scenarios',
    domain: '生活秩序 · Life Rhythm',
    targets: ['root.engines.d3', 'root.engines.observable_plot', 'root.engines.echarts'],
    pain: '日程记录散落在日历、笔记与待办软件里，根本看不清自己过去数年真正的注意力流向。',
    solution: '采用径向年轮图（Radial Rose）或流式主题河（ThemeRiver），把离散时间戳编码为季节韵律与专注弧线。',
    antiPattern: '切忌做成密密麻麻的年度 Excel 打卡方格表，毫无时间质感与叙事张力。',
  },
  {
    id: 'root.scenarios.family_cashflow',
    name: '家庭资产与隐形漏损',
    group: 'scenarios',
    domain: '生活秩序 · Cash Flow',
    targets: ['root.engines.d3', 'root.engines.rawgraphs', 'root.engines.antv_g2'],
    pain: '记账软件只显示"餐饮花了多少钱"，却无法回答"哪类固定支出正在吞噬长期自由度"。',
    solution: '用多阶段桑基织锦（Alluvial / Sankey Loom）强制展现从收入来源到长期资产/耗散的守恒流向。',
    antiPattern: '拒绝多个孤立的环形饼图——饼图只能切片，永远看不出因果流向。',
  },
  {
    id: 'root.scenarios.habit_humanism',
    name: '情绪日记与人文度量',
    group: 'scenarios',
    domain: '生活秩序 · Data Humanism',
    targets: ['root.engines.d3', 'root.engines.p5_generative'],
    pain: '冰冷的打分表（1-10分）无法承载人类日常生活里细腻的情绪、陪伴与创作状态。',
    solution: '借鉴 Giorgia Lupi《Dear Data》，用五维几何繁花符号（Botanical Glyphs）把主观体验编码为独一无二的艺术图腾。',
    antiPattern: '切忌用标准 KPI 红绿灯仪表盘来量化人的生活幸福感。',
  },
  {
    id: 'root.scenarios.city_commute',
    name: '城市通勤与空间脉搏',
    group: 'scenarios',
    domain: '空间维度 · Urban Mobility',
    targets: ['root.engines.deckgl', 'root.engines.maplibre'],
    pain: '数百万条早晚高峰出行轨迹在传统二维地图上会重叠成一团死黑，无法识别走廊拥堵节点。',
    solution: '使用 GPU 加速的 3D 六边形聚合柱（Hexbin）与动态飞弧图层（ArcLayer），分离高度与流动速度。',
    antiPattern: '千万不要直接在底图上暴力渲染十万个不透明圆点（Overplotting 灾难）。',
  },
  {
    id: 'root.scenarios.supply_chain',
    name: '跨国供应链脆弱性拓扑',
    group: 'scenarios',
    domain: '工作秩序 · Supply Chain',
    targets: ['root.engines.antv_g6', 'root.engines.d3', 'root.engines.deckgl'],
    pain: '上下游数千家供应商互相嵌套依赖，一旦某个二级节点断供，常规报表完全无法预警级联风险。',
    solution: '采用分层边捆绑（Hierarchical Edge Bundling）或拓扑穿透画布，高亮关键枢纽与单点瓶颈。',
    antiPattern: '绝对避免把所有连线直接摊成一团无序的力导向"毛线球"（Hairball）。',
  },
  {
    id: 'root.scenarios.code_dependency',
    name: '复杂系统与代码依赖图谱',
    group: 'scenarios',
    domain: '工作秩序 · Architecture',
    targets: ['root.engines.d3', 'root.engines.antv_g6', 'root.engines.threejs'],
    pain: '大型软件仓历经多年演进，模块循环引用与隐藏耦合让新人望而生畏。',
    solution: '用 360° 径向聚类捆绑环（Chord + Edge Bundle）将紧密耦合的模块聚成视觉星簇。',
    antiPattern: '切忌使用平铺直叙的超大静态 UML 图——放大看不清全局，缩小看不见连线。',
  },
  {
    id: 'root.scenarios.ai_literacy',
    name: 'AI 生成图表的真相甄别',
    group: 'scenarios',
    domain: '认知教育 · Visual Literacy',
    targets: ['root.engines.vega_lite', 'root.engines.observable_plot', 'root.engines.d3'],
    pain: '大模型能 3 秒吐出看似专业的报告柱状图，却常常通过截断坐标轴或隐藏双峰分布误导决策。',
    solution: '用声明式图形语法（Vega-Lite）在同一份数据上并列渲染均值、蜂群分布与多维散点，戳破单一均值谎言。',
    antiPattern: '切忌盲信单一汇总柱状图或双纵轴相关性错觉。',
  },
  {
    id: 'root.scenarios.market_regime',
    name: '多因子金融周期与波动',
    group: 'scenarios',
    domain: '工作秩序 · Quant & Finance',
    targets: ['root.engines.echarts', 'root.engines.vega_lite', 'root.engines.d3'],
    pain: '十几个宏观指标同时震荡时，人眼很难分辨周期轮动顺序与尾部风险聚集。',
    solution: '使用地平线图（Horizon Chart）压缩多通道时间序列，或以连通散点图（Connected Scatter）刻画相空间轨迹。',
    antiPattern: '避免把 12 条折线挤在同一个坐标系里变成意大利面（Spaghetti Chart）。',
  },
  {
    id: 'root.scenarios.story_journalism',
    name: '公共议题交互长文叙事',
    group: 'scenarios',
    domain: '认知教育 · Scrollytelling',
    targets: ['root.engines.scrollama', 'root.engines.d3', 'root.engines.rawgraphs'],
    pain: '枯燥的万字白皮书与静态 PDF 报告没人看得下去，重要公共议题难以触达普通人。',
    solution: '借鉴《The Pudding》模式：随页面滚动逐步触发图表形态变形（Scrollytelling），一屏只讲清一个洞见。',
    antiPattern: '不要把整整 20 张静态图片直接贴进长文章里，读者会在第 3 张失去耐心。',
  },
  {
    id: 'root.scenarios.knowledge_cosmos',
    name: '个人/团队第二大脑星系',
    group: 'scenarios',
    domain: '工作秩序 · Knowledge Graph',
    targets: ['root.engines.threejs', 'root.engines.antv_g6', 'root.engines.d3'],
    pain: '数千篇笔记与文献按文件夹分类后变成信息坟墓，跨领域灵感无法碰撞。',
    solution: '利用语义嵌入降维 + WebGL 点云星系（Three.js）或力导向星簇，将隐含关联推到视觉前排。',
    antiPattern: '树形文件夹嵌套超过 4 层后，本质上就是在隐藏知识而不是组织知识。',
  },

  // Open-Source Engines
  {
    id: 'root.engines.d3',
    name: 'D3.js (v7)',
    group: 'engines',
    domain: '底层几何数学引擎',
    targets: ['root.scenarios.personal_chronos', 'root.scenarios.family_cashflow', 'root.scenarios.habit_humanism', 'root.scenarios.code_dependency', 'root.scenarios.ai_literacy', 'root.scenarios.story_journalism'],
    pain: '标准模板库画不出独一无二的径向星盘、花朵图腾与自定义过渡物理效果。',
    solution: '数据可视化界的黄金底层引擎，提供比例尺、力模拟、弦图、桑基与捆绑算法，控制到每一个像素与弧度。',
    antiPattern: '不适合只想 5 分钟贴一个普通业务报表的需求（杀鸡无需牛刀）。',
  },
  {
    id: 'root.engines.echarts',
    name: 'Apache ECharts',
    group: 'engines',
    domain: '高性能交互引擎',
    targets: ['root.scenarios.personal_chronos', 'root.scenarios.market_regime'],
    pain: '十万级金融/日志序列在普通 SVG DOM 下直接卡死浏览器。',
    solution: 'Apache 顶级开源项目，内置 Canvas/WebGL 双渲染器与开箱即用的缩放、刷选与日历热力矩阵。',
    antiPattern: '高度非线性、打破常规坐标体系的艺术化定制会受到配置项限制。',
  },
  {
    id: 'root.engines.vega_lite',
    name: 'Vega-Lite',
    group: 'engines',
    domain: '声明式图形语法',
    targets: ['root.scenarios.ai_literacy', 'root.scenarios.market_regime'],
    pain: '验证不同统计假设时反复改写底层绘图代码效率极低。',
    solution: '基于 Wilkinson《图形语法》，用一段简洁 JSON 声明数据字段到颜色/位置/分面的映射，与 Python Altair 无缝打通。',
    antiPattern: '需要电影级粒子物理动画或复杂手势交互时不如 D3/Three.js 灵活。',
  },
  {
    id: 'root.engines.deckgl',
    name: 'deck.gl',
    group: 'engines',
    domain: 'GPU 空间地理引擎',
    targets: ['root.scenarios.city_commute', 'root.scenarios.supply_chain'],
    pain: '地理轨迹与百万级坐标点在 CPU 渲染下帧率暴跌。',
    solution: 'Uber 开源的 WebGL2 大规模空间渲染引擎，自带 ArcLayer、HexagonLayer、TripsLayer，丝滑呈现城市脉搏。',
    antiPattern: '纯非空间类的统计对比图不要强行套地图壳子。',
  },
  {
    id: 'root.engines.antv_g6',
    name: 'AntV G6',
    group: 'engines',
    domain: '图分析与关系引擎',
    targets: ['root.scenarios.supply_chain', 'root.scenarios.code_dependency', 'root.scenarios.knowledge_cosmos'],
    pain: '复杂业务拓扑、血缘链路与节点展开折叠用普通图表库几乎无法维护。',
    solution: '蚂蚁开源的专业图可视化引擎，内置十余种图布局与交互行为，专注揭示实体之间的结构因果。',
    antiPattern: '如果节点关系少于 10 个，直接用清晰的结构插画往往更直观。',
  },
  {
    id: 'root.engines.antv_g2',
    name: 'AntV G2',
    group: 'engines',
    domain: '现代设计语法体系',
    targets: ['root.scenarios.family_cashflow'],
    pain: '商业分析应用既需要图形语法灵活性，又要求一致且考究的视觉规范。',
    solution: '融合图形语法与东方克制美学的统计可视化引擎，极适合企业与数据产品内置。',
    antiPattern: '纯 WebGL 百万点云场景需交由专门层渲染。',
  },
  {
    id: 'root.engines.rawgraphs',
    name: 'RAWGraphs',
    group: 'engines',
    domain: '零代码矢量桥梁',
    targets: ['root.scenarios.family_cashflow', 'root.scenarios.story_journalism'],
    pain: '设计师与非程序员手里有 CSV 数据，却写不出复杂的冲积图或圆堆积代码。',
    solution: '纯浏览器端本地运行的开源神器：拖入表格即可生成非标准复杂图表并一键导出高精度 SVG 进 Illustrator/Figma 精修。',
    antiPattern: '不适合需要连接实时数据库 API 的动态 Web 应用。',
  },
  {
    id: 'root.engines.observable_plot',
    name: 'Observable Plot',
    group: 'engines',
    domain: '探索式统计原型',
    targets: ['root.scenarios.personal_chronos', 'root.scenarios.ai_literacy'],
    pain: 'D3 上手曲线陡峭，探索数据初期写坐标轴太耗时。',
    solution: 'D3 作者 Mike Bostock 打造的简洁探索式语法库，几行代码即可出极高质量的 Beeswarm 与分面图。',
    antiPattern: '需要全屏复杂交互舞台时仍需结合 D3 或 Canvas。',
  },
  {
    id: 'root.engines.threejs',
    name: 'Three.js / WebGL',
    group: 'engines',
    domain: '三维空间雕塑引擎',
    targets: ['root.scenarios.code_dependency', 'root.scenarios.knowledge_cosmos'],
    pain: '高维嵌入空间与数字孪生场景在二维平面上无法展现景深与空间层级。',
    solution: '浏览器三维空间渲染标准，结合三维数据雕塑与点云着色器，将抽象拓扑化作可漫游的立体空间。',
    antiPattern: '精确数值大小比较（如财务金额对比）严禁使用 3D 柱状图！',
  },
  {
    id: 'root.engines.maplibre',
    name: 'MapLibre GL',
    group: 'engines',
    domain: '开源矢量底图引擎',
    targets: ['root.scenarios.city_commute'],
    pain: '商业地图服务受限于配额与样式锁定，难以适配深邃暗黑的美术馆底图风格。',
    solution: '完全开源的矢量瓦片地图引擎，可深度定制暗曜石建筑纹理与 deck.gl 无缝叠加。',
    antiPattern: '仅作示意性的抽象区域对比时，用简单拓扑方格地图（Tile Grid Map）往往更公平。',
  },
  {
    id: 'root.engines.scrollama',
    name: 'Scrollama',
    group: 'engines',
    domain: '滚动叙事编排器',
    targets: ['root.scenarios.story_journalism'],
    pain: '复杂图表一次性全部塞给读者会导致认知过载，不知先看哪里。',
    solution: '《The Pudding》广泛使用的轻量级 IntersectionObserver 驱动库，把长篇数据科普拆解为渐进式舞台演出。',
    antiPattern: '工具型高频查询后台不要滥用强制滚动动画，以免拖慢操作效率。',
  },
  {
    id: 'root.engines.p5_generative',
    name: 'p5.js / Canvas2D',
    group: 'engines',
    domain: '生成式数据艺术画布',
    targets: ['root.scenarios.habit_humanism'],
    pain: 'DOM/SVG 节点超过 3000 个时，流体粒子与有机物理模拟开始掉帧。',
    solution: '以像素和弹簧物理为核心的创意编程画布，让“混沌粒子汇聚成秩序”的视觉魔法丝般顺滑。',
    antiPattern: '需要无障碍屏幕阅读器或文本选中复制的场景优先考虑 SVG。',
  },
];

export function generateDecisionCohort() {
  const rng = mulberry32(998877);
  const archetypes = [
    {
      key: 'high_burn',
      label: '传统高压赛道',
      color: '#E05A47',
      base: { creativity: 34, financial: 82, freedom: 22, resilience: 31, compounding: 45 },
    },
    {
      key: 'ai_leveraged',
      label: 'AI 协同杠杆者',
      color: '#D4AF37',
      base: { creativity: 86, financial: 79, freedom: 84, resilience: 78, compounding: 90 },
    },
    {
      key: 'indie_craft',
      label: '独立数字工匠',
      color: '#3B8EA5',
      base: { creativity: 88, financial: 56, freedom: 89, resilience: 72, compounding: 76 },
    },
    {
      key: 'steady_drift',
      label: '惯性舒适区漂流',
      color: '#8C92A4',
      base: { creativity: 42, financial: 54, freedom: 51, resilience: 44, compounding: 32 },
    },
  ];

  // Construct 120 individuals where Group A & B have deceptive close overall means on raw summary,
  // yet starkly polarized underlying distributions and 5D trade-offs.
  const cohort = [];
  for (let i = 0; i < 120; i++) {
    const arch = archetypes[i % 4];
    const jitter = () => (rng() - 0.5) * 26;
    const clamp = (v) => Math.max(8, Math.min(98, Math.round(v)));

    // Inject bimodal polarization inside financial & freedom
    const bimodalShift = i % 8 < 4 ? -11 : 11;
    const creativity = clamp(arch.base.creativity + jitter());
    const financial = clamp(arch.base.financial + jitter() + (arch.key === 'indie_craft' ? bimodalShift * 1.4 : 0));
    const freedom = clamp(arch.base.freedom + jitter());
    const resilience = clamp(arch.base.resilience + jitter());
    const compounding = clamp(arch.base.compounding + jitter());

    // Composite index designed so average appears near ~62 across cohorts while hiding extreme variance
    const composite = Math.round((creativity + financial + freedom + resilience + compounding) / 5);

    cohort.push({
      id: i + 1,
      code: `SPECIMEN-${String(i + 1).padStart(3, '0')}`,
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
