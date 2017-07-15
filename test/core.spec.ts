import * as shell from 'shelljs'
import { expect } from 'chai'
import { stub, spy } from 'sinon'
import { createHost, Host, ExtensionFactory, WORKSPACE_ROOT_CONTAINER } from '../src/core'

declare module '../src/core/host' {
  interface Extensions {
    mock: any
  }
}

describe('core', () => {
  it('should be able to create new environment', () => {
    const host = createHost(__dirname)

    expect(host).to.be.an.instanceOf(Host)
  })

  it('should load extensions', () => {
    const MOCK_EXTENSION = { name: 'MOCK_EXTENSION' }
    const mockExtensionFactory = stub().callsFake((env: Host) => env.extensions.mock = MOCK_EXTENSION)

    Host.extensionFactories.push(mockExtensionFactory)
    const host = createHost(__dirname)

    expect(mockExtensionFactory.calledWith(host))
    expect(host.extensions.mock).to.equal(MOCK_EXTENSION)
  })

  it('should init extensions', () => {
    const MOCK_EXTENSION = { 
      name: 'MOCK_EXTENSION',
      onInit: () => { },
    }
    const extensionFactory = (env: Host) => env.extensions.mock = MOCK_EXTENSION
    const onInitSpy = spy(MOCK_EXTENSION, 'onInit')

    Host.extensionFactories.push(extensionFactory)
    const host = createHost(__dirname)

    expect(onInitSpy.called)
  })
})