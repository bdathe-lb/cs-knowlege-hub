/**
 * 从 knowledge-hub 同步笔记到 Astro 内容集合，并派生站点数据。
 *
 * 源仓库是唯一真源，本脚本只读，绝不写回。
 * 每次 dev / build 前自动运行（见 package.json scripts）。
 *
 * 做四件事：
 *   1. 解析 linux-tools/README.md 的索引表 → 分区 / 条目 / 待写状态
 *   2. 为每篇笔记注入 frontmatter（Starlight 要求 title 必填，源笔记没有 frontmatter）
 *   3. 重写笔记间的 .md 链接和图片路径
 *   4. 输出 src/data/kb.json 供总目录、分区页和侧栏使用
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.KB_SOURCE ?? path.resolve(ROOT, '../knowledge-hub');
const OUT_DOCS = path.join(ROOT, 'src/content/docs');
const OUT_DATA = path.join(ROOT, 'src/data');
const OUT_ASSETS = path.join(ROOT, 'public/assets');
const OUT_CHEAT = path.join(ROOT, 'src/cheatsheets');

/**
 * 速查类笔记 —— 需要分栏密排版式，不走文档页（docs/page-specs.md §5）。
 * 这些不进内容集合，改为输出到 src/cheatsheets/ 由自定义页面渲染，
 * 避免同一篇笔记产生两个 URL。
 */
const CHEATSHEETS = new Map([['cs-basics/cheatsheet/linux-cheatsheet.md', '/cheatsheet/']]);

/** cs-basics 没有索引表，在这里声明。新增笔记时补一行。 */
const CS_BASICS = [
  ['glob', '路径名展开（通配符）', 'cs-basics/shell/glob.md'],
  ['regex', '正则表达式', 'cs-basics/shell/regex.md'],
  ['stdio', '标准 IO 与重定向', 'cs-basics/shell/stdio.md'],
  ['terminal-colors', '终端颜色与 ANSI 转义', 'cs-basics/shell/terminal-colors.md'],
  ['socket', 'Linux 网络编程', 'cs-basics/network/linux-network-programming.md'],
  ['cheatsheet', '常用操作速查', 'cs-basics/cheatsheet/linux-cheatsheet.md'],
];

if (!fs.existsSync(SRC)) {
  console.error(`✗ 找不到源仓库：${SRC}\n  用 KB_SOURCE=/path/to/knowledge-hub 指定其他位置。`);
  process.exit(1);
}

