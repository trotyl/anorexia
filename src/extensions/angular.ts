import * as path from 'path'
import { Host, OnInit } from '../core'
import { replaceContent } from '../utils'
import { TextExtension } from './text'

const templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*)/gm;
const stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
const stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

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

  constructor(private host: Host) { }

  get text(): TextExtension {
    return this.host.extensions.text
  }

  disableBootstrap(filepath: string): void {
    this.text.replaceInFile(filepath, 
      [/(ng\.platformBrowser(Dynamic)?\.)?platformBrowser(Dynamic)?\(.*?\)\.bootstrapModule(Factory)?\(.*?\)/g, '']
    )
  }

  enableServerTransition(filepath: string): void {
    const replacement = `BrowserModule.withServerTransition({appId: 'none'})`
    this.text.replaceInFile(filepath,
      [/imports\s*?:\s*?\[([\s\S\n]*?)BrowserModule,?([\s\S\n]*?)\]/g, `imports: \[$1${replacement},$2\]`]
    )
  }

  inline(...filepaths: string[]) {
    filepaths.forEach(filepath => {
      const content = this.host.readWorkspaceFile(filepath)
      const inlinedContent = this.processInline(content, filepath)
      this.host.writeWorkspaceFile(filepath, inlinedContent)
    })
  }
  
  renderToHtml(): Promise<string> {
    this.host.setUpFiles({
      [`../../fixtures/server.module.js`]: `__server.module.js`
    }, __dirname)
    
    if (!this.platformServerOptions) {
      throw new Error('PlatformServerOptions is not provided!')
    }
    const { modulePath, moduleName, componentPath, componentName, htmlPath } = this.platformServerOptions
    const serverModuleContent = this.text.replaceInFile('__server.module.js',
      [/MODULE_PATH_PLACEHOLDER/g, `./${modulePath}`],
      [/MODULE_NAME_PLACEHOLDER/g, moduleName],
      [/COMPONENT_PATH_PLACEHOLDER/g, `./${componentPath}`],
      [/COMPONENT_NAME_PLACEHOLDER/g, componentName],
      [/HTML_PATH_PLACEHOLDER/g, htmlPath],
    )
    const { result } = this.host.executeWorkspaceFile('__server.module.js')
    return result
  }

  usePlatformServer(options: PlatformServerOptions) {
    this.platformServerOptions = options
  }

  private processInline(content: string, filename: string) {
    return content.replace(templateUrlRegex, (match, quote, url) => {
      const templatePath = path.join(path.dirname(filename), url)
      const templateContent = this.host.readWorkspaceFile(templatePath)
      const escapedTemplateContent = templateContent.replace('`', '\\`')
      
      return `template: \`${escapedTemplateContent}\``
    }).replace(stylesRegex, (match, relativeUrls) => {
      const styles = [];
      let stringMatch: RegExpExecArray | null

      while ((stringMatch = stringRegex.exec(relativeUrls)) !== null) {
        const styleUrl = stringMatch[2]
        const stylePath = path.join(path.dirname(filename), styleUrl)
        const styleContent = this.host.readWorkspaceFile(stylePath)
        const escapedStyleContent = styleContent.replace('`', '\\`')
        styles.push(`\`${escapedStyleContent}\``)
      }

      return `styles: [${styles.join(', ')}]`;
    })
  }
}

export function createAngularExtension(host: Host): void {
  host.extensions.angular = new AngularExtension(host)
}

Host.extensionFactories.push(createAngularExtension)

declare module '../core/host' {
  interface Extensions {
    angular: AngularExtension
  }
}
