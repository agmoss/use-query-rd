import { ApolloError, QueryResult } from '@apollo/client'

/**
 * @name RemoteData
 * @description A datatype representing fetched data.
 * @see https://package.elm-lang.org/packages/krisajenkins/remotedata/latest/
 * @inspo http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html
 */
export type RemoteData<D> = Initialized | Pending | Failure | Success<D>

export interface Initialized {
  readonly tag: 'Initialized'
}

export interface Pending {
  readonly tag: 'Pending'
}

export interface Failure {
  readonly tag: 'Failure'
  error: Required<Pick<QueryResult, 'error'>>['error']
}

export interface Success<A> {
  readonly tag: 'Success'
  data: A
}

export const initialized = <T = never>(): RemoteData<T> => ({ tag: 'Initialized' })
export const pending = <T = never>(): RemoteData<T> => ({ tag: 'Pending' })
export const failure = <T = never>(error: ApolloError): RemoteData<T> => ({ tag: 'Failure', error })
export const success = <D = never>(data: D): RemoteData<D> => ({ tag: 'Success', data })

export const isInitialized = <D = never>(rd: RemoteData<D>): rd is Pending => rd.tag === 'Initialized'
export const isLoading = <D = never>(rd: RemoteData<D>): rd is Pending => rd.tag === 'Pending'
export const isFailure = <D = never>(rd: RemoteData<D>): rd is Failure => rd.tag === 'Failure'
export const isSuccess = <D = never>(rd: RemoteData<D>): rd is Success<D> => rd.tag === 'Success'

export const fold = <T, D>(
  initialized: () => T,
  pending: () => T,
  failure: (error: ApolloError) => T,
  success: (data: D) => T
): (_: RemoteData<D>) => T => {
  return (_: RemoteData<D>) => {
    switch (_.tag) {
      case 'Initialized':
        return initialized()
      case 'Pending':
        return pending()
      case 'Failure':
        return failure(_.error)
      case 'Success':
        return success(_.data)
      default:
        throw new TypeError('RemoteData case not matched')
    }
  }
}

export const map = <T, D>(f: (a: T) => D, fa: RemoteData<T>): RemoteData<D> => isSuccess(fa) ? success(f(fa.data)) : fa
