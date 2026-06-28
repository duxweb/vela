import { defineConfig } from 'astro/config'
import vela from '@duxweb/vela'

export default defineConfig({
  integrations: [
    vela({
      title: 'Single Locale Docs',
      defaultLocale: 'zh-cn',
      locales: {
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      nav: [
        { label: 'Docs', slug: '' },
        { label: 'Guide', slug: 'guide' },
      ],
      docs: {
        main: {
          match: '/',
          sidebar: [
            {
              label: 'Start',
              items: [
                { label: 'Overview', slug: '' },
                { label: 'Guide', slug: 'guide' },
              ],
            },
          ],
        },
      },
    }),
  ],
})
