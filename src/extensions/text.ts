import { Host } from '../core'
import { replaceContent } from '../utils'

export class TextExtension {
  constructor(private host: Host) { }

  appendStart(filepath: string, text: string): void {
    return this._modifyText(filepath, (original) => `${text}\n${original}`)
  }

  appendEnd(filepath: string, text: string): void {
    return this._modifyText(filepath, (original) => `${original}\n${text}`)
  }

  appendBefore(filepath: string, pattern: string | RegExp, text: string): void {
    return this._modifyText(filepath, (original) => original.replace(pattern, `${text}$&`))
  }

  appendAfter(filepath: string, pattern: string | RegExp, text: string): void {
    return this._modifyText(filepath, (original) => original.replace(pattern, `$&${text}`))
  }

  replaceInFile(filepath: string, ...replacements: [string | RegExp, string][]): void {
    return this._modifyText(filepath, (original) => replaceContent(original, ...replacements))
  }

  private _modifyText(filepath: string, operation: (original: string) => string) {
    const original = this.host.readWorkspaceFile(filepath)
    const modified = operation(original)
    this.host.writeWorkspaceFile(filepath, modified)
  }
}

export function createTextExtension(host: Host): void {
  host.extensions.text = new TextExtension(host)
}

Host.extensionFactories.push(createTextExtension)

declare module '../core/host' {
  interface Extensions {
    text: TextExtension
  }
}
