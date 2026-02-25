declare module 'virtual:generated-layouts' {
  import type { Router, RouteRecordRaw } from 'vue-router'
  // need any here due to different types for vue-router versions
  export function createGetRoutes(_router: Router | any, _withLayout?: boolean): () => RouteRecordRaw[]
  export function setupLayouts(_routes: RouteRecordRaw[]): RouteRecordRaw[]
}
