export type VelaThemeColor = {
  accent?: string
  light?: string
  dark?: string
}

export function themeColorStyle(theme?: VelaThemeColor): string {
  if (!theme) return ''
  const accent = theme.accent || '#16a34a'
  const light = theme.light || accent
  const dark = theme.dark || accent
  const darkAccent = theme.dark || accent
  return `:root{--dux-accent:${accent};--dux-primary-bg:${accent};--vela-color-accent:${accent};--vela-color-accent-low:${mixHex(accent, '#ffffff', 0.82)};--vela-color-accent-high:${mixHex(accent, '#000000', 0.55)}}:root[data-theme="dark"]{--dux-accent:${darkAccent};--dux-primary-bg:${darkAccent};--vela-color-accent:${darkAccent};--vela-color-accent-low:${mixHex(darkAccent, '#000000', 0.72)};--vela-color-accent-high:${mixHex(darkAccent, '#ffffff', 0.72)}}meta[name="theme-color"]{color:${light}}@media(prefers-color-scheme:dark){meta[name="theme-color"]{color:${dark}}}`
}

export function mixHex(a: string, b: string, weight: number): string {
  const ca = parseHex(a)
  const cb = parseHex(b)
  if (!ca || !cb) return a
  const next = ca.map((channel, index) => Math.round(channel * (1 - weight) + cb[index] * weight))
  return `#${next.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function parseHex(hex: string): [number, number, number] | undefined {
  const clean = hex.trim().replace(/^#/, '')
  if (!/^[\da-f]{3}$|^[\da-f]{6}$/i.test(clean)) return undefined
  const value = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number]
}
