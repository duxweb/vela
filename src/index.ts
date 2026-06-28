import mdx from '@astrojs/mdx'
import type { AstroIntegration } from 'astro'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isAbsolute, resolve } from 'node:path'

import type {
  VelaDocConfig,
  VelaDocsConfig,
  VelaNavItem,
  VelaSidebarItem,
} from './utils/navigation'
import type { VelaThemeColor } from './utils/color'
import type { VelaI18nMessages } from './utils/i18n'

export type {
  VelaDocConfig,
  VelaDocsConfig,
  VelaNavItem,
  VelaSidebarItem,
} from './utils/navigation'
export type { VelaThemeColor } from './utils/color'
export { velaDocsSchema, velaFrontmatterSchema } from './schema'

type ComponentPath = string

type VelaComponents = {
  Head?: ComponentPath
  Header?: ComponentPath
  Sidebar?: ComponentPath
  Pagination?: ComponentPath
  Hero?: ComponentPath
  Search?: ComponentPath
  VersionSelect?: ComponentPath
  EditPage?: ComponentPath
  [name: string]: ComponentPath | undefined
}

export type VelaMetaConfig = {
  image?: string
  imageAlt?: string
  keywords?: string[]
  twitter?: string
  themeColor?: string
}

export type VelaHomeAction = {
  text?: string
  label?: string
  translations?: Record<string, string>
  slug?: string
  href?: string
  link?: string
  variant?: 'primary' | 'secondary' | 'minimal' | string
}

export type VelaHomeFeature = {
  label: string
  translations?: Record<string, string>
  description?: string
  slug?: string
  href?: string
  link?: string
}

export type VelaHomeConfig = {
  eyebrow?: string
  badge?: string
  title?: string
  tagline?: string
  command?: string
  code?: string
  actions?: VelaHomeAction[]
  features?: VelaHomeFeature[]
}

export type VelaLocaleConfig = {
  label: string
  lang?: string
  dir?: 'ltr' | 'rtl'
}

export type VelaSocialLink = {
  icon?: string
  label: string
  href: string
}

export type VelaVersionItem = {
  label: string
  href: string
}

export type VelaSearchConfig =
  | boolean
  | {
      enabled?: boolean
      placeholder?: string
      translations?: Record<string, string>
    }

export type VelaEditLinkConfig =
  | string
  | {
      pattern: string
      label?: string
      translations?: Record<string, string>
    }

export type VelaI18nConfig = Record<string, Partial<VelaI18nMessages>>

export type VelaTableOfContentsConfig =
  | false
  | {
      minHeadingLevel?: number
      maxHeadingLevel?: number
    }

export type VelaMermaidConfig =
  | boolean
  | {
      enabled?: boolean
    }

export type VelaRuntimeConfig = {
  title: string
  description?: string
  favicon?: string
  nav: VelaNavItem[]
  docs?: VelaDocsConfig
  meta?: VelaMetaConfig
  theme?: VelaThemeColor
  home?: VelaHomeConfig
  social: VelaSocialLink[]
  versions: VelaVersionItem[]
  search: VelaSearchConfig
  editLink?: VelaEditLinkConfig
  i18n: VelaI18nConfig
  defaultLocale: string
  locales: Record<string, VelaLocaleConfig>
  tableOfContents: VelaTableOfContentsConfig
  mermaid: VelaMermaidConfig
}

export interface VelaOptions {
  title: string
  description?: string
  favicon?: string
  nav?: VelaNavItem[]
  docs?: VelaDocsConfig
  meta?: VelaMetaConfig
  theme?: VelaThemeColor
  home?: VelaHomeConfig
  social?: VelaSocialLink[]
  versions?: VelaVersionItem[]
  search?: VelaSearchConfig
  editLink?: VelaEditLinkConfig
  i18n?: VelaI18nConfig
  defaultLocale?: string
  locales?: Record<string, VelaLocaleConfig>
  tableOfContents?: VelaTableOfContentsConfig
  mermaid?: VelaMermaidConfig
  components?: VelaComponents
  customCss?: string[]
}

const virtualConfigId = 'virtual:vela/config'
const virtualComponentsId = 'virtual:vela/components'
const virtualStylesId = 'virtual:vela/styles'

const defaultComponents: Required<Pick<VelaComponents, 'Head' | 'Header' | 'Sidebar' | 'Pagination' | 'Hero' | 'Search' | 'VersionSelect' | 'EditPage'>> = {
  Head: fileURLToPath(new URL('./components/Head.astro', import.meta.url)),
  Header: fileURLToPath(new URL('./components/Header.astro', import.meta.url)),
  Sidebar: fileURLToPath(new URL('./components/Sidebar.astro', import.meta.url)),
  Pagination: fileURLToPath(new URL('./components/Pagination.astro', import.meta.url)),
  Hero: fileURLToPath(new URL('./components/Hero.astro', import.meta.url)),
  Search: fileURLToPath(new URL('./components/Search.astro', import.meta.url)),
  VersionSelect: fileURLToPath(new URL('./components/VersionSelect.astro', import.meta.url)),
  EditPage: fileURLToPath(new URL('./components/EditPage.astro', import.meta.url)),
}

