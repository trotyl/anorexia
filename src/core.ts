import * as fs from 'fs'
import * as path from 'path'
import * as _ from 'lodash'
import * as shell from 'shelljs'

import { ENCODING } from './constants'

export interface PlatformServerOptions {
  modulePath: string,
  moduleName: string,
  componentPath: string,
  componentName: string,
  htmlPath: string,
}

export class Environment {
  private prefix: string = ''
  private platformServerOptions: PlatformServerOptions | null = null

  constructor(private fixture: string, private workspace: string) { }

  appendFile(filepath: string, text: string): void {
    const content = this.readWorkspaceFile(filepath)
    const updatedContent = content + '\n' + text
    this.writeWorkspaceFile(filepath, updatedContent)
  }

  cd(dir: string): void {
    shell.cd(dir)
  }

  echo(...text: string[]): void {
    shell.echo(...text)
  }

  exec(command: string): void {
    shell.exec(command)
  }

  fileExists(filepath: string): boolean {
    return fs.existsSync(this.locateWorkspaceFile(filepath))
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

  removeFiles(...list: string[]): void {
    list.forEach(filepath => {
      fs.unlinkSync(this.locateWorkspaceFile(filepath))
    })
  }

  renameFiles(hash: { [src: string]: string }): void {
    const srcSet = Object.keys(hash)
    srcSet.forEach(src => {
      const absoluteSrc = this.locateWorkspaceFile(src)
      const absoluteDist = this.locateWorkspaceFile(hash[src])
      fs.writeFileSync(absoluteDist, fs.readFileSync(absoluteSrc, ENCODING))
    })
    this.removeFiles(...srcSet)
  }

  renderToHtml(): Promise<string> {
    if (!this.platformServerOptions) {
      throw new Error('PlatformServerOptions is not provided!')
    }
    const { modulePath, moduleName, componentPath, componentName, htmlPath } = this.platformServerOptions
    const serverModuleTemplate = this.readProjectFile('server.module.js')
    const serverModuleContent = this.replaceContent(serverModuleTemplate,
      [/MODULE_PATH_PLACEHOLDER/g, `./${modulePath}`],
      [/MODULE_NAME_PLACEHOLDER/g, moduleName],
      [/COMPONENT_PATH_PLACEHOLDER/g, `./${componentPath}`],
      [/COMPONENT_NAME_PLACEHOLDER/g, componentName],
      [/HTML_PATH_PLACEHOLDER/g, htmlPath],
    )
    this.writeWorkspaceFile('__server.module.js', serverModuleContent)
    const { result } = this.executeWorkspaceFile('__server.module.js')
    return result
  }

  replaceInFile(filepath: string, ...replacements: [string | RegExp, string][]): void {
    const content = this.readWorkspaceFile(filepath)
    const res = this.replaceContent(content, ...replacements)
    this.writeWorkspaceFile(filepath, res)
  }

  setUpFiles(hash: { [src: string]: string }): void {
    Object.keys(hash)
      .forEach(src => {
        const absoluteSrc = path.join(this.fixture, src)
        const absoluteDist = this.locateWorkspaceFile(hash[src])
        fs.writeFileSync(absoluteDist, fs.readFileSync(absoluteSrc))
      })
  }

  usePrefix(prefix: string): void {
    this.prefix = prefix
  }

  usePlatformServer(options: PlatformServerOptions) {
    this.platformServerOptions = options
  }

  private executeWorkspaceFile(filepath: string): any {
    return require(this.locateWorkspaceFile(filepath))
  }

  private locateWorkspaceFile(filepath: string): string {
    return path.join(this.workspace, this.prefix, filepath)
  }

  private readProjectFile(filepath: string): string {
    const absoluteFilepath = path.join(__dirname, '../fixtures', filepath)
    return fs.readFileSync(absoluteFilepath, ENCODING)
  }

  private readWorkspaceFile(filepath: string): string {
    return fs.readFileSync(this.locateWorkspaceFile(filepath), ENCODING)
  }

  private replaceContent(content: string, ...replacements: [string | RegExp, string][]): string {
    let res = content
    replacements.forEach(([from, to]) => {
      res = res.replace(from as any, to)
    })
    return res
  }

  private writeWorkspaceFile(filepath: string, data: string): void {
    fs.writeFileSync(this.locateWorkspaceFile(filepath), data)
  }
}
