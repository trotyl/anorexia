import * as fs from 'fs'
import * as path from 'path'
import * as shell from 'shelljs'
import * as _ from 'lodash'

const ENCODING = 'utf8'

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
    const content = this.getWorkspaceFile(filepath)
    const updatedContent = content + '\n' + text
    this.setWorkspaceFile(filepath, updatedContent)
  }

  assertFileExists(filepath: string): void {
    const absoluteFilepath = path.join(this.workspace, this.prefix, filepath)
    if (!fs.existsSync(absoluteFilepath)) {
      throw new Error(`${filepath} not found!`)
    }
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

  install(...deps: string[]): void {
    if (deps.length > 0) {
      shell.exec(`yarn add ${deps.join(' ')}`)
    } else {
      shell.exec('yarn install')
    }
  }

  modifyJson(filepath: string, partial: Object): void {
    const json = this.getWorkspaceFile(filepath)
    const originalObj = JSON.parse(json)
    const modifiedObj = _.merge(originalObj, partial)
    const modifiedJson = JSON.stringify(modifiedObj)
    this.setWorkspaceFile(filepath, modifiedJson)
  }

  removeFiles(...list: string[]): void {
    list.forEach(filepath => {
      const fullPath = path.join(this.workspace, this.prefix, filepath)
      fs.unlinkSync(fullPath)
    })
  }

  renameFiles(hash: { [src: string]: string }): void {
    const srcSet = Object.keys(hash)
    srcSet.forEach(src => {
      const absoluteSrc = path.join(this.workspace, this.prefix, src)
      const absoluteDist = path.join(this.workspace, this.prefix, hash[src])
      fs.writeFileSync(absoluteDist, fs.readFileSync(absoluteSrc, ENCODING))
    })
    this.removeFiles(...srcSet)
  }

  renderToHtml(): Promise<string> {
    if (!this.platformServerOptions) {
      throw new Error('PlatformServerOptions is not provided!')
    }
    const { modulePath, moduleName, componentPath, componentName, htmlPath } = this.platformServerOptions
    const serverModuleTemplate = this.getProjectFile('server.module.js')
    const serverModuleContent = this.replaceContent(serverModuleTemplate,
      [/MODULE_PATH_PLACEHOLDER/g, `./${modulePath}`],
      [/MODULE_NAME_PLACEHOLDER/g, moduleName],
      [/COMPONENT_PATH_PLACEHOLDER/g, `./${componentPath}`],
      [/COMPONENT_NAME_PLACEHOLDER/g, componentName],
      [/HTML_PATH_PLACEHOLDER/g, htmlPath],
    )
    this.setWorkspaceFile('__server.module.js', serverModuleContent)
    const { result } = this.executeWorkspaceFile('__server.module.js')
    return result
  }

  replaceInFile(filepath: string, ...replacements: [string | RegExp, string][]): void {
    const content = this.getWorkspaceFile(filepath)
    const res = this.replaceContent(content, ...replacements)
    this.setWorkspaceFile(filepath, res)
  }

  setUpFiles(hash: { [src: string]: string }): void {
    Object.keys(hash)
      .forEach(src => {
        const absoluteSrc = path.join(this.fixture, src)
        const absoluteDist = path.join(this.workspace, this.prefix, hash[src])
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
    const absoluteFilepath = path.join(this.workspace, this.prefix, filepath)
    return require(absoluteFilepath)
  }

  private getProjectFile(filepath: string): string {
    const absoluteFilepath = path.join(__dirname, '../fixtures', filepath)
    return fs.readFileSync(absoluteFilepath, ENCODING)
  }

  private getWorkspaceFile(filepath: string): string {
    const absoluteFilepath = path.join(this.workspace, this.prefix, filepath)
    return fs.readFileSync(absoluteFilepath, ENCODING)
  }

  private replaceContent(content: string, ...replacements: [string | RegExp, string][]): string {
    let res = content
    replacements.forEach(([from, to]) => {
      res = res.replace(from as any, to)
    })
    return res
  }

  private setWorkspaceFile(filepath: string, data: string): void {
    const absoluteFilepath = path.join(this.workspace, this.prefix, filepath)
    fs.writeFileSync(absoluteFilepath, data)
  }
}

export function stage(name: string, task: () => void): void {
  shell.echo(name)
  task()
}

export function playbook(name: string, task: (env: Environment) => void, dirname: string): void {
  shell.echo(`Starting playbook for ${name}`)

  const WORKSPACE_ROOT = '/tmp/workspaces'
  const WORKSPACE_DIR = path.join(WORKSPACE_ROOT, name)

  shell.echo(`Creating workspace ${name}`)
  shell.mkdir('-p', WORKSPACE_DIR)
  shell.rm('-rf', WORKSPACE_DIR)
  shell.mkdir(WORKSPACE_DIR)
  shell.cd(WORKSPACE_DIR)

  const FIXTURE_DIR= path.join(dirname, 'fixtures')

  task(new Environment(FIXTURE_DIR, WORKSPACE_DIR))
  shell.echo('Playbook passed')
}