/* ── 1. 解析索引表 ──────────────────────────────────────────────── */
function parseIndex() {
  const file = path.join(SRC, 'linux-tools/README.md');
  const cats = [];
  let cur = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('## ')) {
      cur = { name: line.slice(3).trim(), tools: [] };
      cats.push(cur);
    } else if (cur && line.startsWith('| `')) {
      const c = line.replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
      if (c.length < 3 || c[0].startsWith('---')) continue;
      const m = c[2].match(/\(([^)]+\.md)\)/);
      cur.tools.push({
        name: c[0].replace(/`/g, ''),
        desc: c[1],
        path: m ? `linux-tools/${m[1]}` : null,
      });
    }
  }
  cats.push({
    name: '计算机基础',
    slug: 'cs-basics', // 该分区横跨多个子目录，不能从首篇笔记的目录派生
    tools: CS_BASICS.map(([name, desc, p]) => ({ name, desc, path: p })),
  });
  return cats;
}

/* ── 2. 笔记 → URL ─────────────────────────────────────────────── */
const toUrl = (p) => '/' + p.replace(/\.md$/, '') + '/';
const toSlug = (p) => p.replace(/\.md$/, '');

/* ── 3. 读取并改写一篇笔记 ──────────────────────────────────────── */
function transform(relPath) {
  const raw = fs.readFileSync(path.join(SRC, relPath), 'utf8');
  const lines = raw.split('\n');

  // h1 提升为 frontmatter title，正文里删掉，避免渲染出两个 h1
  const h1Idx = lines.findIndex((l) => l.startsWith('# '));
  const title = h1Idx >= 0 ? lines[h1Idx].slice(2).trim() : path.basename(relPath, '.md');
  if (h1Idx >= 0) lines.splice(h1Idx, 1);

  const heads = lines.filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());

  // 简介：第一个 ## 之后的首个非空、非标题行
  let intro = '';
  let seen = false;
  for (const l of lines) {
    if (l.startsWith('## ')) { seen = true; continue; }
    if (seen && l.trim() && !l.startsWith('#')) { intro = l.trim(); break; }
  }

  let body = lines.join('\n').replace(/^\n+/, '');

  // 图片：../../assets/x.png → /assets/x.png（资源统一放 public/）
  body = body.replace(/(!\[[^\]]*\]\()([^)]*?\/)?assets\/([^)]+)\)/g, '$1/assets/$3)');

  // 笔记间链接：相对 .md → 站内 URL。跳过外链和锚点。
  const dir = path.dirname(relPath);
  body = body.replace(/(?<!!)\[([^\]]+)\]\(([^)]+\.md)(#[^)]*)?\)/g, (m, text, href, hash) => {
    if (/^(https?:|\/)/.test(href)) return m;
    const target = path.normalize(path.join(dir, href));
    return `[${text}](${toUrl(target)}${hash ?? ''})`;
  });

  const esc = (s) => s.replace(/"/g, '\\"');
  const fm = [
    '---',
    `title: "${esc(title)}"`,
    intro ? `description: "${esc(intro.replace(/[*`]/g, '').slice(0, 150))}"` : null,
    '---',
  ].filter((l) => l !== null).join('\n');

  return {
    title,
    heads,
    intro,
    lines: raw.split('\n').filter((_, i, a) => i < a.length - 1 || a[i] !== '').length,
    content: `${fm}\n\n${body}`,
  };
}

/* ── 4. 执行 ───────────────────────────────────────────────────── */
fs.rmSync(OUT_DOCS, { recursive: true, force: true });
fs.rmSync(OUT_CHEAT, { recursive: true, force: true });
fs.mkdirSync(OUT_DOCS, { recursive: true });
fs.mkdirSync(OUT_CHEAT, { recursive: true });
fs.mkdirSync(OUT_DATA, { recursive: true });

const cats = parseIndex();
const docs = {};
let written = 0;

for (const cat of cats) {
  for (const tool of cat.tools) {
    if (!tool.path) continue;
    const abs = path.join(SRC, tool.path);
    if (!fs.existsSync(abs)) {
      console.warn(`  ⚠ 索引里有但文件不存在，跳过：${tool.path}`);
      tool.path = null;
      continue;
    }
    const d = transform(tool.path);
    const cheatUrl = CHEATSHEETS.get(tool.path);

    if (cheatUrl) {
      // 速查页：出到 src/cheatsheets/，不进内容集合，由自定义页面渲染
      const dest = path.join(OUT_CHEAT, path.basename(tool.path));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, d.content);
      tool.slug = null; // 无内容集合条目，不进 Starlight 侧栏
      tool.url = cheatUrl;
    } else {
      const dest = path.join(OUT_DOCS, tool.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, d.content);
      tool.slug = toSlug(tool.path);
      tool.url = toUrl(tool.path);
    }

    docs[tool.path] = { h1: d.title, heads: d.heads, intro: d.intro, lines: d.lines, url: tool.url };
    written++;
  }
}

// 资源
fs.rmSync(OUT_ASSETS, { recursive: true, force: true });
const srcAssets = path.join(SRC, 'assets');
if (fs.existsSync(srcAssets)) {
  fs.cpSync(srcAssets, OUT_ASSETS, { recursive: true });
}

// 分区 URL slug：从该分区首篇笔记的目录名派生（如 02-text-processing），
// 避免中文分区名进 URL 被百分号编码。无笔记的分区回退到序号。
cats.forEach((c, i) => {
  if (c.slug) return; // 已显式声明的不覆盖
  const first = c.tools.find((t) => t.path);
  c.slug = first ? path.basename(path.dirname(first.path)) : `c${i}`;
});

// 派生数据
const all = cats.flatMap((c) => c.tools.map((t) => ({ ...t, cat: c.name, catSlug: c.slug })));
const kb = {
  cats,
  docs,
  stats: {
    cats: cats.length,
    tools: all.length,
    written,
    todo: all.length - written,
    lines: Object.values(docs).reduce((s, d) => s + d.lines, 0),
    generated: new Date().toISOString(),
  },
};
fs.writeFileSync(path.join(OUT_DATA, 'kb.json'), JSON.stringify(kb, null, 2));

const { stats } = kb;
console.log(
  `✓ 同步完成  ${stats.written} 篇笔记 · ${stats.lines.toLocaleString()} 行 · ` +
  `${stats.cats} 个分区 · ${stats.tools} 个条目（${stats.todo} 个待写）`
);
