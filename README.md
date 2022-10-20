# `use-query-rd` [![NPM](https://img.shields.io/npm/v/use-query-rd?style=for-the-badge)](https://www.npmjs.com/package/use-query-rd)

> A drop in replacement for apollo client's `useQuery` hook with a return type that mimics Elm's RemoteData ADT

```typescript
import React from 'react';
import { useQueryRd, fold } from 'use-query-rd';

const ContainerComponent = (): JSX.Element =>
  fold(
    () => <Skeleton />,
    () => <Skeleton />,
    (error) => <MyErrorScreen error={err.error} />,
    (data: MyDataType) => <MySuccessScreen data={data.data.myData} />
  )(useQueryRd<{ data: MyDataType[] }>(GET_DATA_QUERY)._rd)


export default ContainerComponent;
```
