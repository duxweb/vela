import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const dist = join(root, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

await build({
  entryPoints: [
    join(root, 'src/index.ts'),
    join(root, 'src/schema.ts'),
  ],
  outbase: join(root, 'src'),
  outdir: dist,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  sourcemap: false,
  packages: 'external',
  logLevel: 'info',
})

await cp(join(root, 'src/components'), join(dist, 'components'), { recursive: true })
await cp(join(root, 'src/layouts'), join(dist, 'layouts'), { recursive: true })
await cp(join(root, 'src/routes'), join(dist, 'routes'), { recursive: true })
await cp(join(root, 'src/utils'), join(dist, 'utils'), { recursive: true })
await cp(join(root, 'src/styles'), join(dist, 'styles'), { recursive: true })
await cp(join(root, 'src/virtual.d.ts'), join(dist, 'virtual.d.ts'))
await writeFile(join(dist, 'package.json'), JSON.stringify({ type: 'module' }, null, 2))
