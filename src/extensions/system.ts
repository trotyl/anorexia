import * as shell from 'shelljs'
import { Environment } from '../core'

export class SystemExtension {
  constructor(private env: Environment) { }

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

export function systemExtensionFactory(env: Environment): void {
  env.extensions.system = new SystemExtension(env)
}

Environment.extensionFactories.push(systemExtensionFactory)

declare module '../core' {
  interface Extensions {
    system: SystemExtension
  }
}
