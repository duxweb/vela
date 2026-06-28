import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { velaDocsSchema } from '@duxweb/vela/schema'

export const collections = {
  docs: defineCollection({
    loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
    schema: velaDocsSchema,
  }),
}
