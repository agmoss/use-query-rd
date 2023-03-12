# `use-query-rd` [![NPM](https://img.shields.io/npm/v/use-query-rd?style=for-the-badge)](https://www.npmjs.com/package/use-query-rd)

> A drop in replacement for apollo client's `useQuery` hook with a return type that mimics Elm's RemoteData ADT

- [`use-query-rd` ](#use-query-rd-)
  - [Motivation](#motivation)
  - [Inspo](#inspo)
  - [useQueryRd](#usequeryrd)
  - [Pattern Matching](#pattern-matching)
    - [match](#match)
      - [Signature](#signature)
      - [Example](#example)
    - [fold](#fold)
      - [Signature](#signature-1)
      - [Example](#example-1)
  - [Mapping](#mapping)
    - [map](#map)
      - [Signature](#signature-2)
      - [Example](#example-2)
    - [andMap](#andmap)
      - [Signature](#signature-3)
    - [map2](#map2)
      - [Signature](#signature-4)
  - [Constructors](#constructors)
    - [initialized](#initialized)
      - [Signature](#signature-5)
    - [pending](#pending)
      - [Signature](#signature-6)
    - [failure](#failure)
      - [Signature](#signature-7)
    - [success](#success)
      - [Signature](#signature-8)
  - [Refinements](#refinements)
    - [isInitialized](#isinitialized)
      - [Signature](#signature-9)
    - [isLoading](#isloading)
      - [Signature](#signature-10)
    - [isFailure](#isfailure)
      - [Signature](#signature-11)
    - [isSuccess](#issuccess)
      - [Signature](#signature-12)

## Motivation

Tagging network bound data with the state of the request makes _impossible states impossible_. This is highly desirable as data requests and the subsequent handling of fetched data is a common cause of logic and runtime errors in apps.

## Inspo

- [RemoteData for Elm](https://package.elm-lang.org/packages/krisajenkins/remotedata/latest/)
- [Make Impossible States Impossible](https://kentcdodds.com/blog/make-impossible-states-impossible)

## useQueryRd

This is a `@apollo/client` specific implementation of RemoteData. `useQueryRd` is a wrapper around `useQuery` that returns one additional property, `_rd`. `_rd` is a `RemoteData` that is generic across `Success`. Failure is not generic as it will always be `ApolloError`.

> useQuery

```typescript
function useQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>
): QueryResult<TData, TVariables>;
```

> useQueryRd

```typescript
const useQueryRd: <TData, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables> | undefined
) => QueryResult<TData, TVariables> & {
  _rd: RemoteData<TData>;
};
```

## Pattern Matching

### match

Takes a matcher and a `RemoteData` value. The matcher attributes the RemoteData value to a case and applies the matched function. `match` support partial matching by supplying a default tag of `_`. Any RemoteData states no supplied subsequent to the `_` will fallback to the function supplied at `_`. A common use case for this is combining the functions for `Initialized` and `Pending` into one "loading" case.

#### Signature

```typescript
const match: <T, D>(rd: RemoteData<D>, matcher: Matcher<T, D>) => T;
```

#### Example

```typescript
import React from "react";
import { useQueryRd, match } from "use-query-rd";

const ContainerComponent = (): JSX.Element =>
  match(useQueryRd<{ data: MyDataType[] }>(GET_DATA_QUERY)._rd, {
    _: <Skeleton />,
    Failure: (error) => <MyErrorScreen error={err.error} />,
    Success: (data: MyDataType) => <MySuccessScreen data={data.data.myData} />,
  });

export default ContainerComponent;
```

### fold

Takes four functions corresponding to the four tags and a `RemoteData` value. The function corresponding to the tag of the value is applied.

#### Signature

```typescript
const fold: <T, D>(
  initialized: () => T,
  pending: () => T,
  failure: (error: ApolloError) => T,
  success: (data: D) => T
) => (_: RemoteData<D>) => T;
```

#### Example

```typescript
import React from "react";
import { useQueryRd, fold } from "use-query-rd";

const ContainerComponent = (): JSX.Element =>
  fold(
    () => <Skeleton />,
    () => <Skeleton />,
    (error) => <MyErrorScreen error={err.error} />,
    (data: MyDataType) => <MySuccessScreen data={data.data.myData} />
  )(useQueryRd<{ data: MyDataType[] }>(GET_DATA_QUERY)._rd);

export default ContainerComponent;
```

## Mapping

### map

Apply the supplied function to the `RemoteData` if tag is `Success`, otherwise return original `RemoteData`

#### Signature

```typescript
const map: <T, D>(f: (a: T) => D, fa: RemoteData<T>) => RemoteData<D>;
```

#### Example

```typescript
const myInitialData = useSomeData()._rd;

const formattedData = map((res: MyResultType) => {
  const manipulatedData = doSomething(res);
  return {
    myManipulatedData: manipulatedData,
  };
}, myInitialData);
```

### andMap

Put the results of two RemoteData calls together.

[@see](https://github.com/krisajenkins/remotedata/blob/6.0.1/src/RemoteData.elm#L361)

#### Signature

```typescript
const andMap: <RD1, RD2>(
  rd1: RemoteData<RD1>,
  rd2: RemoteData<(d: RD1) => RD2>
) => RemoteData<RD2>;
```

### map2

Combine two remote data sources with the given function. The result will succeed when (and if) both sources succeed.

#### Signature

```typescript
const map2: <D, D2, D3>(
  f: (d: D) => (d2: D2) => D3,
  rd1: RemoteData<D>,
  rd2: RemoteData<D2>
) => RemoteData<D3>;
```

## Constructors

### initialized

Constructs a new `RemoteData` with a tag of `Initialized`. This represents a network request yet to be made.

#### Signature

```typescript
const initialized: <T = never>() => RemoteData<T>;
```

### pending

Constructs a new `RemoteData` with a tag of `Pending`. This represents an in flight network request.

#### Signature

```typescript
const pending: <T = never>() => RemoteData<T>;
```

### failure

Constructs a new `RemoteData` with a tag of `Failure` and an `ApolloError`. While `Failure` is usually generic in `_RemoteData_`, `useQuery` from `@apollo/client` represents all network failures as `ApolloError`. Thus, `Failure` is strictly typed for `ApolloError`.

#### Signature

```typescript
const failure: <T = never>(error: ApolloError) => RemoteData<T>;
```

### success

Constructs a new `RemoteData` with a tag of `Success`. This represents a resolved network requests with a valid response.

#### Signature

```typescript
const success: <D = never>(data: D) => RemoteData<D>;
```

## Refinements

### isInitialized

Returns `true` if the rd is an instance of `Initialized`, `false` otherwise

#### Signature

```typescript
const isInitialized: <D = never>(rd: RemoteData<D>) => rd is Pending;
```

### isLoading

Returns `true` if the rd is an instance of `Pending`, `false` otherwise

#### Signature

```typescript
const isLoading: <D = never>(rd: RemoteData<D>) => rd is Pending;
```

### isFailure

Returns `true` if the rd is an instance of `Failure`, `false` otherwise

#### Signature

```typescript
const isFailure: <D = never>(rd: RemoteData<D>) => rd is Failure;
```

### isSuccess

Returns `true` if the rd is an instance of `Success`, `false` otherwise

#### Signature

```typescript
const isSuccess: <D = never>(rd: RemoteData<D>) => rd is Success<D>;
```
