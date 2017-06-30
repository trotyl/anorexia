import { Environment } from '../core'

export type ModuleType = 'commonjs'

export class JavascriptExtension {
  private moduleType: ModuleType = 'commonjs'

  constructor(private env: Environment) { }

  addModuleExports(filepath: string, ...exportNames: string[]): void {
    let extras: string[] = []
    switch (this.moduleType) {
      case 'commonjs':
        extras = exportNames.map(exportName => `exports.${exportName} = ${exportName}`)
        break
      default:
        throw new Error(`module type ${this.moduleType} is not supported`)
    }
    const appendix = `\n${extras.join('\n')}\n`
    this.env.appendFile(filepath, appendix)
  }

  useModule(moduleType: ModuleType): void {
    this.moduleType = moduleType
  }
}

export function javascriptExtensionFactory(env: Environment): void {
  env.extensions.javascript = new JavascriptExtension(env)
}

Environment.extensionFactories.push(javascriptExtensionFactory)

declare module '../core' {
  interface Extensions {
    javascript: JavascriptExtension
  }
}
