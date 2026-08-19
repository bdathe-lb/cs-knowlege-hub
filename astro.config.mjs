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
 * 后续可通过覆盖 Sidebar 组件补上，见 docs/page-specs.md §6。
 */
const sidebar = [
  { label: '总目录', link: '/' },
  { label: '速查表', link: '/cheatsheet/' },
  { label: '搜索', link: '/search/' },
  ...kb.cats
    .map((c) => {
      const written = c.tools.filter((t) => t.path);
      // 速查页不在内容集合里（slug 为 null），不进侧栏分组
      const items = written.filter((t) => t.slug);
      return {
        label: `${c.name} · ${written.length}/${c.tools.length}`,
        items: items.map((t) => ({ label: t.name, slug: t.slug })),
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
