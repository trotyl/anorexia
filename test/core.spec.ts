import { expect } from 'chai'
import { create, Environment } from '../src/core'

describe('core', () => {
  it('should be able to create new environment', () => {
    const env = create(__dirname)

    expect(env).to.be.an.instanceOf(Environment)
  })

  it('should init extensions', () => {
    
  })
})