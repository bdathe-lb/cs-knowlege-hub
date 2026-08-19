# knowledge-hub-web

[`~/projects/knowledge-hub`](../knowledge-hub) 的 Web 前端 —— 把那批 Markdown 笔记
编译成一个带全文搜索的静态站点。

笔记本身仍然是唯一真源，**本项目不修改任何 `.md` 文件**，只读取它们。

## 现状

设计阶段。已定：

- 视觉方向：**技术规格书（Spec Sheet）** —— 直角、发丝线、等宽标题、密度优先
- 计划引擎：Astro Starlight（桥接自有令牌，见 `docs/design-system.md` §11）

尚未开始实现。

## 文档

| 文件 | 内容 |
|---|---|
| [`docs/design-system.md`](docs/design-system.md) | 设计规范：原则、颜色、排版、组件、交互、禁止项 |
| [`docs/tokens.css`](docs/tokens.css) | 设计令牌，样式的唯一真源 |
| [`docs/page-specs.md`](docs/page-specs.md) | 五种页面的布局与内容规则 |

交互原型（含真实数据）：https://claude.ai/code/artifact/0e9ee5a4-a6df-405e-b418-b21bb7458bd0

## 为什么是这个方向

判断依据来自内容成分，不是观感偏好：

| | |
|---|---|
| 索引笔记 | 38 篇 · 8,310 行 |
| 全库 Markdown | 42 个文件 · 8,502 行 |
| 代码块 | 483 个 |
| 表格行 | 1,169 行 |
| 追踪条目 | 58 个（20 个待写） |

代码与表格合计占正文四成以上，典型场景是「干活干到一半，忘了 `awk` 的 `-F` 怎么写」。
这是一个**查**的站，密度是核心指标 —— 因此排除了留白型的现代文档站方向。

完整推导见 `docs/design-system.md` §2。
