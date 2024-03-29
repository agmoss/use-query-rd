import { type OperationVariables, useQuery } from '@apollo/client'
import { type RemoteData, Tags } from './rd'

export type QueryResultWithRemoteData<TData, TVariables extends OperationVariables = OperationVariables> = ReturnType<
  typeof useQueryRd<TData, TVariables>
>

/**
 * @description Maps a `useQuery` QueryResult status (called | loading | data | error) to the RemoteData union
 * @param query GQL query document
 * @param options useQuery opts
 * @see https://www.apollographql.com/docs/react/data/queries/
 * @note RemoteData is tagged with `tag`. There is no generic for Error as it will always be an ApolloError.
 * @returns Everything from `QueryResult` with an accompanying `_rd` property wth the RemoteData object
 */
export const useQueryRd = <TData, TVariables extends OperationVariables = OperationVariables>(
  ...params: Parameters<typeof useQuery<TData, TVariables>>
): ReturnType<typeof useQuery<TData, TVariables>> & {
    _rd: RemoteData<TData>
  } => {
  const res = useQuery<TData, TVariables>(...params)

  if (!res.called) {
    return {
      ...res,
      _rd: {
        tag: Tags.Initialized
      }
    }
  }

  if (res.loading) {
    return {
      ...res,
      _rd: {
        tag: Tags.Pending
      }
    }
  }

  if (res.data !== null && res.data !== undefined) {
    return {
      ...res,
      _rd: {
        tag: Tags.Success,
        data: res.data
      }
    }
  }

  if (res.error !== null && res.error !== undefined) {
    return {
      ...res,
      _rd: {
        tag: Tags.Failure,
        error: res.error
      }
    }
  }

  throw new TypeError('RemoteData case not matched')
}
