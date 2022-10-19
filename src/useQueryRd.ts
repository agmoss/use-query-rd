import { DocumentNode, OperationVariables, QueryResult, useQuery } from '@apollo/client'
import { RemoteData } from './rd'

export type QueryResultWithRemoteData<T, V = OperationVariables> = QueryResult<T, V> & { _rd: RemoteData<T> }

/**
 * @description Maps a `useQuery` QueryResult to the appropriate RemoteData discriminant
 * @param query DocumentNode
 * @param vars Query variables
 * @returns Everything from `QueryResult` with an accompanying `_rd` property wth the RemoteData object
 */
export const useQueryRd = <T, V = OperationVariables>(
  query: DocumentNode,
  vars?: V
): QueryResultWithRemoteData<T, V> => {
  const res = useQuery<T, V>(query, { variables: vars ? { ...vars } : undefined })

  if (!res.called) {
    return {
      ...res,
      _rd: {
        tag: 'Initialized'
      }
    }
  }

  if (res.loading) {
    return {
      ...res,
      _rd: {
        tag: 'Pending'
      }
    }
  }

  if (res.data !== null && res.data !== undefined) {
    return {
      ...res,
      _rd: {
        tag: 'Success',
        data: res.data
      }
    }
  }

  if (res.error !== null && res.error !== undefined) {
    return {
      ...res,
      _rd: {
        tag: 'Failure',
        error: res.error
      }
    }
  }

  throw new TypeError('RemoteData case not matched')
}
