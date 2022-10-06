import {
  DocumentNode,
  QueryResult,
  useQuery
} from '@apollo/client'
import { RemoteData } from './rd'

export type QueryResultWithRemoteData<T> = QueryResult & { _rd: RemoteData<T> }

/**
 * @description Maps a `useQuery` QueryResult to the appropriate RemoteData discriminant
 * @param d DocumentNode
 * @returns Everything from `QueryResult` with an accompanying `_rd` property wth the RemoteData object
 */
export const useQueryRd = <T>(
  d: DocumentNode
): QueryResultWithRemoteData<T> => {
  const res = useQuery<T>(d)

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
