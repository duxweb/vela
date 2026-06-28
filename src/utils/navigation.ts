export type VelaTranslated = {
  label?: string
  translations?: Record<string, string>
}

export type VelaNavItem = VelaTranslated & {
  label: string
  slug?: string
  href?: string
  external?: boolean
  items?: VelaNavItem[]
}

export type VelaSidebarItem =
  | string
  | VelaSidebarLink
  | VelaSidebarGroup
  | VelaResolvedSidebarLink
  | VelaResolvedSidebarGroup

export type VelaSidebarLink = VelaTranslated & {
  slug?: string
  link?: string
  href?: string
  external?: boolean
  attrs?: Record<string, string | number | boolean | null | undefined>
}

export type VelaSidebarGroup = VelaTranslated & {
  label: string
  items: VelaSidebarItem[]
  collapsed?: boolean
}

export type VelaResolvedSidebarLink = {
  type: 'link'
  label: string
  href: string
  isCurrent?: boolean
  attrs?: Record<string, string | number | boolean | null | undefined>
}

export type VelaResolvedSidebarGroup = {
  type: 'group'
  label: string
  entries: VelaSidebarItem[]
  collapsed?: boolean
}

export type VelaSidebarEntry = {
  type: 'link' | 'group'
  label: string
  href?: string
  attrs?: Record<string, string | number | boolean | null | undefined>
  isCurrent?: boolean
  entries?: VelaSidebarEntry[]
  collapsed?: boolean
}

export type VelaDocConfig = {
  label?: string
  match: string | string[]
  sidebar: VelaSidebarItem[]
}

export type VelaDocsConfig = Record<string, VelaDocConfig>

export type VelaLocaleContext = {
  base: string
  currentPath: string
  locale?: string
  defaultLocale?: string
  lang?: string
}

export function normalizePath(path: string): string {
  if (!path) return '/'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized
}

export function stripBase(pathname: string, base: string): string {
  const normalizedBase = normalizePath(base || '/')
  if (normalizedBase !== '/' && pathname.startsWith(`${normalizedBase}/`)) {
    return pathname.slice(normalizedBase.length) || '/'
  }
  if (normalizedBase !== '/' && pathname === normalizedBase) return '/'
  return pathname || '/'
}

export function stripLocale(pathname: string, locale?: string, defaultLocale?: string): string {
  if (!locale || locale === defaultLocale) return normalizePath(pathname)
  const prefix = `/${locale}`
  if (pathname === prefix) return '/'
  if (pathname.startsWith(`${prefix}/`)) return normalizePath(pathname.slice(prefix.length) || '/')
  return normalizePath(pathname)
}

export function contentPath(ctx: VelaLocaleContext): string {
  return stripLocale(stripBase(ctx.currentPath, ctx.base), ctx.locale, ctx.defaultLocale)
}

export function labelFor(item: VelaTranslated, ctx: VelaLocaleContext): string {
  return (ctx.lang && item.translations?.[ctx.lang]) || (ctx.locale && item.translations?.[ctx.locale]) || item.label || ''
}

export function isExternalHref(href: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')
}

export function localizedSlug(slug: string, ctx: VelaLocaleContext): string {
  const cleanSlug = slug.replace(/^\//, '').replace(/\/$/, '')
  const localePrefix = ctx.locale && ctx.locale !== ctx.defaultLocale ? `/${ctx.locale}` : ''
  const path = cleanSlug ? `/${cleanSlug}` : '/'
  return joinUrl(ctx.base, localePrefix, path)
}

export function hrefForLink(item: { slug?: string; href?: string; link?: string }, ctx: VelaLocaleContext): string {
  if (item.href) return item.href
  if (item.slug !== undefined) return localizedSlug(item.slug, ctx)
  if (item.link) {
    if (isExternalHref(item.link)) return item.link
    const clean = item.link.replace(/^\//, '')
    return localizedSlug(clean, ctx)
  }
  return localizedSlug('', ctx)
}

export function isActiveHref(href: string, currentPath: string, exact = false): boolean {
  if (isExternalHref(href)) return false
  const current = normalizePath(currentPath)
  const target = normalizePath(href)
  if (exact) return current === target
  return current === target || (target !== '/' && current.startsWith(`${target}/`))
}

export function isCurrentHref(href: string, currentPath: string): boolean {
  if (isExternalHref(href)) return false
  return normalizePath(currentPath) === normalizePath(href)
}

export function selectDoc(docs: VelaDocsConfig | undefined, ctx: VelaLocaleContext): VelaDocConfig | undefined {
  if (!docs) return undefined
  const path = contentPath(ctx)
  let selected: { doc: VelaDocConfig; length: number } | undefined
  for (const doc of Object.values(docs)) {
    const matches = Array.isArray(doc.match) ? doc.match : [doc.match]
    for (const match of matches) {
      const normalized = normalizePath(match)
      const matched = normalized === '/' ? true : path === normalized || path.startsWith(`${normalized}/`)
      if (matched && (!selected || normalized.length > selected.length)) {
        selected = { doc, length: normalized.length }
      }
    }
  }
  return selected?.doc
}

export function resolveSidebarItems(items: VelaSidebarItem[], ctx: VelaLocaleContext): VelaSidebarEntry[] {
  return items.flatMap((item) => resolveSidebarItem(item, ctx))
}

export function flattenSidebarEntries(entries: VelaSidebarEntry[]): VelaSidebarEntry[] {
  return entries.flatMap((entry) => (entry.type === 'group' ? flattenSidebarEntries(entry.entries ?? []) : [entry]))
}

function resolveSidebarItem(item: VelaSidebarItem, ctx: VelaLocaleContext): VelaSidebarEntry[] {
  if (typeof item === 'string') {
    const label = titleFromSlug(item)
    const href = localizedSlug(item, ctx)
    return [{ type: 'link', label, href, isCurrent: isCurrentHref(href, ctx.currentPath), attrs: {} }]
  }

  if ('type' in item && item.type === 'link') {
    return [
      {
        type: 'link',
        label: item.label,
        href: item.href,
        attrs: item.attrs ?? {},
        isCurrent: item.isCurrent ?? isCurrentHref(item.href, ctx.currentPath),
      },
    ]
  }

  if ('type' in item && item.type === 'group') {
    return [
      {
        type: 'group',
        label: item.label,
        entries: resolveSidebarItems(item.entries ?? [], ctx),
        collapsed: item.collapsed,
      },
    ]
  }

  if ('items' in item) {
    return [
      {
        type: 'group',
        label: labelFor(item, ctx),
        entries: resolveSidebarItems(item.items ?? [], ctx),
        collapsed: item.collapsed,
      },
    ]
  }

  if ('autogenerate' in item) return []

  const href = hrefForLink(item, ctx)
  return [
    {
      type: 'link',
      label: labelFor(item, ctx) || titleFromSlug(item.slug || item.link || item.href || ''),
      href,
      attrs: item.attrs ?? {},
      isCurrent: isCurrentHref(href, ctx.currentPath),
    },
  ]
}

function titleFromSlug(slug: string): string {
  const clean = slug.replace(/^\//, '').replace(/\/$/, '')
  const last = clean.split('/').filter(Boolean).pop() || 'Overview'
  return last
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function joinUrl(...parts: string[]): string {
  const [first = '', ...rest] = parts
  const prefix = first.replace(/\/$/, '')
  const suffix = rest
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
  const joined = `${prefix}${suffix.startsWith('/') ? suffix : `/${suffix}`}`
  return joined === '' ? '/' : joined.replace(':/', '://')
}
