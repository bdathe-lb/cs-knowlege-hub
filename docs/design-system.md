# 设计规范 · 技术规格书方向

knowledge-hub 前端的样式真源。实现层的令牌在 [`tokens.css`](./tokens.css)，
页面级布局在 [`page-specs.md`](./page-specs.md)。

---

## 1. 这份文档管什么

管**长什么样**和**为什么长这样**。不管用哪个框架、怎么构建、内容怎么组织。

改动规则：

- 加新组件 → 先在这里定规格，再写代码
- 需要一个现有令牌覆盖不了的值 → 先确认现有的确实都不合适，再往 `tokens.css` 加，**不要在组件里写死**
- 想加圆角、阴影、渐变、第二个强调色 → 见 §10「禁止项」，那是方向本身的约束

---

## 2. 设计原则

三条，按优先级排。冲突时上位覆盖下位。

### 原则一：密度优先于呼吸感

这是一个**查**的站，不是**读**的站。判断依据来自内容本身 ——
全库 8502 行里，代码块与表格合计占四成以上，典型使用场景是「干活干到一半，忘了
`awk` 的 `-F` 怎么写」。

可判定的推论：

- 正文行高上限 **1.72**，不再放宽
- 同屏信息量是设计评审的一等指标。若一次改动让首屏内容变少，需要说明换来了什么
- 章节之间用**线**分隔，不用大段留白

### 原则二：装饰为零，结构承担全部表达

层级靠**字体、字重、字距、线**表达，不靠色块、圆角、阴影。

- 圆角恒为 `0`
- 全站唯一强调色 `--kb-accent`（蓝图青）。`--kb-warn` 是「待写」状态色，**不是第二强调色**，不得用于装饰
- 每个结构装置都必须编码真实信息。进度条表示真实覆盖率，标签表示真实状态；不存在纯装饰的横线、序号、图标

### 原则三：等宽字体是结构信号，不是风格

mono 出现的地方必须有理由 —— 它标记的是「这是一个标识符 / 一个路径 / 一个可复制的东西 / 一个坐标」。

| 用 mono | 用 sans |
|---|---|
| 页标题（工具名本身就是命令） | 三级标题、正文 |
| 小节标题（充当锚点坐标） | 列表项 |
| 文件路径、行数、面包屑 | 表格单元格文字 |
| 侧栏导航项（都是命令名） | 说明性文案 |
| 表头、标签、眉标 | |
| 代码块、行内 code | |

---

## 3. 颜色

取值见 [`tokens.css`](./tokens.css) §1–§2。

### 表面层级

从上到下四层，任何面都必须落在其中之一：

| 令牌 | 用途 |
|---|---|
| `--kb-ground` | 页面底、内容区 |
| `--kb-side` | 侧栏 |
| `--kb-bar` | 顶栏 |
| `--kb-sunk` | 下沉面：代码块、输入框、表头、待写格 |

### 文字三级

`--kb-ink`（标题/强调）→ `--kb-ink2`（正文）→ `--kb-muted`（元信息）。
**只有三级，不要加第四级** —— 再细分只会让层级读不出来。

### 对比度实测

亮暗两套均已验证，数值为 WCAG 对比度：

| 用途 | 亮色 | 暗色 |
|---|---|---|
| `ink` / `ground` — 标题 | 17.85:1 AAA | 15.24:1 AAA |
| `ink2` / `ground` — 正文 | 7.65:1 AAA | 8.82:1 AAA |
| `muted` / `ground` — 元信息 11.5px | 5.39:1 AA | 4.80:1 AA |
| `muted` / `side` — 侧栏分组标签 | 4.97:1 AA | 4.55:1 AA |
| `accent` / `ground` — 小节标题、链接 | 6.05:1 AA | 6.87:1 AA |
| `accent-ink` / `sunk` — 行内 code | 8.74:1 AAA | 8.90:1 AAA |
| `accent` / `accent-bg` — 激活态 | 5.20:1 AA | 5.63:1 AA |
| `warn` / `warn-bg` — 待写标签 | 5.37:1 AA | 6.47:1 AA |

