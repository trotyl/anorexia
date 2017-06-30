import { Environment } from '../core'

export class NoopExtension {
  constructor(private env: Environment) { }
}

export function noopExtensionFactory(env: Environment) {
  env.extensions.noop = new NoopExtension(env)
}

Environment.extensionFactories.push(noopExtensionFactory)

declare module '../core' {
  interface Extensions {
    noop: NoopExtension
  }
}
