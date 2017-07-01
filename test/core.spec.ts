import { expect } from 'chai'
import { stub } from 'sinon'
import { create, Environment, ExtensionFactory } from '../src/core'

declare module '../src/core' {
  interface Extensions {
    mock: any
  }
}

describe('core', () => {
  it('should be able to create new environment', () => {
    const env = create(__dirname)

    expect(env).to.be.an.instanceOf(Environment)
  })

  it('should init extensions', () => {
    const MOCK_EXTENSION = 'MOCK_EXTENSION'
    const mockExtensionFactory = stub().callsFake((env: Environment) => env.extensions.mock = MOCK_EXTENSION)

    Environment.extensionFactories.push(mockExtensionFactory)
    const env = create(__dirname)

    expect(mockExtensionFactory.calledWith(env))
    expect(env.extensions.mock).to.equal(MOCK_EXTENSION)
  })
})