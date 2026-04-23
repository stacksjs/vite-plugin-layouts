import { describe, expect, it } from 'bun:test'
import type { Plugin } from 'vite'
import Layout, { ClientSideLayout, defaultImportMode } from '../src/index'
import getClientCode from '../src/RouteLayout'
import { getImportCode } from '../src/import-code'

describe('vite-plugin-layouts', () => {
  describe('plugin creation', () => {
    it('returns a valid Vite plugin', () => {
      const plugin = Layout() as Plugin
      expect(plugin.name).toBe('vite-plugin-layouts')
    })

    it('returns ClientSideLayout when options are simple', () => {
      const plugin = Layout({ defaultLayout: 'main' }) as Plugin
      expect(plugin.name).toBe('vite-plugin-layouts')
      expect(plugin.resolveId).toBeDefined()
      expect(plugin.load).toBeDefined()
    })

    it('returns server-side plugin when complex options are used', () => {
      const plugin = Layout({
        layoutsDirs: ['src/layouts', 'src/other-layouts'],
        extensions: ['vue', 'tsx'],
      }) as Plugin
      expect(plugin.name).toBe('vite-plugin-layouts')
      expect(plugin.configResolved).toBeDefined()
      expect(plugin.configureServer).toBeDefined()
    })
  })

  describe('ClientSideLayout', () => {
    it('creates a valid plugin', () => {
      const plugin = ClientSideLayout()
      expect(plugin.name).toBe('vite-plugin-layouts')
    })

    it('resolves virtual module IDs', () => {
      const plugin = ClientSideLayout()
      const resolveId = plugin.resolveId as (id: string) => string | undefined
      expect(resolveId('layouts-generated')).toBe('\0layouts-generated')
      expect(resolveId('virtual:generated-layouts')).toBe('\0virtual:generated-layouts')
      expect(resolveId('some-other-module')).toBeUndefined()
    })

    it('loads virtual module with layout code', async () => {
      const plugin = ClientSideLayout({ layoutDir: 'src/layouts', defaultLayout: 'main' })
      const load = plugin.load as (id: string) => string | Promise<string> | undefined
      const code = await load('\0layouts-generated')
      expect(code).toBeDefined()
      expect(typeof code).toBe('string')
    })
  })

  describe('defaultImportMode', () => {
    it('returns sync for default layout', () => {
      expect(defaultImportMode('default')).toBe('sync')
    })

    it('returns async for non-default layouts', () => {
      expect(defaultImportMode('admin')).toBe('async')
      expect(defaultImportMode('auth')).toBe('async')
    })
  })

  describe('route layout code generation', () => {
    it('generates setupLayouts function', () => {
      const importCode = 'const layouts = {}'
      const code = getClientCode(importCode, {
        defaultLayout: 'default',
        layoutsDirs: 'src/layouts',
        pagesDirs: 'src/pages',
        extensions: ['vue'],
        exclude: [],
        importMode: defaultImportMode,
      })
      expect(code).toContain('export function setupLayouts')
      expect(code).toContain('export const createGetRoutes')
      expect(code).toContain("layout || 'default'")
    })

    it('uses custom default layout name', () => {
      const code = getClientCode('', {
        defaultLayout: 'main',
        layoutsDirs: 'src/layouts',
        pagesDirs: 'src/pages',
        extensions: ['vue'],
        exclude: [],
        importMode: defaultImportMode,
      })
      expect(code).toContain("layout || 'main'")
    })

    it('setupLayouts wraps routes with layout components', () => {
      const code = getClientCode('const layouts = {}', {
        defaultLayout: 'default',
        layoutsDirs: 'src/layouts',
        pagesDirs: 'src/pages',
        extensions: ['vue'],
        exclude: [],
        importMode: defaultImportMode,
      })
      expect(code).toContain('isLayout: true')
      expect(code).toContain('route.meta?.layout !== false')
      expect(code).toContain('route.children')
    })
  })

  describe('import code generation', () => {
    it('generates import statements for layout files', () => {
      const code = getImportCode(
        [{ path: '/src/layouts', files: ['default.vue', 'admin.vue'] }],
        {
          defaultLayout: 'default',
          layoutsDirs: 'src/layouts',
          pagesDirs: 'src/pages',
          extensions: ['vue'],
          exclude: [],
          importMode: defaultImportMode,
        },
      )
      expect(code).toContain('default')
      expect(code).toContain('admin')
      expect(code).toContain('import')
    })
  })

  describe('vite plugin API compatibility', () => {
    it('resolveId handles known module IDs', () => {
      const plugin = Layout({
        layoutsDirs: ['src/layouts', 'src/other'],
      }) as Plugin & { resolveId: (id: string) => string | null }

      expect(plugin.resolveId('layouts-generated')).toBe('/@vite-plugin-layouts/generated-layouts')
      expect(plugin.resolveId('virtual:generated-layouts')).toBe('/@vite-plugin-layouts/generated-layouts')
      expect(plugin.resolveId('unrelated-module')).toBeNull()
    })

    it('plugin has enforce: pre', () => {
      const plugin = Layout({
        layoutsDirs: ['src/layouts', 'src/other'],
      }) as Plugin
      expect(plugin.enforce).toBe('pre')
    })
  })
})
