import { ApolloError } from '@apollo/client'
import { Failure, fold } from '../rd'

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

  test('fold initialized', () => {
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const view = fold(initializedMock, pendingMock, failureMock, successMock)

    view({ tag: 'Initialized' })
    expect(initializedMock).toHaveBeenCalledTimes(1)
    expect(initializedMock).toHaveBeenCalledWith()
    expect(pendingMock).not.toHaveBeenCalled()
    expect(successMock).not.toHaveBeenCalled()
    expect(failureMock).not.toHaveBeenCalled()
  })

  test('fold success', () => {
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const view = fold(initializedMock, pendingMock, failureMock, successMock)

    const data = { apple: 'sauce' }
    view({ tag: 'Success', data })
    expect(initializedMock).not.toHaveBeenCalled()
    expect(pendingMock).not.toHaveBeenCalled()
    expect(successMock).toHaveBeenCalledTimes(1)
    expect(successMock).toHaveBeenCalledWith(data)
    expect(failureMock).not.toHaveBeenCalled()
  })

  test('fold failure', () => {
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const view = fold(initializedMock, pendingMock, failureMock, successMock)

    const error = new ApolloError({ errorMessage: 'this is an error' })
    view({ tag: 'Failure', error })
    expect(initializedMock).not.toHaveBeenCalled()
    expect(pendingMock).not.toHaveBeenCalled()
    expect(successMock).not.toHaveBeenCalled()
    expect(failureMock).toHaveBeenCalledTimes(1)
    expect(failureMock).toHaveBeenCalledWith(error)
  })

  test('fold unknown', () => {
    const otherMock = jest.fn()
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const view = fold(initializedMock, pendingMock, failureMock, successMock)

    // @ts-expect-error
    expect(() => view(otherMock)).toThrow('RemoteData case not matched')
  })
})
