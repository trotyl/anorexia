// describe('Text Extension', () => {
//   it('should be able to append file', () => {
//     const env = create(__dirname)
    
//     const readStub = stub(env, 'readWorkspaceFile')
//     const writeStub = stub(env, 'writeWorkspaceFile')
//     readStub.withArgs('test.txt').returns(`1234`)

//     const res = env.appendFile('test.txt', `5678`)

//     expect(writeStub.args[0]).to.deep.equal(['test.txt', `1234\n5678`])

//     readStub.restore()
//     writeStub.restore()
//   })
// })
