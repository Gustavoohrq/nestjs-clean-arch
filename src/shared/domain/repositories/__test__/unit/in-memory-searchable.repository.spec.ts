import { Entity } from "@/shared/domain/entities/entity";
import { SearchParams, SearchResult } from "../../searchable-repository-contracts";
import { InMemorySearchableRepository } from "../../in-memory-searchable.repository";

type StubEntityProps = {
  name: string;
  price: number;
}
class StubEntity extends Entity<StubEntityProps> { }

class StubInMemorySearchableIRepository extends InMemorySearchableRepository<StubEntity> {
  sortableFields: string[] = ['name']
  protected async applyFilter(items: StubEntity[], filter: string | null): Promise<StubEntity[]> {
    if (!filter) return items
    return items.filter(item => {
      return item.props.name.toLowerCase().includes(filter.toLowerCase())
    })
  }
}


describe('InMemorySearchableIRepository unit tests', () => {
  let sut: StubInMemorySearchableIRepository

  beforeEach(() => {
    sut = new StubInMemorySearchableIRepository()
  })

  describe('applyFilter method', () => {
    it('should filter items when filter params is null', async () => {
      const items = [new StubEntity({ name: 'name', price: 10 })]
      const spyFilterMethod = jest.spyOn(items, 'filter')
      const itemsFiltered = await sut['applyFilter'](items, null)
      expect(itemsFiltered).toStrictEqual(items)
      expect(spyFilterMethod).not.toHaveBeenCalled()
    })

    it('should filter using a filter params', async () => {
      const items = [new StubEntity({ name: 'test', price: 10 }), new StubEntity({ name: 'TEST', price: 10 }), new StubEntity({ name: 'fake', price: 10 })]
      const spyFilterMethod = jest.spyOn(items, 'filter')
      let itemsFiltered = await sut['applyFilter'](items, 'TEST')
      expect(itemsFiltered).toStrictEqual([items[0], items[1]])
      expect(spyFilterMethod).toHaveBeenCalledTimes(1)


      itemsFiltered = await sut['applyFilter'](items, 'test')
      expect(itemsFiltered).toStrictEqual([items[0], items[1]])
      expect(spyFilterMethod).toHaveBeenCalledTimes(2)

      itemsFiltered = await sut['applyFilter'](items, 'no-filter')
      expect(itemsFiltered).toHaveLength(0)
      expect(spyFilterMethod).toHaveBeenCalledTimes(3)
    })
  })

  describe('applySort method', () => {

    it('should no sort item', async () => {
      const items = [new StubEntity({ name: 'test', price: 10 }), new StubEntity({ name: 'TEST', price: 10 })]
      let itemsSorted = await sut['applySort'](items, null, null)
      expect(itemsSorted).toStrictEqual(items)

      itemsSorted = await sut['applySort'](items, 'price', 'asc')
      expect(itemsSorted).toStrictEqual(items)

    })

    it('should sort item', async () => {
      const items = [new StubEntity({ name: 'b', price: 10 }), new StubEntity({ name: 'a', price: 10 }), new StubEntity({ name: 'c', price: 10 })]
      let itemsSorted = await sut['applySort'](items, 'name', 'asc')
      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]])

      itemsSorted = await sut['applySort'](items, 'name', 'desc')
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]])

    })
  })


  describe('applyPaginate method', () => {
    it('should paginate items', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'c', price: 10 }),
        new StubEntity({ name: 'd', price: 10 }),
        new StubEntity({ name: 'e', price: 10 })
      ]
      let itemsPaginated = await sut['applyPaginate'](items, 1, 2)
      expect(itemsPaginated).toStrictEqual([items[0], items[1]])

      itemsPaginated = await sut['applyPaginate'](items, 2, 2)
      expect(itemsPaginated).toStrictEqual([items[2], items[3]])

      itemsPaginated = await sut['applyPaginate'](items, 3, 2)
      expect(itemsPaginated).toStrictEqual([items[4]])

      itemsPaginated = await sut['applyPaginate'](items, 4, 2)
      expect(itemsPaginated).toStrictEqual([])

    })
  })

  describe('search method', () => {
    it('should apply only pagination when the other params are null', async () => {
      const entity = new StubEntity({ name: 'a', price: 10 })
      const items = Array(16).fill(entity)
      sut.items = items

      const params = await sut.search(new SearchParams())
      expect(params).toStrictEqual(new SearchResult({
        items: Array(15).fill(entity),
        total: 16,
        currentPage: 1,
        perPage: 15,
        sort: null,
        sortDir: null,
        filter: null
      }))

    })

    it('should apply paginate and filter', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 10 }),
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'TeSt', price: 10 }),
      ]
      sut.items = items

      let params = await sut.search(new SearchParams({
        page: 1,
        perPage: 2,
        filter: 'TEST'
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[0], items[2]],
        total: 3,
        currentPage: 1,
        perPage: 2,
        sort: null,
        sortDir: null,
        filter: 'TEST'
      }))

      params = await sut.search(new SearchParams({
        page: 2,
        perPage: 2,
        filter: 'TEST'
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[3]],
        total: 3,
        currentPage: 2,
        perPage: 2,
        sort: null,
        sortDir: null,
        filter: 'TEST'
      }))
    })

    it('should apply paginate and sort', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'd', price: 10 }),
        new StubEntity({ name: 'e', price: 10 }),
        new StubEntity({ name: 'c', price: 10 }),
      ]
      sut.items = items

      let params = await sut.search(new SearchParams({
        page: 1,
        perPage: 2,
        sort: 'name'
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[3], items[2]],
        total: 5,
        currentPage: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'desc',
        filter: null
      }))

      params = await sut.search(new SearchParams({
        page: 2,
        perPage: 2,
        sort: 'name'
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[4], items[0]],
        total: 5,
        currentPage: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'desc',
        filter: null
      }))

      params = await sut.search(new SearchParams({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[1], items[0]],
        total: 5,
        currentPage: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: null
      }))

      params = await sut.search(new SearchParams({
        page: 3,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[3]],
        total: 5,
        currentPage: 3,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: null
      }))

    })

    it('should search using paginate, sort and filter', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 10 }),
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'e', price: 10 }),
        new StubEntity({ name: 'TeSt', price: 10 }),
      ]
      sut.items = items

      let params = await sut.search(new SearchParams({
        page: 1,
        perPage: 2,
        sort: 'name',
        filter: 'TEST'
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[0], items[4]],
        total: 3,
        currentPage: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'desc',
        filter: 'TEST'
      }))

       params = await sut.search(new SearchParams({
        page: 2,
        perPage: 2,
        sort: 'name',
        filter: 'TEST'
      }))
      expect(params).toStrictEqual(new SearchResult({
        items: [items[2]],
        total: 3,
        currentPage: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'desc',
        filter: 'TEST'
      }))

    })
  })


})
