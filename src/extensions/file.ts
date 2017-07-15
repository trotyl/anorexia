import * as fs from 'fs'
import { Host, ENCODING } from '../core'

export class FileExtension {
  constructor(private host: Host) { }

  exists(filepath: string): boolean {
    return fs.existsSync(this.host.locateWorkspaceFile(filepath))
  }

  remove(...list: string[]): void {
    list.forEach(filepath => {
      fs.unlinkSync(this.host.locateWorkspaceFile(filepath))
    })
  }

  rename(hash: { [src: string]: string }): void {
    const srcSet = Object.keys(hash)
    srcSet.forEach(src => {
      const absoluteSrc = this.host.locateWorkspaceFile(src)
      const absoluteDist = this.host.locateWorkspaceFile(hash[src])
      fs.writeFileSync(absoluteDist, fs.readFileSync(absoluteSrc, ENCODING))
    })
    this.remove(...srcSet)
  }
}

export function createFileExtension(host: Host): void {
  host.extensions.file = new FileExtension(host)
}

Host.extensionFactories.push(createFileExtension)

declare module '../core/host' {
  interface Extensions {
    file: FileExtension
  }
}
