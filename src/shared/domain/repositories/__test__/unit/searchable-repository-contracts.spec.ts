import { SearchParams } from "../../searchable-repository-contracts"

describe('Searchable Repository unit tests', () => {


  describe('SearchParams tests', () => {

    it('page prop', () => {
      const sut = new SearchParams()
      expect(sut.page).toBe(1)

      const params = [
        { page: null as any, expect: 1 },
        { page: undefined as any, expect: 1 },
        { page: '' as any, expect: 1 },
        { page: 'test' as any, expect: 1 },
        { page: 0 as any, expect: 1 },
        { page: -1 as any, expect: 1 },
        { page: 2 as any, expect: 2 },
      ]
      params.forEach((i) => {
        expect(new SearchParams({ page: i.page }).page).toEqual(i.expect)
      })
    })

    it('perPage prop', () => {
      const sut = new SearchParams()
      expect(sut.perPage).toBe(15)

      const params = [
        { perPage: null as any, expect: 15 },
        { perPage: undefined as any, expect: 15 },
        { perPage: '' as any, expect: 15 },
        { perPage: 'test' as any, expect: 15 },
        { perPage: 0 as any, expect: 15 },
        { perPage: -1 as any, expect: 15 },
        { perPage: 2 as any, expect: 2 },
      ]
      params.forEach((i) => {
        expect(new SearchParams({ perPage: i.perPage }).perPage).toEqual(i.expect)
      })
    })

    it('sort prop', () => {
      const sut = new SearchParams()
      expect(sut.sort).toBeNull()

      const params = [
        { sort: null as any, expect: null },
        { sort: undefined as any, expect: null },
        { sort: '' as any, expect: null },
        { sort: 'test', expect: 'test' },
        { sort: 0 as any, expect: '0' },
        { sort: -1 as any, expect: '-1' },
        { sort: 2 as any, expect: '2' },
      ]
      params.forEach((i) => {
        expect(new SearchParams({ sort: i.sort }).sort).toEqual(i.expect)
      })
    })
    it('sortDir prop', () => {
      let sut = new SearchParams()
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: null })
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: undefined })
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: '' })
      expect(sut.sortDir).toBeNull()

      const params = [
        { sortDir: null as any, expect: 'desc' },
        { sortDir: undefined as any, expect: 'desc' },
        { sortDir: '' as any, expect: 'desc' },
        { sortDir: 'test', expect: 'desc'  },
        { sortDir: 0 as any, expect: 'desc'  },
        { sortDir: -1 as any, expect: 'desc'  },
        { sortDir: 2 as any, expect: 'desc'  },
        { sortDir: 'desc'  as any, expect: 'desc'  },
        { sortDir: 'asc' as any, expect: 'asc'  },
        { sortDir: 'ASC' as any, expect: 'asc'  },
        { sortDir: 'DESC'  as any, expect: 'desc'  },

      ]
      params.forEach((i) => {
        expect(new SearchParams({ sort: 'field', sortDir: i.sortDir }).sortDir).toEqual(i.expect)
      })
    })

    it('filter prop', () => {
      const sut = new SearchParams()
      expect(sut.filter).toBeNull()

      const params = [
        { filter: null as any, expect: null },
        { filter: undefined as any, expect: null },
        { filter: '' as any, expect: null },
        { filter: 'test', expect: 'test' },
        { filter: 0 as any, expect: '0' },
        { filter: -1 as any, expect: '-1' },
        { filter: 2 as any, expect: '2' },
      ]
      params.forEach((i) => {
        expect(new SearchParams({ filter: i.filter }).filter).toEqual(i.expect)
      })
    })
  })
})
