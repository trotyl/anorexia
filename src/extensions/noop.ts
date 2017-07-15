import { Host } from '../core'

export class NoopExtension {
  constructor(private host: Host) { }
}

export function noopExtensionFactory(host: Host): void {
  host.extensions.noop = new NoopExtension(host)
}

Host.extensionFactories.push(noopExtensionFactory)

declare module '../core/host' {
  interface Extensions {
    noop: NoopExtension
  }
}
