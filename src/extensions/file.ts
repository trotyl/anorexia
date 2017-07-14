import * as fs from 'fs'
import { Environment, ENCODING } from '../core'

export class FileExtension {
  constructor(private env: Environment) { }

  exists(filepath: string): boolean {
    return fs.existsSync(this.env.locateWorkspaceFile(filepath))
  }

  remove(...list: string[]): void {
    list.forEach(filepath => {
      fs.unlinkSync(this.env.locateWorkspaceFile(filepath))
    })
  }

  rename(hash: { [src: string]: string }): void {
    const srcSet = Object.keys(hash)
    srcSet.forEach(src => {
      const absoluteSrc = this.env.locateWorkspaceFile(src)
      const absoluteDist = this.env.locateWorkspaceFile(hash[src])
      fs.writeFileSync(absoluteDist, fs.readFileSync(absoluteSrc, ENCODING))
    })
    this.remove(...srcSet)
  }
}

export function fileExtensionFactory(env: Environment): void {
  env.extensions.file = new FileExtension(env)
}

Environment.extensionFactories.push(fileExtensionFactory)

declare module '../core/environment' {
  interface Extensions {
    file: FileExtension
  }
}
