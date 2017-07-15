import * as shell from 'shelljs'
import { Host } from '../core'

export class YarnExtension {
  constructor(private host: Host) { }

  install(...deps: string[]): void {
    if (deps.length > 0) {
      shell.exec(`yarn add ${deps.join(' ')}`)
    } else {
      shell.exec('yarn install')
    }
  }
}

export function createYarnExtension(host: Host): void {
  host.extensions.yarn = new YarnExtension(host)
}

Host.extensionFactories.push(createYarnExtension)

declare module '../core/host' {
  interface Extensions {
    yarn: YarnExtension
  }
}
