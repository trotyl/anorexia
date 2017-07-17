import * as _ from 'lodash'
import { Host } from '../core'

export class JsonExtension {
  constructor(private host: Host) { }

  modify(filepath: string, change: object): void
  modify(filepath: string, change: (obj: object) => object): void
  modify(filepath: string, change: object | ((obj: object) => object)): void {
    const json = this.host.readWorkspaceFile(filepath)
    const originalObj = JSON.parse(json)
    const modifiedObj = typeof change === 'function' ? change(originalObj) : _.merge(originalObj, change)
    const modifiedJson = JSON.stringify(modifiedObj)
    this.host.writeWorkspaceFile(filepath, modifiedJson)
  }
}

export function createJsonExtension(host: Host): void {
  host.extensions.json = new JsonExtension(host)
}

Host.extensionFactories.push(createJsonExtension)

declare module '../core/host' {
  interface Extensions {
    json: JsonExtension
  }
}
