import { Host } from '../core'

export class NoopExtension {
  constructor(private host: Host) { }
}

export function createNoopExtension(host: Host): void {
  host.extensions.noop = new NoopExtension(host)
}

Host.extensionFactories.push(createNoopExtension)

declare module '../core/host' {
  interface Extensions {
    noop: NoopExtension
  }
}
