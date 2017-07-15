import * as fs from 'fs'
import * as path from 'path'
import * as _ from 'lodash'
import * as shell from 'shelljs'

import { ENCODING, WORKSPACE_ROOT_CONTAINER } from './constants'
import { replaceContent } from '../utils'

export interface Extensions { }

export interface ExtensionFactory {
  (host: Host): void
}

export class Host {
  static extensionFactories: ExtensionFactory[] = []

  extensions: Extensions

  private prefix: string = ''

  constructor(private projectRoot: string, private workspaceRoot: string) {
    this.extensions = {} as any
    Host.extensionFactories.forEach(factory => factory(this))
    Object.values(this.extensions).forEach(extension => extension.onInit && extension.onInit())
  }

  install(...deps: string[]): void {
    if (deps.length > 0) {
      shell.exec(`yarn add ${deps.join(' ')}`)
    } else {
      shell.exec('yarn install')
    }
  }

  modifyJson(filepath: string, partial: Object): void {
    const json = this.readWorkspaceFile(filepath)
    const originalObj = JSON.parse(json)
    const modifiedObj = _.merge(originalObj, partial)
    const modifiedJson = JSON.stringify(modifiedObj)
    this.writeWorkspaceFile(filepath, modifiedJson)
  }

  setUpFiles(hash: { [src: string]: string }): void {
    Object.keys(hash)
      .forEach(src => {
        const absoluteSrc = path.join(this.projectRoot, src)
        const absoluteDist = this.locateWorkspaceFile(hash[src])
        fs.writeFileSync(absoluteDist, fs.readFileSync(absoluteSrc))
      })
  }

  usePrefix(prefix: string): void {
    this.prefix = prefix
  }

  executeWorkspaceFile(filepath: string): any {
    return require(this.locateWorkspaceFile(filepath))
  }

  readProjectFile(filepath: string): string {
    const absoluteFilepath = path.join(__dirname, '../fixtures', filepath)
    return fs.readFileSync(absoluteFilepath, ENCODING)
  }

  readWorkspaceFile(filepath: string): string {
    return fs.readFileSync(this.locateWorkspaceFile(filepath), ENCODING)
  }

  writeWorkspaceFile(filepath: string, data: string): void {
    fs.writeFileSync(this.locateWorkspaceFile(filepath), data)
  }

  locateWorkspaceFile(filepath: string): string {
    return path.join(this.workspaceRoot, this.prefix, filepath)
  }
}

export function createHost(projectRoot: string, workspaceRoot?: string): Host {
  workspaceRoot = workspaceRoot || `${WORKSPACE_ROOT_CONTAINER}/${Date.now()}`
  return new Host(projectRoot, workspaceRoot)
}
