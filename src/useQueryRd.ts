import { OperationVariables, useQuery } from '@apollo/client'
import { RemoteData } from './rd'

export type QueryResultWithRemoteData<TData, TVariables = void> = ReturnType<typeof useQueryRd<TData, TVariables>>

/**
 * @description Maps a `useQuery` QueryResult status (called | loading | data | error) to the RemoteData union
 * @param query GQL query document
 * @param options useQuery opts
 * @see https://www.apollographql.com/docs/react/data/queries/
 * @note RemoteData is tagged with `tag`. There is no generic for Error as it will always be an ApolloError.
 * @returns Everything from `QueryResult` with an accompanying `_rd` property wth the RemoteData object
 */
export const useQueryRd = <TData, TVariables = OperationVariables>(
  ...params: Parameters<typeof useQuery<TData, TVariables>>
): ReturnType<typeof useQuery<TData, TVariables>> & { _rd: RemoteData<TData> } => {
  const res = useQuery<TData, TVariables>(...params)

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
