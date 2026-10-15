# knowledge-hub-web

[`~/projects/knowledge-hub`](../knowledge-hub) 的 Web 前端 —— 把那批 Markdown 笔记
编译成一个带全文搜索的静态站点。

笔记本身仍然是唯一真源，**本项目不修改任何 `.md` 文件**，只读取它们。

## 现状

站点已跑通。Astro 7 + Starlight 0.41，Pagefind 中文全文搜索。
源仓库的笔记全部覆盖，当前的笔记数、行数、待写条目数跑 `make sync` 查看 ——
这些数字随笔记增减变化，不在这里写死。

```bash
make             # 列出所有目标
make dev         # http://localhost:4321
make build       # → dist/
make preview     # 构建后预览 —— 全文搜索只有这里能用
make deploy      # 构建并同步到 https://cs.bdathe.wiki
make clean       # 删掉同步产物与构建产物
```

`dev` / `build` 会先自动执行同步。npm 脚本原样保留（`npm run dev` 等都还能用），
Makefile 只是个入口，另外补上了 npm 脚本没做的两件事：清理生成物，
以及 `preview` 之前自动 build。

源仓库默认在 `../knowledge-hub`，换位置加一个变量即可：

```bash
make build KB_SOURCE=/path/to/knowledge-hub
```

### 构建流程

```
~/projects/knowledge-hub/          源仓库（只读，唯一真源）
        │
        ├─ linux-tools/README.md ──┐  索引表 → 分区 / 条目 / 待写状态
        ├─ **/*.md ────────────────┤  笔记正文
        └─ assets/ ────────────────┤  图片
                                   ▼
                          scripts/sync.mjs
                                   │
            ┌──────────────────────┼──────────────────────┐
            ▼                      ▼                      ▼
   src/content/docs/**      src/data/kb.json       public/assets/
   （注入 frontmatter）     （条目 / 速查表）        （图片）
            │                      │
            └──────────┬───────────┘
                       ▼
                 Astro + Starlight
                       ▼
                     dist/
```

源笔记没有 frontmatter，而 Starlight 的 `title` 是必填字段 ——
`sync.mjs` 把每篇的 `# 一级标题` 提升为 `title` 并从正文剥离（避免渲染出两个 h1），
同时重写图片路径和笔记间的 `.md` 链接。

### 已知偏差

侧栏只列已写笔记，不列待写条目 —— Starlight 的侧栏项必须是可跳转链接，
无法渲染「灰化不可点」态。目前没有待写条目，这条暂不可见；
以后索引表再出现待写项，它们只会出现在总目录页。
补齐需覆盖 Sidebar 组件，见 `docs/page-specs.md` §7。

### 设计方向

**技术规格书（Spec Sheet）** —— 直角、发丝线、等宽标题、密度优先。
令牌通过 `--sl-*` → `--kb-*` 桥接进 Starlight，见 `docs/design-system.md` §11。

## 文档

| 文件 | 内容 |
|---|---|
| [`docs/design-system.md`](docs/design-system.md) | 设计规范：原则、颜色、排版、组件、交互、禁止项 |
| [`docs/tokens.css`](docs/tokens.css) | 设计令牌，样式的唯一真源 |
| [`docs/page-specs.md`](docs/page-specs.md) | 五种页面的布局与内容规则 |

交互原型（含真实数据）：https://claude.ai/code/artifact/0e9ee5a4-a6df-405e-b418-b21bb7458bd0

## 为什么是这个方向

判断依据来自内容成分，不是观感偏好。下表是做这个决定时的快照，之后不再随笔记更新：

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