> `--kb-muted` 在亮色下曾取 `#78848C`，实测只有 3.83:1 —— 它被用在 11.5px
> 的元信息上，属于小字，需要 4.5:1。已改为 `#606C74`。
> **新增任何文字色都要过一遍这张表**，别凭观感定。

### 中性色的选取

`--kb-line` 系列不是纯灰，带轻微冷偏（偏向强调色的色相）。纯中性灰在成片的
hairline 网格里会显得没调过。

---

## 4. 排版

### 层级表

| 角色 | 字族 | 字号 | 字重 | 其他 |
|---|---|---|---|---|
| 页标题 `h1` | mono | 27px | 600 | `letter-spacing: -.02em`，下 `--kb-bd-rule` |
| 眉标 eyebrow | mono | 10.5px | 600 | 全大写，`ls .13em`，`--kb-accent` |
| 小节 `h2` | mono | 11px | 600 | 全大写，`ls .12em`，`--kb-accent`，下 `--kb-bd-line` |
| 三级 `h3` | sans | 14px | 600 | `--kb-ink` |
| 正文 | sans | 14px | 400 | `lh 1.72`，`--kb-ink2`，`max-width: 72ch` |
| 列表 | sans | 13.5px | 400 | `lh 1.7` |
| 表格单元格 | sans | 13.5px | 400 | |
| 表头 | mono | 10px | 600 | 全大写，`ls .1em`，`--kb-muted` |
| 元信息 meta | mono | 11.5px | 400 | `--kb-muted`，`tabular-nums` |
| 导航项 | mono | 12.5px | 400 | |
| 代码块 | mono | 12.5px | 400 | `lh 1.62` |

### 硬规则

- **正文测量上限 `72ch`**。表格和代码块不受此限，它们撑满容器
- **一切成列的数字加 `font-variant-numeric: tabular-nums`** —— 行数、计数、百分比、覆盖度。不加就会跳
- `h1` 加 `text-wrap: balance`
- 全大写的小字**必须**带字距（见令牌 `--kb-ls-*`），否则挤成一坨
- 中英混排时不要指望 Plex 渲染汉字，回退栈已在 `--kb-font-sans` / `--kb-font-mono` 里配好

---

## 5. 几何与间距

- **圆角 `0`**，无例外
- **无阴影**。层次靠表面色差和 1px 线，不靠投影
- 边框只有五种，全在令牌里：`--kb-bd-hair` / `--kb-bd-line` / `--kb-bd-th` / `--kb-bd-rule` / `--kb-bd-mark`
- 间距走 `--kb-sp-1..8` 阶梯，不写中间值
- **网格缝用 `gap: 1px` + 容器背景色实现**，不要给每个格子加边框 —— 那样相邻边会叠成 2px：

```css
.grid {
  display: grid;
  gap: 1px;
  background: var(--kb-line);   /* 缝的颜色 */
  border: var(--kb-bd-line);
}
.grid > * { background: var(--kb-ground); }
```

- 兄弟元素间距用 flex/grid 的 `gap`，不用逐个 `margin` —— margin 会塌陷或翻倍

---

## 6. 组件

### 6.1 侧栏 `.side`

宽 `--kb-w-sidebar`，底 `--kb-side`，右 `--kb-bd-line`，`position: sticky; top: 0`。

结构：站名块 → 全局入口（总目录 / 速查表）→ 按分区分组的条目。

分组标签：mono 10px 600 全大写 `ls .12em` `--kb-muted`，右侧贴 `已写/总数` 计数。

条目三态：

| 态 | 样式 |
|---|---|
| 默认（已写） | `--kb-ink2` |
| 悬停 | `--kb-accent` + 底 `--kb-accent-bg` |
| 激活 | `--kb-accent` + 600 + 底 `--kb-accent-bg` + 左 `--kb-bd-mark`，`padding-left` 减 2px 补偿 |
| 待写 | `--kb-muted` + `opacity .62` + `cursor: default`，**不可点，不悬停** |

