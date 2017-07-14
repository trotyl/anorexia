import { Environment } from '../core'
import { replaceContent } from '../utils'

export class TextExtension {
  constructor(private env: Environment) { }

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
    const original = this.env.readWorkspaceFile(filepath)
    const modified = operation(original)
    this.env.writeWorkspaceFile(filepath, modified)
  }
}

export function textExtensionFactory(env: Environment): void {
  env.extensions.text = new TextExtension(env)
}

Environment.extensionFactories.push(textExtensionFactory)

declare module '../core/environment' {
  interface Extensions {
    text: TextExtension
  }
}
