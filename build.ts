import process from 'node:process'
import { dts } from 'bun-plugin-dtsx'

console.log('Building...')

// await $`rm -rf ./dist`

const result = await Bun.build({
  entrypoints: ['./packages/vite-plugin-layouts/src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  minify: true,
  // splitting: true,
  plugins: [
    dts({
      root: './packages/vite-plugin-layouts',
    }),
  ],
})

if (!result.success) {
  console.error('Build failed')

  for (const message of result.logs) {
    // Bun will pretty print the message object
    console.error(message)
  }

  process.exit(1)
}

console.log('Build complete')
