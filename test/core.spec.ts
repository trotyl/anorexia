import { expect } from 'chai'
import { stub } from 'sinon'
import { WORKSPACE_ROOT_CONTAINER } from '../src/constants'
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

  describe('with environment instance', () => {
    const workspaceRoot = `${WORKSPACE_ROOT_CONTAINER}/anorexia-test`
    let env: Environment

    beforeEach(() => {
      env = create(__dirname, workspaceRoot)
    })

    it('should be able to append file', () => {
      const readStub = stub(env, 'readWorkspaceFile')
      const writeStub = stub(env, 'writeWorkspaceFile')
      readStub.withArgs('test.txt').returns(`1234`)

      const res = env.appendFile('test.txt', `5678`)

      expect(writeStub.args[0]).to.deep.equal(['test.txt', `1234\n5678`])
      
      readStub.restore()
      writeStub.restore()
    })
  })
})