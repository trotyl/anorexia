import * as _ from 'lodash'
import { Host } from '../core'

export class JsonExtension {
  constructor(private host: Host) { }

  modify(filepath: string, partial: Object): void {
    const json = this.host.readWorkspaceFile(filepath)
    const originalObj = JSON.parse(json)
    const modifiedObj = _.merge(originalObj, partial)
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
