import { defineConfig } from 'astro/config'
import vela from '@duxweb/vela'

export default defineConfig({
  integrations: [
    vela({
        title: 'Vela Example',
        description: 'A reusable documentation theme.',
        theme: {
          accent: '#0ea5e9',
          dark: '#38bdf8',
        },
        meta: {
          image: '/og.png',
          imageAlt: 'Vela documentation theme',
          keywords: ['astro', 'documentation theme'],
        },
        home: {
          eyebrow: 'Vela',
          badge: 'Reusable docs shell',
          title: 'Documentation that feels calm and direct',
          tagline: 'Share one polished docs shell across multiple projects while each project keeps control over its product content.',
          command: 'pnpm add @duxweb/vela',
          code: `vela({
  title: 'Project Docs',
  nav: [...],
  docs: {...},
})`,
          actions: [
            { text: 'Start Reading', slug: 'guide', variant: 'primary' },
            { text: 'View API', slug: 'api', variant: 'secondary' },
          ],
          features: [
            { label: 'Configurable navigation', description: 'Top navigation, dropdowns and multiple sidebar sections.', slug: 'guide' },
            { label: 'Theme color', description: 'Set accent and browser theme colors from one config.', slug: 'guide' },
            { label: 'Default homepage', description: 'A clean landing page is available without project CSS.', slug: '' },
          ],
        },
        nav: [
          {
            label: 'Docs',
            translations: { 'zh-CN': '文档' },
            items: [
              { label: 'Guide', translations: { 'zh-CN': '指南' }, slug: 'guide' },
              { label: 'API', slug: 'api' },
            ],
          },
          { label: 'GitHub', href: 'https://github.com/duxweb', external: true },
        ],
        social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/duxweb' }],
        versions: [{ label: 'v0.x', href: '/' }],
        editLink: 'https://github.com/duxweb/vela/edit/main/:path',
        defaultLocale: 'root',
        locales: {
          root: { label: 'English', lang: 'en' },
          'zh-cn': { label: '简体中文', lang: 'zh-CN' },
        },
        docs: {
          guide: {
            match: '/',
            sidebar: [
              {
                label: 'Start',
                translations: { 'zh-CN': '开始' },
                items: [
                  { label: 'Overview', translations: { 'zh-CN': '概览' }, slug: '' },
                  { label: 'Guide', translations: { 'zh-CN': '指南' }, slug: 'guide' },
                ],
              },
            ],
          },
          api: {
            match: '/api',
            sidebar: [
              {
                label: 'API',
                items: [
                  { label: 'Overview', slug: 'api' },
                  { label: 'Options', slug: 'api/options' },
                ],
              },
            ],
          },
        },
      }),
  ],
})
