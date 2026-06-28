declare module 'virtual:vela/config' {
  const config: import('./index').VelaRuntimeConfig
  export default config
}

declare module 'virtual:vela/components' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

  export const Head: AstroComponentFactory
  export const Header: AstroComponentFactory
  export const Sidebar: AstroComponentFactory
  export const Pagination: AstroComponentFactory
  export const Hero: AstroComponentFactory
  export const Search: AstroComponentFactory
  export const VersionSelect: AstroComponentFactory
  export const EditPage: AstroComponentFactory
}

declare module 'virtual:vela/styles' {
  const styles: string
  export default styles
}
