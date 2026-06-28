import config from 'virtual:vela/config'
import { normalizePath } from './navigation'

const baseUrl = ((import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/')

export type VelaDocEntry = {
  id: string
  body?: string
  filePath?: string
  data: Record<string, any>
}

export type VelaRouteContext = {
  slug: string
  locale: string
  lang: string
  dir: 'ltr' | 'rtl'
  contentPath: string
}

export function entrySlug(entry: VelaDocEntry): string {
  return normalizeSlug(entry.id)
}

export function entryPath(entry: VelaDocEntry): string {
  const slug = entrySlug(entry)
  if (slug === 'index') return ''
  if (slug.endsWith('/index')) return slug.slice(0, -'/index'.length)
  return slug
}

export function routePathFromEntry(entry: VelaDocEntry): string {
  return entryPath(entry)
}

export function currentRouteContext(pathname: string): VelaRouteContext {
  const base = normalizePath(baseUrl)
  const withoutBase = stripBase(pathname, base)
  const slug = normalizeSlug(withoutBase)
  const locale = localeFromSlug(slug)
  const localeConfig = config.locales[locale] ?? config.locales[config.defaultLocale]
  const contentPath = stripLocaleSlug(slug, locale)

  return {
    slug,
    locale,
    lang: localeConfig?.lang ?? locale,
    dir: localeConfig?.dir ?? 'ltr',
    contentPath,
  }
}

export function localeFromSlug(slug: string): string {
  const first = slug.split('/').filter(Boolean)[0]
  if (first && first in config.locales && first !== config.defaultLocale) return first
  return config.defaultLocale
}

export function stripLocaleSlug(slug: string, locale: string): string {
  if (!slug || locale === config.defaultLocale) return slug
  if (slug === locale) return ''
  if (slug.startsWith(`${locale}/`)) return slug.slice(locale.length + 1)
  return slug
}

export function alternateUrlForLocale(currentSlug: string, locale: string): string {
  const currentLocale = localeFromSlug(currentSlug)
  const content = stripLocaleSlug(currentSlug, currentLocale)
  const next = locale === config.defaultLocale ? content : [locale, content].filter(Boolean).join('/')
  return localizedUrl(next)
}

export function localizedUrl(slug: string): string {
  const clean = normalizeSlug(slug)
  const base = baseUrl
  const prefix = base === '/' ? '' : base.replace(/\/+$/, '')
  return clean ? `${prefix}/${clean}/` : `${prefix ? `${prefix}/` : '/'}`
}

export function assetUrl(path: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) return path
  const base = baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '')
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${base}${clean}` || '/'
}

export function stripLocaleFromContentPath(contentPath: string, locale: string): string {
  return stripLocaleSlug(contentPath, locale)
}

export function canonicalUrl(pathname: string, site?: URL): string | undefined {
  if (!site) return undefined
  return new URL(pathname, site).toString()
}

export function shouldRenderHero(entry: VelaDocEntry, contentPath: string): boolean {
  return contentPath === '' || contentPath === 'index' || Boolean(entry.data.hero)
}

export function normalizeSlug(value: string | undefined): string {
  return (value ?? '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function stripBase(pathname: string, base: string): string {
  const cleanBase = normalizePath(base)
  if (cleanBase !== '/' && pathname === cleanBase) return ''
  if (cleanBase !== '/' && pathname.startsWith(`${cleanBase}/`)) {
    return normalizeSlug(pathname.slice(cleanBase.length))
  }
  return normalizeSlug(pathname)
}
