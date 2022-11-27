import { ApolloError, QueryResult } from '@apollo/client'

/**
 * @name RemoteData
 * @description A datatype representing fetched data.
 * @see https://package.elm-lang.org/packages/krisajenkins/remotedata/latest/
 * @inspo http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html
 */
export type RemoteData<D> = Initialized | Pending | Failure | Success<D>

export enum Tags {
  Initialized = 'Initialized',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
  _ = '_', // Default
}

export interface Initialized {
  readonly tag: Tags.Initialized
}

export interface Pending {
  readonly tag: Tags.Pending
}

export interface Failure {
  readonly tag: Tags.Failure
  error: Required<Pick<QueryResult, 'error'>>['error']
}

export interface Success<A> {
  readonly tag: Tags.Success
  data: A
}

export const initialized = <T = never>(): RemoteData<T> => ({
  tag: Tags.Initialized
})
export const pending = <T = never>(): RemoteData<T> => ({ tag: Tags.Pending })
export const failure = <T = never>(error: ApolloError): RemoteData<T> => ({
  tag: Tags.Failure,
  error
})
export const success = <D = never>(data: D): RemoteData<D> => ({
  tag: Tags.Success,
  data
})

export const isInitialized = <D = never>(rd: RemoteData<D>): rd is Pending =>
  rd.tag === Tags.Initialized
export const isLoading = <D = never>(rd: RemoteData<D>): rd is Pending =>
  rd.tag === Tags.Pending
export const isFailure = <D = never>(rd: RemoteData<D>): rd is Failure =>
  rd.tag === Tags.Failure
export const isSuccess = <D = never>(rd: RemoteData<D>): rd is Success<D> =>
  rd.tag === Tags.Success

export const fold =
  <T, D>(
    initialized: () => T,
    pending: () => T,
    failure: (error: ApolloError) => T,
    success: (data: D) => T
  ): ((_: RemoteData<D>) => T) =>
    (_: RemoteData<D>) => {
      switch (_.tag) {
        case Tags.Initialized:
          return initialized()
        case Tags.Pending:
          return pending()
        case Tags.Failure:
          return failure(_.error)
        case Tags.Success:
          return success(_.data)
        default:
          throw new TypeError('RemoteData case not matched')
      }
    }

export const map = <T, D>(f: (a: T) => D, fa: RemoteData<T>): RemoteData<D> =>
  isSuccess(fa) ? success(f(fa.data)) : fa

interface CompleteDataMatcher<T, D> {
  [Tags.Initialized]: () => T
  [Tags.Pending]: () => T
  [Tags.Failure]: (error: ApolloError) => T
  [Tags.Success]: (data: D) => T
}

interface PartialDataMatcher<T, D> {
  [Tags.Initialized]?: () => T
  [Tags.Pending]?: () => T
  [Tags.Failure]?: (error: ApolloError) => T
  [Tags.Success]?: (data: D) => T
  [Tags._]: () => T
}

type Matcher<T, D> = CompleteDataMatcher<T, D> | PartialDataMatcher<T, D>

const isComplete = <T, D>(
  matcher: Matcher<T, D>
): matcher is CompleteDataMatcher<T, D> =>
    matcher[Tags.Initialized] !== undefined &&
  matcher[Tags.Pending] !== undefined &&
  matcher[Tags.Failure] !== undefined &&
  matcher[Tags.Success] !== undefined

export const match = <T, D>(rd: RemoteData<D>, matcher: Matcher<T, D>): T => {
  if (isComplete(matcher)) {
    return fold<T, D>(
      matcher[Tags.Initialized],
      matcher[Tags.Pending],
      matcher[Tags.Failure],
      matcher[Tags.Success]
    )(rd)
  }
  switch (rd.tag) {
    case Tags.Initialized: {
      const initialized = matcher[rd.tag]
      if (initialized !== undefined) {
        return initialized()
      } else {
        return matcher[Tags._]()
      }
    }
    case Tags.Pending: {
      const pending = matcher[rd.tag]
      if (pending !== undefined) {
        return pending()
      } else {
        return matcher[Tags._]()
      }
    }
    case Tags.Failure: {
      const failure = matcher[rd.tag]
      if (failure !== undefined) {
        return failure(rd.error)
      } else {
        return matcher[Tags._]()
      }
    }
    case Tags.Success: {
      const success = matcher[rd.tag]
      if (success !== undefined) {
        return success(rd.data)
      } else {
        return matcher[Tags._]()
      }
    }
    default:
      throw new TypeError('RemoteData case not matched')
  }
}
