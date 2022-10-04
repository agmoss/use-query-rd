import { useQueryRd, QueryResultWithRemoteData } from '../index'
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

jest.mock('../index', () => ({
  useQueryRd: jest.fn()
}))

describe('<yourFunction>', () => {
  let result: Partial<
  QueryResultWithRemoteData<MyDataType>
  >

  beforeEach(() => {
    result = {
      data: null,
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
      if (res._rd.tag === 'Success') {
        expect(res._rd.data.data).toEqual('sample')
      } else {
        throw Error('should be success')
      }
    })
  })
})