> 待写条目留在导航里是刻意的 —— 目录同时是待办清单。见 `page-specs.md` §1。

### 6.2 顶栏 `.top`

`sticky`，底色必须显式为 `--kb-ground`（否则滚动内容透上来）。左面包屑，右搜索框，`margin-left: auto` 推开。

面包屑：mono 11.5px，分隔符 `/` 用 `--kb-line`，末节 `--kb-ink2` 且不可点。

### 6.3 搜索框

mono 12px，底 `--kb-sunk`，边 `--kb-bd-line`，**`border-radius: 0`**。
聚焦时边框转 `--kb-accent`、底转 `--kb-ground`，并 `outline: none`（边框已经是焦点指示）。
右侧内嵌 `/` 快捷键提示，`pointer-events: none`。

### 6.4 统计条 `.stats`

等宽网格，`gap: 1px` + `--kb-line` 背景。每格：数字 mono 22px 600 `tabular-nums` + 标签 11.5px `--kb-muted`。
数字可带语义色：`--kb-accent`（正向）、`--kb-warn`（欠账）。

### 6.5 覆盖度行 `.cov-r`

三栏 grid：`150px | 1fr | 62px` = 名称 / 进度条 / `已写/总数`。

进度条高 6px，槽 `--kb-sunk`，填充 `--kb-accent`，**无圆角**。
计数右对齐 `tabular-nums`，分子 `--kb-ink` 600、分母 `--kb-muted`。

### 6.6 条目格 `.cell`

`minmax(178px, 1fr)` 自动填充网格。命令名 mono 13px 600，说明 11.5px `--kb-muted`。
待写态：底 `--kb-sunk`，命令名转 `--kb-muted` 400，右上角贴 `待写` 标签。

### 6.7 表格

**三线表**，这是本方向的标志性组件：

- 表头下：`--kb-bd-th`（1.5px `--kb-ink`）
- 行间：`--kb-bd-hair`
- **无竖线，无斑马纹，无外框**
- 行悬停：底 `--kb-accent-bg`（仅可点击的行）
- 数字列：`text-align: right` + `tabular-nums`
- **必须包在 `overflow-x: auto` 容器里**，且给 `min-width`，否则窄屏会撑破页面

### 6.8 代码块

底 `--kb-sunk`，**左 `--kb-bd-mark`**（2px 强调色竖线），无圆角，`overflow-x: auto`。
高亮只用三档：`--kb-accent`（关键字/命令）、`--kb-warn`（字符串/参数）、`--kb-muted`（注释）。
不要引入完整的语法主题 —— 三档足够，且和整站配色是同一套。

### 6.9 行内 code

底 `--kb-sunk`，字 `--kb-accent-ink`，`padding: 1px 5px`，无圆角。

### 6.10 引用块

左 `--kb-bd-line`（**注意是中性线，不是强调线** —— 强调线是代码块的标志），
`padding-left: 12px`，13px `--kb-muted`。

### 6.11 状态标签 `.tag`

mono 10px 全大写 `ls .06em`，`padding: 1px 6px`，无圆角。
`已写` = `--kb-accent` / `--kb-accent-bg`；`待写` = `--kb-warn` / `--kb-warn-bg`。

### 6.12 页内目录 `.toc`

宽 `--kb-w-toc`，`sticky`。每项左 1px `--kb-line` 竖线；当前项转 `--kb-bd-mark` + `--kb-accent` 600，`padding-left` 减 1px 补偿。

### 6.13 上下篇 `.pager`

两栏，`gap: 1px` + `--kb-line` 背景。左标「← 上一篇」右标「下一篇 →」，标签 mono 10px 全大写 `--kb-muted`，名称 mono 13.5px 600 `--kb-accent`。
无上/下篇时保留空格子占位，**不要塌成一栏**。

---

## 7. 交互与状态

| 状态 | 表现 |
|---|---|
| 悬停（可点） | 底转 `--kb-accent-bg`，文字转 `--kb-accent` |
| 悬停（不可点） | **无变化**。待写条目不得有悬停反馈 |
| 键盘焦点 | `:focus-visible { outline: 2px solid var(--kb-accent); outline-offset: 2px }` |
| 激活/当前 | 左 `--kb-bd-mark` + 底 `--kb-accent-bg` + 600 |

