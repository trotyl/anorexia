import { Host } from '../core'
import { TextExtension } from './text'

export type ModuleType = 'commonjs'

export class JavascriptExtension {
  private moduleType: ModuleType = 'commonjs'

  constructor(private host: Host) { }

  get text(): TextExtension {
    return this.host.extensions.text
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

export function createJavascriptExtension(host: Host): void {
  host.extensions.javascript = new JavascriptExtension(host)
}

Host.extensionFactories.push(createJavascriptExtension)

declare module '../core/host' {
  interface Extensions {
    javascript: JavascriptExtension
  }
}
