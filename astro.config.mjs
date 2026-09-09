import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// 由 scripts/sync.mjs 生成，dev / build 前自动运行
const kb = JSON.parse(fs.readFileSync(new URL('./src/data/kb.json', import.meta.url), 'utf8'));

/**
 * 侧栏由索引数据生成，不手工维护。
 * 分组标签带 已写/总数 计数 —— 结构装置要编码真实信息（设计规范 §2 原则二）。
 *
 * 已知偏差：待写条目不在此列出。Starlight 的侧栏项必须是可跳转链接，
 * 无法渲染「灰化不可点」态。全部 58 个条目（含待写）见总目录页。
 * 后续可通过覆盖 Sidebar 组件补上，见 docs/page-specs.md §7。
 */
const sidebar = [
  { label: '总目录', link: '/' },
  { label: '速查表', link: '/cheatsheet/' },
  { label: '搜索', link: '/search/' },
  ...kb.cats
    .map((c) => {
      const written = c.tools.filter((t) => t.path);
      return {
        label: `${c.name} · ${written.length}/${c.tools.length}`,
        // 速查页有自己的路由，不在内容集合里（slug 为 null），但它确实是这个分区里
        // 已写的一条 —— 按 url 挂上去。漏掉它，标签的 6/6 下面就只有 5 项，
        // 数和条目对不上（设计规范 §2 原则二：结构装置必须编码真实信息）。
        items: written.map((t) =>
          t.slug ? { label: t.name, slug: t.slug } : { label: t.name, link: t.url }
        ),
      };
    })
    .filter((g) => g.items.length > 0),
];

export default defineConfig({
  integrations: [
    starlight({
      title: 'knowledge-hub',
      description: 'Linux 工具与计算机基础笔记',
      defaultLocale: 'root',
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      sidebar,
      customCss: ['./src/styles/tokens.css', './src/styles/theme.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
          },
        },
      ],
      pagination: true,
      lastUpdated: false,
      credits: false,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    }),
  ],
});
