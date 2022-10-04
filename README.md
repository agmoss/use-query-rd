# `use-query-rd` [![NPM](https://img.shields.io/npm/v/use-query-rd?style=for-the-badge)](https://www.npmjs.com/package/use-query-rd)

> A drop in replacement for apollo client's `useQuery` hook with a return type that mimics Elm's RemoteData ADT

```typescript
import React from 'react';
import { match } from 'ts-pattern';

const ContainerComponent = (): JSX.Element =>
  match(useQueryRd<{ data: MyDataType[] }>(GET_DATA_QUERY)._rd)
    .with({ tag: "Initialized" }, () => <Skeleton />)
    .with({ tag: "Pending" }, () => <Skeleton />)
    .with({ tag: "Success" }, (data) => <MySuccessScreen data={data.data.myData} />)
    .with({ tag: "Failure" }, (err) => <MyErrorScreen error={err.error} />).exhaustive()


export default ContainerComponent;
```
