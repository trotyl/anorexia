import { Environment } from '../core'
import { TextExtension } from './text'

export type ModuleType = 'commonjs'

export class JavascriptExtension {
  private moduleType: ModuleType = 'commonjs'

  constructor(private env: Environment) { }

  get text(): TextExtension {
    return this.env.extensions.text
  }

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
    this.text.appendEnd(filepath, appendix)
  }

  useModule(moduleType: ModuleType): void {
    this.moduleType = moduleType
  }
}

export function javascriptExtensionFactory(env: Environment): void {
  env.extensions.javascript = new JavascriptExtension(env)
}

Environment.extensionFactories.push(javascriptExtensionFactory)

declare module '../core/environment' {
  interface Extensions {
    javascript: JavascriptExtension
  }
}
