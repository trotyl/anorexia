require('core-js')
require('zone.js')
const core = require('@angular/core')
const platformBrowser = require('@angular/platform-browser')
const platformBrowserDynamic = require('@angular/platform-browser-dynamic')
const { renderModule, ServerModule } = require('@angular/platform-server')

global.ng = {
  core,
  platformBrowser,
  platformBrowserDynamic,
}

const { MODULE_NAME_PLACEHOLDER } = require('MODULE_PATH_PLACEHOLDER')
const { COMPONENT_NAME_PLACEHOLDER } = require('COMPONENT_PATH_PLACEHOLDER')

class AnorexiaServerAppModule { }
core.NgModule({
  imports: [MODULE_NAME_PLACEHOLDER, ServerModule],
  bootstrap: [COMPONENT_NAME_PLACEHOLDER],
})(AnorexiaServerAppModule)

const fs = require('fs')
const document = fs.readFileSync('HTML_PATH_PLACEHOLDER', 'utf8')

exports.result = renderModule(AnorexiaServerAppModule, { document })