键盘：

- `/` 聚焦搜索（焦点已在输入框时不拦截）
- `Esc` 清空搜索并失焦，若在搜索结果页则退回总目录

动效：默认无。若日后引入，必须包在 `@media (prefers-reduced-motion: reduce)` 的兜底里。

---

## 8. 响应式

单断点 **900px**。以上是三栏（侧栏 / 内容 / TOC），以下全部折叠为单栏：

- 侧栏转 `position: static`，移到内容上方，右边框改下边框
- TOC 转 `static`，跟在正文后
- 速查页 `columns` 降为 1
- 搜索框收窄至 170px

不做更细的断点。内容是文字和表格，多断点收益极低。

---

## 9. 无障碍

- 所有文字对比度过 §3 那张表，小字（< 14px）必须 ≥ 4.5:1
- 可点元素用 `<button>` / `<a>`，**不用 `<div onclick>`**
- 焦点态可见，不得 `outline: none` 而无替代指示
- 搜索框带 `aria-label`
- 状态不能只靠颜色 —— 「待写」同时有文字标签、灰化、不可点三重信号
- 表格用 `<thead>` / `<th>`，不用样式冒充表头

---

## 10. 禁止项

方向本身的约束，不是口味问题。要动其中任何一条，等于换设计方向。

- ❌ 圆角（`border-radius` 恒为 0）
- ❌ 阴影、渐变、毛玻璃
- ❌ 第二个强调色。`--kb-warn` 是状态色，不得用于装饰或强调
- ❌ emoji 作章节标记或图标
- ❌ 纯装饰的序号、横线、图形。结构装置必须编码真实信息
- ❌ 正文超过 `72ch`
- ❌ 裸表格（未包 `overflow-x` 容器）
- ❌ 组件里写死颜色 / 字号，绕过令牌
- ❌ 只定义在 `@media` 或 `[data-theme]` 里的颜色 —— 会导致「跟随系统」状态下取不到值

---

## 11. 落地到 Starlight

Starlight 的样式系统本身就是一组 CSS 变量，因此落地方式是**桥接**而非覆盖：
在自定义样式表里把 `--sl-*` 指向 `--kb-*`。

```css
@import "./tokens.css";

:root {
  --sl-color-bg:            var(--kb-ground);
  --sl-color-bg-sidebar:    var(--kb-side);
  --sl-color-bg-nav:        var(--kb-bar);
  --sl-color-bg-inline-code: var(--kb-sunk);
  --sl-color-text:          var(--kb-ink2);
  --sl-color-white:         var(--kb-ink);
  --sl-color-gray-3:        var(--kb-muted);
  --sl-color-hairline:      var(--kb-line);
  --sl-color-accent:        var(--kb-accent);
  --sl-color-accent-high:   var(--kb-accent-ink);
  --sl-color-accent-low:    var(--kb-accent-bg);
  --sl-font:                var(--kb-font-sans);
  --sl-font-mono:           var(--kb-font-mono);
  --sl-sidebar-width:       var(--kb-w-sidebar);
}
```

> ⚠️ 上面这组 `--sl-*` 变量名需要对着**实际安装的 Starlight 版本**核一遍再用 ——
> 变量名在大版本间调整过，照抄可能有对不上的。装好依赖后跑一次
> `rg -o '\-\-sl-[a-z0-9-]+' node_modules/@astrojs/starlight --no-filename | sort -u`
> 拿到准确清单。

Starlight 默认样式与本规范冲突、需要额外压掉的地方：

- 圆角 → 全局置 0
- 正文行高 → 收到 1.72
- 卡片/徽章组件 → 不使用，改用本规范的 `.cell` / `.tag`
- 代码块主题 → 换成 §6.8 的三档配色

总目录、分区页、速查页不走 Starlight 的文档布局，是自定义页面，直接使用本规范的组件。
