import { ApolloError, QueryResult } from '@apollo/client'

/**
 * @see https://package.elm-lang.org/packages/krisajenkins/remotedata/latest/
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
