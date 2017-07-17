[![Travis](https://img.shields.io/travis/trotyl/anorexia.svg)](https://travis-ci.org/trotyl/anorexia)

# anorexia
An experimental automation tool for Angular

This project is separated from [learn angular the hard way](https://github.com/trotyl/learn-angular), acting as an automation tool to mimic the human behaviours.

It is now used to confirm if the steps listed in a tutorial is working fine, and not breaking in newer versions. (with cron task in CI)

## Important Notes

This project is currently for personal use only, there will be more documentation when it become stable and public.

## Usage

Install via npm:

```bash
npm install anorexia --save-dev
```

Create a playbook:

```typescript
// playbook.ts

import { playbook, stage } from 'anorexia'
import { assert } from 'chai'

playbook('playbook-name', async (host) => {

  const { angular: ng, javascript: js, yarn, system, file, json } = host.extensions
  
  stage('installing dependencies example', () => {
    yarn.install()
  })

  stage('creating files example', () => {
    // Copy files from PROJECT to WORKSPACE
    host.setUpFiles({
      [`fixtures/main.ts`]: `src/main.ts`,
      [`fixtures/tsconfig.json`]: `tsconfig.json`,
      [`fixtures/package.json`]: `package.json`,
    })
  })

  stage('building example', () => {
    system.exec('tsc -p .')
  })

  stage('verifying example', () => {
    assert.isTrue(file.exists('dist/main.js'))
  })

  stage('modifying example', () => {
    file.remove('dist/main.js')
    json.modify('tsconfig.json', {
      compilerOptions: {
        outDir: 'target'
      }
    })
  })

  stage('verifying example', () => {
    assert.isTrue(file.exists('target/main.js'))
  })

  stage('replacing example', () => {
    file.replaceInFile('dist/main.js',
      [`environment.production`, 'true'],
      [`debugger`, ''],
    )
  })

  await stage('verifying Angular app example', () => {
    const html = await ng.renderToHtml()
    assert.match(html, /Hello Angular/)
    system.echo('app works!')
  })

}, __dirname)
```

Execute the playbook

```bash
ts-node playbook.ts
```
