import { ApolloError } from '@apollo/client'
import { Failure } from '..'

describe('RemoteData', () => {
  it('failure should have an error', async () => {
    const fail: Failure = {
      tag: 'Failure',
      error: new ApolloError({
        networkError: new Error('this is an error')
      })
    }

    expect(fail.tag).toEqual('Failure')
    expect(fail.error).toBeDefined()
  })
})
