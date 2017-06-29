import * as path from 'path'
import * as shell from 'shelljs'

import { Environment } from './core'

let dispatcher: Promise<void> = Promise.resolve()

export interface Task {
  (): Promise<void> | void
}

export async function stage(name: string, task: Task): Promise<void> {
  dispatcher = dispatcher.then(() => {
    shell.echo(name)
    return task()
  })
  return await dispatcher
}

export async function playbook(name: string, task: (env: Environment) => Promise<void> | void, dirname: string): Promise<void> {
  shell.echo(`Starting playbook for ${name}`)

  const WORKSPACE_ROOT = '/tmp/workspaces'
  const WORKSPACE_DIR = path.join(WORKSPACE_ROOT, name)

  shell.echo(`Creating workspace ${name}`)
  shell.mkdir('-p', WORKSPACE_DIR)
  shell.rm('-rf', WORKSPACE_DIR)
  shell.mkdir(WORKSPACE_DIR)
  shell.cd(WORKSPACE_DIR)

  const FIXTURE_DIR= path.join(dirname, 'fixtures')

  await task(new Environment(FIXTURE_DIR, WORKSPACE_DIR))
  shell.echo('Playbook passed')
}
