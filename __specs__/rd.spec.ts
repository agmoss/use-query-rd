import { ApolloError } from '@apollo/client'
import {
  fold,
  failure,
  pending,
  initialized,
  map,
  success,
  Tags,
  match
} from '../src/rd'

const rd1 = initialized()
const rd3 = failure(
  new ApolloError({
    networkError: new Error('this is an error')
  })
)

describe('RemoteData', () => {
  it('failure should have an error', () => {
    expect(rd3.tag).toEqual('Failure')
    // @ts-expect-error
    expect(rd3.error).toBeDefined()
  })

  it('should have appropriate equality', () => {
    expect(rd1).toEqual({ tag: 'Initialized' })
    expect(rd1).not.toEqual(rd3)
  })

  test('test map', () => {
    const add = (x: number): number => x + x
    expect(map(add, pending())).toEqual(pending())
    expect(map(add, success(5))).toEqual(success(10))
  })

  test('fold initialized', () => {
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const view = fold(initializedMock, pendingMock, failureMock, successMock)

    view({ tag: Tags.Initialized })
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
    view({ tag: Tags.Success, data })
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
    view({ tag: Tags.Failure, error })
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

  test('match initialized', () => {
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const _defaultMock = jest.fn()

    match(
      { tag: Tags.Initialized },
      {
        Initialized: initializedMock,
        Pending: pendingMock,
        Success: successMock,
        Failure: failureMock,
        _: _defaultMock
      }
    )

    expect(initializedMock).toHaveBeenCalledTimes(1)
    expect(initializedMock).toHaveBeenCalledWith()
    expect(pendingMock).not.toHaveBeenCalled()
    expect(successMock).not.toHaveBeenCalled()
    expect(failureMock).not.toHaveBeenCalled()
    expect(_defaultMock).not.toHaveBeenCalled()
  })

  test('match _ initialized', () => {
    const initializedMock = jest.fn()
    const pendingMock = jest.fn()
    const successMock = jest.fn()
    const failureMock = jest.fn()
    const _defaultMock = jest.fn()

    match(
      { tag: Tags.Initialized },
      {
        _: _defaultMock
      }
    )

    match(
      { tag: Tags.Initialized },
      {
        Initialized: initializedMock,
        _: _defaultMock
      }
    )

    expect(initializedMock).toHaveBeenCalledTimes(1)
    expect(initializedMock).toHaveBeenCalledWith()
    expect(pendingMock).not.toHaveBeenCalled()
    expect(successMock).not.toHaveBeenCalled()
    expect(failureMock).not.toHaveBeenCalled()
    expect(_defaultMock).toHaveBeenCalledTimes(1)
  })
})
