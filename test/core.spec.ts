import * as shell from 'shelljs'
import { expect } from 'chai'
import { stub } from 'sinon'
import { createHost, Host, ExtensionFactory, WORKSPACE_ROOT_CONTAINER } from '../src/core'

declare module '../src/core/host' {
  interface Extensions {
    mock: any
  }
}

describe('core', () => {
  it('should be able to create new environment', () => {
    const env = createHost(__dirname)

    expect(env).to.be.an.instanceOf(Host)
  })

  it('should init extensions', () => {
    const MOCK_EXTENSION = 'MOCK_EXTENSION'
    const mockExtensionFactory = stub().callsFake((env: Host) => env.extensions.mock = MOCK_EXTENSION)

    Host.extensionFactories.push(mockExtensionFactory)
    const env = createHost(__dirname)

    expect(mockExtensionFactory.calledWith(env))
    expect(env.extensions.mock).to.equal(MOCK_EXTENSION)
  })

  describe('with environment instance', () => {
    const workspaceRoot = `${WORKSPACE_ROOT_CONTAINER}/anorexia-test`
    let env: Host

    beforeEach(() => {
      env = createHost(__dirname, workspaceRoot)
    })

  })
})