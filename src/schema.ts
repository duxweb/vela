import { z } from 'astro/zod'

const localizedString = z.union([z.string(), z.record(z.string(), z.string())])

export const velaFrontmatterSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    editUrl: z.string().optional(),
    updated: z.union([z.string(), z.date()]).optional(),
    lastUpdated: z.union([z.string(), z.date()]).optional(),
    draft: z.boolean().optional(),
    template: z.string().optional(),
    prev: z.union([z.boolean(), z.string(), z.object({ label: z.string().optional(), link: z.string().optional() })]).optional(),
    next: z.union([z.boolean(), z.string(), z.object({ label: z.string().optional(), link: z.string().optional() })]).optional(),
    hero: z
      .object({
        title: z.string().optional(),
        tagline: z.string().optional(),
        actions: z
          .array(
            z
              .object({
                text: z.string().optional(),
                label: z.string().optional(),
                link: z.string().optional(),
                href: z.string().optional(),
                slug: z.string().optional(),
                variant: z.string().optional(),
                attrs: z.record(z.string(), z.unknown()).optional(),
              })
              .passthrough(),
          )
          .optional(),
      })
      .passthrough()
      .optional(),
    home: z.record(z.string(), z.unknown()).optional(),
    sidebar: z
      .object({
        label: localizedString.optional(),
        order: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

export const velaDocsSchema = velaFrontmatterSchema
