import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  // src/content/docs/ 的内容由 scripts/sync.mjs 从 knowledge-hub 生成，
  // 不要手工编辑 —— 每次 sync 会整个重建。
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),

  // Starlight 自带的界面文案覆盖。目前只为改 404 那句的收尾句号
  // （page-specs.md §7「界面文案不以句号收尾」）。手写，不由 sync 生成。
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
