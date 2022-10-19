import { fold } from '../src/rd'
import { useQueryRd, QueryResultWithRemoteData } from '../src/useQueryRd'
import gql from 'graphql-tag'

interface MyDataType {
  data: string
}

const GET_DATA_QUERY = gql`
  query getData($opt: String!) {
    getData(opt: $opt) {
      data
    }
  }
`

jest.mock('../src/useQueryRd', () => ({
  useQueryRd: jest.fn()
}))

describe('useQueryRd', () => {
  let result: Partial<
  QueryResultWithRemoteData<MyDataType>
  >

  beforeEach(() => {
    result = {
      data: undefined,
      loading: false,
      error: undefined,
      _rd: {
        tag: 'Initialized'
      }
    };
    (useQueryRd as jest.Mock).mockImplementationOnce(() => result)
  })

  describe('setup', () => {
    it('calls the useQueryRd hook', () => {
      useQueryRd<MyDataType>(GET_DATA_QUERY)
      expect(useQueryRd).toHaveBeenCalledTimes(1)
    })
  })

  describe('useQueryRd hook return', () => {
    it('returns the value for _rd data', () => {
      result = {
        data: {
          data: 'sample'
        },
        loading: false,
        error: undefined,
        _rd: {
          tag: 'Success',
          data: {
            data: 'sample'
          }
        }
      }

      const res = useQueryRd<MyDataType>(GET_DATA_QUERY)
      expect(res._rd.tag).toEqual('Success')

      const f = fold(
        () => 'Initialized',
        () => 'Loading...',
        (error) => `Error: ${error.message}`,
        (data: MyDataType) => `This is my data: ${data.data}`
      )

      expect(f(res._rd)).toEqual('This is my data: sample')
    })
  })
})
