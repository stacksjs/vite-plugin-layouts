import { resolve } from 'node:path'
import Debug from 'debug'
import { globSync } from 'tinyglobby'

export function extensionsToGlob(extensions: string[]): string {
  return extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0] || ''
}

export function normalizePath(str: string): string {
  return str.replace(/\\/g, '/')
}

export const debug: Debug.Debugger = Debug('vite-plugin-layouts')

export function pathToName(filepath: string): string {
  return filepath.replace(/[_.\-\\/]/g, '_').replace(/[[:\]()]/g, '$')
}

export function resolveDirs(dirs: string | string[] | null, root: string): string[] {
  if (dirs === null)
    return []

  const dirsArray = Array.isArray(dirs) ? dirs : [dirs]
  const dirsResolved: string[] = []

  for (const dir of dirsArray) {
    if (dir.includes('**')) {
      const matches = globSync(dir, { onlyDirectories: true })
      for (const match of matches)
        dirsResolved.push(normalizePath(resolve(root, match)))
    }
    else {
      dirsResolved.push(normalizePath(resolve(root, dir)))
    }
  }

  return dirsResolved
}
