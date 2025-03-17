<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# vite-plugin-layouts

> Router based layouts for Vue 3 applications using Vite.

## Features

- 📁 **File Based** _Layouts are stored in `/src/layouts` as standard Vue components_
- 🔄 **Sensible Defaults** _Pages without a layout use `default.vue` automatically_
- 🌐 **Multiple Layouts** _Support for multiple layout directories_
- 🎨 **Meta Configuration** _Specify layouts via route blocks in your pages_
- 🔌 **Router Integration** _Pairs with `unplugin-vue-router`_
- 📱 **HMR Optimized** _Client-side layout mode for faster HMR_
- 🛠️ **Flexible Configuration** _Customize layout directories, exclusions, and more_

## Install

```bash
npm install -D vite-plugin-layouts
# or
yarn add -D vite-plugin-layouts
# or
pnpm add -D vite-plugin-layouts
# or
bun add -D vite-plugin-layouts
```

## Get Started

```ts
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Layouts from 'vite-plugin-layouts'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    Vue(),
    Pages(),
    Layouts()
  ]
})
```

Then in your main.ts file:

```ts
// main.ts
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter } from 'vue-router'
import generatedRoutes from '~pages'

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  // ...
  routes,
})
```

If you're using `unplugin-vue-router`:

```ts
// main.ts
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter } from 'vue-router/auto'

const router = createRouter({
  // ...
  extendRoutes: routes => setupLayouts(routes),
})
```

### TypeScript Support

If you want type definition for the virtual modules, add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-layouts/client"]
  }
}
```

## Usage

Layouts are stored in the `/src/layouts` folder by default and are standard Vue components with a `<router-view></router-view>` in the template.

You can specify which layout to use for a page by using a route block:

```vue
<route lang="yaml">
meta:
  layout: users
</route>
```

This will look for `/src/layouts/users.vue` for the page's layout. If no layout is specified, it will use `default.vue`.

## Configuration

```ts
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Layouts from 'vite-plugin-layouts'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    Vue(),
    Pages(),
    Layouts({
      layoutsDirs: 'src/layouts', // default: 'src/layouts'
      pagesDirs: 'src/pages', // default: 'src/pages'
      defaultLayout: 'default', // default: 'default'
      exclude: [], // Patterns to exclude from layout loading
    })
  ]
})
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `layoutsDirs` | `string \| string[]` | `'src/layouts'` | Path(s) to the layouts directory. Supports globs. |
| `pagesDirs` | `string \| string[] \| null` | `'src/pages'` | Path(s) to the pages directory. Set to null to watch all files. |
| `defaultLayout` | `string` | `'default'` | Name of the default layout to use when none is specified. |
| `exclude` | `string[]` | `[]` | Patterns to exclude from layout loading. Files named `__*__.vue` are automatically excluded. |

### Advanced Configuration: ClientSideLayout

For faster HMR and more efficient loading, you can use the ClientSideLayout mode:

```ts
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { ClientSideLayout } from 'vite-plugin-layouts'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    Vue(),
    Pages(),
    ClientSideLayout({
      layoutsDir: 'src/layouts', // default: 'src/layouts'
      defaultLayout: 'default', // default: 'default'
      importMode: 'sync' // Auto-detect: 'sync' for SSG, 'async' for others
    })
  ]
})
```

## How It Works

The `setupLayouts` function transforms your routes by:

1. Replacing pages with their specified layouts
2. Making the original pages children of their layouts

This creates nested routes with the same paths, giving you full access to the vue-router API.

## Common Patterns

### Transitions Between Routes

To add transitions between routes, including when using the same layout:

```html
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="slide">
      <component :is="Component" :key="route" />
    </transition>
  </router-view>
</template>
```

### Passing Data from Layout to Page

Use props to pass data down from layout to page:

```html
<router-view foo="bar" />
```

### Setting Static Data for a Layout

Use the route's meta property in your page:

```vue
<!-- page.vue -->
<template>
  <div>Content</div>
</template>

<route lang="yaml">
meta:
  layout: default
  bgColor: yellow
</route>
```

Then in your layout:

```vue
<!-- layout.vue -->
<script setup>
import { useRouter } from 'vue-router'
</script>

<template>
  <div :style="`background: ${useRouter().currentRoute.value.meta.bgColor};`">
    <router-view />
  </div>
</template>
```

### Dynamic Data from Page to Layout

Use custom events to pass data from page to layout:

```vue
<!-- page.vue -->
<script setup>
import { defineEmits } from 'vue'
const emit = defineEmits(['setColor'])

if (2 + 2 === 4)
  emit('setColor', 'green')
else
  emit('setColor', 'red')
</script>
```

Listen for the events in your layout:

```vue
<!-- layout.vue -->
<script setup>
import { ref } from 'vue'

const bgColor = ref('yellow')
function setBg(color) {
  bgColor.value = color
}
</script>

<template>
  <main :style="`background: ${bgColor};`">
    <router-view @set-color="setBg" />
  </main>
</template>
```

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/vite-plugin-layouts/releases) page for more information on what has changed recently.

## Contributing

Please review the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where `vite-plugin-layouts` is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [JohnCampionJr](https://github.com/JohnCampionJr) - Creator of original vite-plugin-vue-layouts
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/vite-plugin-layouts/contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/stacks/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/vite-plugin-layouts?style=flat-square
[npm-version-href]: https://npmjs.com/package/vite-plugin-layouts
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/vite-plugin-layouts/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/vite-plugin-layouts/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/vite-plugin-layouts/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/vite-plugin-layouts -->