export function vela(options: VelaOptions): AstroIntegration {
  const runtimeConfig: VelaRuntimeConfig = {
    title: options.title,
    description: options.description,
    favicon: options.favicon,
    nav: options.nav ?? [],
    docs: options.docs,
    meta: options.meta,
    theme: options.theme,
    home: options.home,
    social: options.social ?? [],
    versions: options.versions ?? [],
    search: options.search ?? true,
    editLink: options.editLink,
    i18n: options.i18n ?? {},
    defaultLocale: options.defaultLocale ?? 'root',
    locales: options.locales ?? {
      root: {
        label: 'English',
        lang: 'en',
      },
    },
    tableOfContents: options.tableOfContents ?? {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
    mermaid: options.mermaid ?? true,
  }

  return {
    name: '@duxweb/vela',
    hooks: {
      'astro:config:setup'({ config, injectRoute, updateConfig }) {
        const root = fileURLToPath(config.root)
        const components = resolveComponents(root, options.components)
        const styles = resolveStyles(root, options.customCss)

        injectRoute({
          pattern: '/[...slug]',
          entrypoint: fileURLToPath(new URL('./routes/docs.astro', import.meta.url)),
        })
        updateConfig({
          integrations: [mdx()],
          vite: {
            plugins: [virtualModules(runtimeConfig, components, styles)],
          },
        })
      },
    },
  }
}

function resolveComponents(root: string, components: VelaComponents | undefined): Required<Pick<VelaComponents, 'Head' | 'Header' | 'Sidebar' | 'Pagination' | 'Hero' | 'Search' | 'VersionSelect' | 'EditPage'>> {
  return {
    Head: resolvePath(root, components?.Head ?? defaultComponents.Head),
    Header: resolvePath(root, components?.Header ?? defaultComponents.Header),
    Sidebar: resolvePath(root, components?.Sidebar ?? defaultComponents.Sidebar),
    Pagination: resolvePath(root, components?.Pagination ?? defaultComponents.Pagination),
    Hero: resolvePath(root, components?.Hero ?? defaultComponents.Hero),
    Search: resolvePath(root, components?.Search ?? defaultComponents.Search),
    VersionSelect: resolvePath(root, components?.VersionSelect ?? defaultComponents.VersionSelect),
    EditPage: resolvePath(root, components?.EditPage ?? defaultComponents.EditPage),
  }
}

function resolveStyles(root: string, styles: string[] | undefined): string[] {
  return [
    fileURLToPath(new URL('./styles/custom.css', import.meta.url)),
    ...(styles ?? []).map((style) => resolvePath(root, style)),
  ]
}

function resolvePath(root: string, path: string): string {
  if (path.startsWith('@') || path.startsWith('virtual:')) return path
  if (isAbsolute(path)) return path
  return resolve(root, path)
}

function virtualModules(
  config: VelaRuntimeConfig,
  components: Required<Pick<VelaComponents, 'Head' | 'Header' | 'Sidebar' | 'Pagination' | 'Hero' | 'Search' | 'VersionSelect' | 'EditPage'>>,
  styles: string[],
) {
  const resolvedConfigId = `\0${virtualConfigId}`
  const resolvedComponentsId = `\0${virtualComponentsId}`
  const resolvedStylesId = `\0${virtualStylesId}`

  return {
    name: '@duxweb/vela/virtual-modules',
    resolveId(id: string) {
      if (id === virtualConfigId) return resolvedConfigId
      if (id === virtualComponentsId) return resolvedComponentsId
      if (id === virtualStylesId) return resolvedStylesId
      return undefined
    },
    load(id: string) {
      if (id === resolvedConfigId) return `export default ${JSON.stringify(config)}`
      if (id === resolvedComponentsId) {
        return Object.entries(components)
          .map(([name, path]) => `export { default as ${name} } from ${JSON.stringify(normalizeImportPath(path))}`)
          .join('\n')
      }
      if (id === resolvedStylesId) {
        const css = styles.map((style) => readFileSync(style, 'utf8')).join('\n')
        return `export default ${JSON.stringify(css)}`
      }
      return undefined
    },
  }
}

function normalizeImportPath(path: string): string {
  if (path.startsWith('@') || path.startsWith('virtual:')) return path
  return path.replaceAll('\\', '/')
}

export default vela
