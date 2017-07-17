import * as shell from 'shelljs'
import { Host } from '../core'

export type SystemExtension = typeof shell

export function createSystemExtension(host: Host): void {
  host.extensions.system = shell
}

Host.extensionFactories.push(createSystemExtension)

declare module '../core/host' {
  interface Extensions {
    system: SystemExtension
  }
}
