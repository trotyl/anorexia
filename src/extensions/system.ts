import * as shell from 'shelljs'
import { Host } from '../core'

export class SystemExtension {
  constructor(private host: Host) { }

  cd(dir: string): void {
    shell.cd(dir)
  }

  echo(...text: string[]): void {
    shell.echo(...text)
  }

  exec(command: string): void {
    shell.exec(command)
  }
}

export function systemExtensionFactory(host: Host): void {
  host.extensions.system = new SystemExtension(host)
}

Host.extensionFactories.push(systemExtensionFactory)

declare module '../core/host' {
  interface Extensions {
    system: SystemExtension
  }
}
