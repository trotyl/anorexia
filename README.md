[![Travis](https://img.shields.io/travis/trotyl/anorexia.svg)](https://travis-ci.org/trotyl/anorexia)

# anorexia
An experimental automation tool for Angular

This project is separated from [learn angular the hard way](https://github.com/trotyl/learn-angular), acting as an automation tool to mimic the human behaviours.

It is now used to confirm if the steps listed in a tutorial is working fine, and not breaking in new version. (with cron task in CI)

## Usage

```typescript
// playbook.ts
import { playbook, stage } from 'anorexia'

playbook('playbook-name', async (env) => {
  
  stage('installing dependencies example', () => {
    env.install()
  })

  stage('creating files example', () => {
    // Copy files from ./fixtures to WORKSPACE
    env.setUpFiles({
      'main.ts': 'src/main.ts',
      'tsconfig.json': 'tsconfig.json',
      'package.json': 'package.json',
    })
  })

  stage('building example', () => {
    env.exec('tsc -p .')
  })

  stage('verifying example', () => {
    env.assertFileExists('dist/main.js')
  })

  stage('modifying example', () => {
    env.removeFiles('dist/main.js')
    env.modifyJson('tsconfig.json', {
      compilerOptions: {
        outDir: 'target'
      }
    })
  })

  stage('verifying example', () => {
    env.assertFileExists('target/main.js')
  })

  stage('replacing example', () => {
    env.replaceInFile('dist/main.js',
      [`environment.production`, 'true'],
      [`debugger`, ''],
    )
  })

  await stage('verifying Angular app example', () => {
    const html = await env.renderToHtml()
    env.assertPatternInText(html, /Hello Angular/)
    env.echo('app works!')
  })

}, __dirname)
```
