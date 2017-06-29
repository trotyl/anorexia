import { Environment } from '../core'

export interface PlatformServerOptions {
  modulePath: string,
  moduleName: string,
  componentPath: string,
  componentName: string,
  htmlPath: string,
}

export class AngularExtension {
  private platformServerOptions: PlatformServerOptions | null = null

  constructor(private env: Environment) { }
  
  renderToHtml(): Promise<string> {
    if (!this.platformServerOptions) {
      throw new Error('PlatformServerOptions is not provided!')
    }
    const { modulePath, moduleName, componentPath, componentName, htmlPath } = this.platformServerOptions
    const serverModuleTemplate = this.env.readProjectFile('server.module.js')
    const serverModuleContent = this.env.replaceContent(serverModuleTemplate,
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

export function angularExtensionFactory(env: Environment) {
  env.extensions.angular = new AngularExtension(env)
}

Environment.extensionFactories.push(angularExtensionFactory)

declare module '../core' {
  interface Extensions {
    angular: AngularExtension
  }
}