import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  // src/content/docs/ 的内容由 scripts/sync.mjs 从 knowledge-hub 生成，
  // 不要手工编辑 —— 每次 sync 会整个重建。
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
