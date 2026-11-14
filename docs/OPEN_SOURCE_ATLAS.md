# Open-Source Data Visualization Atlas · 开源数据可视化策展图谱

> **Core Thesis / 策展宣言**  
> In an era when AI can generate charts and reports in seconds, the scarcest human capability is **visual literacy** — the power to see structural order beneath noisy reality, choose honest encodings, and translate open-source engineering into human insight.

---

## I. Theoretical & Methodological Foundations (世界经典可视化思想库)

Before writing a single line of code, every exhibit in *The Pantheon of Order* follows five foundational frameworks:

1. **From Data to Viz** (*Yan Holtz*) — A decision tree driven strictly by **input data structure** (numeric, categorical, time-series, network, spatial). Eliminates structural mismatches and catalogs common statistical pitfalls (e.g., spaghetti line charts, overplotting, pie-slice distortion).
2. **Visual Vocabulary** (*Financial Times — Alan Smith et al.*) — A taxonomy driven by **analytical communication intent**: *Deviation, Correlation, Ranking, Distribution, Change over Time, Part-to-Whole, Spatial, Flow*.
3. **Data Viz Project** (*Ferdio*) — A visual morphology catalog indexed by geometric form and functional mapping, pushing creators beyond default bar and line templates.
4. **Data Humanism** (*Giorgia Lupi — Dear Data / Accurat / Pentagram*) — Rejects cold aggregation when human nuance matters. Advocates encoding multiple personal, emotional, and qualitative dimensions into bespoke hand-crafted glyphs.
5. **Data Sketches & Scrollytelling** (*Nadieh Bremer & Shirley Wu; The Pudding*) — Proves that **code-driven bespoke geometry** (custom radial layouts, SVG/Canvas force hybrids, scroll-choreographed transitions) can turn empirical datasets into museum-grade interactive essays.

---

## II. Open-Source Engine Matrix (世界主流开源技术栈选型矩阵)

| Library / Engine | Core Paradigm | Unrivaled Sweet Spot (不可替代的优势场景) | Avoid Using When (误区警告) |
|---|---|---|---|
| **D3.js** | Low-level Data-to-DOM / Geometric Math | Bespoke art-grade layouts: hierarchical edge bundling, custom radial astrolabes, chord/alluvial flows, physics morphing | Standard KPI corporate dashboards where rapid out-of-the-box config matters more than custom geometry |
| **Apache ECharts** | High-performance Declarative Canvas/WebGL | Dense enterprise/operational analytics, interactive brushing/zooming, calendar heatmaps, large-volume time series | Ultra-bespoke non-standard organic glyphs or custom force-particle transitions |
| **Vega-Lite** | Declarative Grammar of Graphics (JSON) | Reproducible research, statistical faceting, rapid hypothesis comparison ("same dataset, 4 encodings") | Cinematic custom animations or fluid WebGL particle physics |
| **deck.gl** | GPU-accelerated WebGL2 Spatial Layers | Millions of GPS/trajectory arcs, urban commuter pulses, 3D hexagon density grids, global shipping flows | Small tabular datasets without spatial coordinates |
| **AntV (G2 / G6 / X6)** | Grammar Charts + Graph Topology Engine | Complex supply-chain dependency graphs, knowledge networks, lineage tracing, organizational architectures | Simple standalone sparklines or artistic SVG print posters |
| **RAWGraphs** | Zero-code Client-side Vector Generator | Rapidly turning messy CSVs into alluvial, bump, or circle-packing SVGs for editorial print & design refinement | Real-time streaming web apps requiring live API state |
| **Observable Plot** | Concise Exploratory Grammar by Mike Bostock | Fast exploratory data journalism, beeswarm & multi-facet statistical prototyping | Full-screen 3D spatial museum environments |
| **Three.js / WebGL** | 3D Scene Graph & Custom Shaders | Spatial sculptures, point clouds, architectural digital twins, interactive 3D exhibition centerpieces | 2D quantitative reading where perspective foreshortening distorts value comparisons |

---

## III. Scenario-to-Order Translation Matrix (现实混乱 → 秩序映射表)

| Real-World Chaos (生活与工作的无序现场) | Hidden Structural Question | Optimal Visual Form | Open-Source Stack | Anti-Pattern to Reject |
|---|---|---|---|---|
| **365天碎片化日程与注意力耗散** | 深度心流在何时发生、又被什么打断？ | Circadian Radial Rose + Streak Arcs | D3.js + Canvas2D | 密密麻麻的表格清单或普通柱状日历 |
| **现金流、时间精力与隐形内耗** | 资源从哪来、流向何处、在哪悄悄漏掉？ | Multi-stage Alluvial / Sankey Loom | D3 Sankey / Bezier Flow | 多个孤立的饼图（看不出流向与因果） |
| **跨部门协作、代码依赖与供应链瓶颈** | 谁是系统单点脆弱性、哪些集群互相耦合？ | Hierarchical Edge Bundling | D3 Cluster + Bundle Curve | 无序的力导向“毛线球”（Hairball Graph） |
| **人生选择、薪资/收益与风险评估** | 平均值掩盖了多少双峰分化与极端代价？ | Force Beeswarm + Botanical Glyphs | D3 Force + Custom SVG/Canvas | 只展示单一均值柱状图（Average Trap） |
| **城市通勤、物流与全球资源分布** | 高密度热点与跨区域流动的真实脉冲是什么？ | 3D Arcs & Hexbin Density Layers | deck.gl + MapLibre | 平面静态散点图（严重重叠遮挡） |

---

## IV. Five Visual Lies in the AI Era (AI 时代必懂的五种视觉误导)

1. **The Tyranny of the Mean (平均值的暴政)** — Averaging a bimodal distribution invents a "typical case" that nobody actually experiences. *Fix: Beeswarm or ridgeline distribution.*
2. **Truncated Axis Panic (截断纵轴制造恐慌)** — Starting a bar chart at 95% instead of 0% magnifies a 1% fluctuation into a visual cliff. *Fix: Always anchor length encodings at zero.*
3. **Dual-Axis Mirage (双纵轴因果幻觉)** — Scaling two unrelated Y-axes independently can make any two lines look correlated. *Fix: Indexed percentage change or connected scatterplot.*
4. **Hairball Network Mysticism (毛线球网络玄学)** — Dumping 500 unbundled edges creates visual awe with zero readability. *Fix: Hierarchical edge bundling + interactive ego-network focus.*
5. **3D Perspective Distortion (3D 透视失真)** — Tilting pie or bar charts makes foreground slices look 2× larger than equal background slices. *Fix: Reserve 3D strictly for genuinely 3D spatial/sculptural data.*
