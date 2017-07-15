// it('should be able to cd', () => {
//   const cdStub = stub(shell, 'cd')

//   env.cd('dir')

//   expect(cdStub.args[0]).to.deep.equal(['dir'])

//   cdStub.restore()
// })

// it('should be able to echo', () => {
//   const echoStub = stub(shell, 'echo')

//   env.echo('foo', 'bar')

//   expect(echoStub.args[0]).to.deep.equal(['foo', 'bar'])

//   echoStub.restore()
// })

// it('should be able to exec', () => {
//   const execStub = stub(shell, 'exec')

//   env.exec('command')

//   expect(execStub.args[0]).to.deep.equal(['command'])

//   execStub.restore()
// })
