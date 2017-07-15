import * as path from 'path'
import * as shell from 'shelljs'

import { createHost, Host, WORKSPACE_ROOT_CONTAINER } from '../core'

let dispatcher: Promise<void> = Promise.resolve()

export interface Scenario {
  (host: Host): Promise<void> | void
}

export interface Step {
  (): Promise<void> | void
}

export async function stage(name: string, task: Step): Promise<void> {
  dispatcher = dispatcher.then(() => {
    shell.echo(name)
    return task()
  })
  return await dispatcher
}

export async function playbook(name: string, task: Scenario, projectRoot: string): Promise<void> {
  shell.echo(`Starting playbook for ${name}`)

  const workspaceRoot = path.join(WORKSPACE_ROOT_CONTAINER, name)

  shell.echo(`Creating workspace ${name}`)
  shell.mkdir('-p', workspaceRoot)
  shell.rm('-rf', workspaceRoot)
  shell.mkdir(workspaceRoot)
  shell.cd(workspaceRoot)

  await task(createHost(projectRoot))
  shell.echo('Playbook completed')
}
