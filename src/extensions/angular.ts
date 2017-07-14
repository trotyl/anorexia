import { Environment } from '../core'
import { replaceContent } from '../utils/string'

export interface PlatformServerOptions {
  modulePath: string,
  moduleName: string,
  componentPath: string,
  componentName: string,
  htmlPath: string,
}

export class AngularExtension {
  readonly packages = {
    animations: '@angular/animations',
    core: '@angular/core',
    common: '@angular/common',
    compiler: '@angular/compiler',
    http: '@angular/http',
    platformBrowser: '@angular/platform-browser',
    platformBrowserDynamic: '@angular/platform-browser-dynamic',
    platformServer: '@angular/platform-server',
  }

  private platformServerOptions: PlatformServerOptions | null = null

  constructor(private env: Environment) { }

  disableBootstrap(filepath: string): void {
    this.env.replaceInFile(filepath, 
      [/(ng\.platformBrowser(Dynamic)?\.)?platformBrowser(Dynamic)?\(.*?\)\.bootstrapModule(Factory)?\(.*?\)/g, '']
    )
  }

  enableServerTransition(filepath: string): void {
    const replacement = `BrowserModule.withServerTransition({appId: 'none'})`
    this.env.replaceInFile(filepath,
      [/imports\s*?:\s*?\[([\s\S\n]*?)BrowserModule,?([\s\S\n]*?)\]/g, `imports: \[$1${replacement},$2\]`]
    )
  }
  
  renderToHtml(): Promise<string> {
    if (!this.platformServerOptions) {
      throw new Error('PlatformServerOptions is not provided!')
    }
    const { modulePath, moduleName, componentPath, componentName, htmlPath } = this.platformServerOptions
    const serverModuleTemplate = this.env.readProjectFile('server.module.js')
    const serverModuleContent = replaceContent(serverModuleTemplate,
      [/MODULE_PATH_PLACEHOLDER/g, `./${modulePath}`],
      [/MODULE_NAME_PLACEHOLDER/g, moduleName],
      [/COMPONENT_PATH_PLACEHOLDER/g, `./${componentPath}`],
      [/COMPONENT_NAME_PLACEHOLDER/g, componentName],
      [/HTML_PATH_PLACEHOLDER/g, htmlPath],
    )
    this.env.writeWorkspaceFile('__server.module.js', serverModuleContent)
    const { result } = this.env.executeWorkspaceFile('__server.module.js')
    return result
  }

  usePlatformServer(options: PlatformServerOptions) {
    this.platformServerOptions = options
  }
}

export function angularExtensionFactory(env: Environment): void {
  env.extensions.angular = new AngularExtension(env)
}

Environment.extensionFactories.push(angularExtensionFactory)

declare module '../core' {
  interface Extensions {
    angular: AngularExtension
  }
}
