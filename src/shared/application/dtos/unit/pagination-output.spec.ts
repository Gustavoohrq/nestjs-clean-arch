import { SearchResult } from "@/shared/domain/repositories/searchable-repository-contracts";
import { UserEntity } from "@/users/domain/entities/user.entity";
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder";
import { PaginationOutputMapper } from "../pagination-output";


describe('PaginationOutputMapper unit tests', () => {


  it('Should convert a SearchResult in output', async () => {
    const result = new SearchResult({
      items: ['fake'] as any,
      total: 1,
      currentPage: 1,
      perPage: 1,
      sort: '',
      sortDir: '',
      filter: 'fake'
    })
    const sut = PaginationOutputMapper.toOutput(result.items, result)
    expect(sut).toStrictEqual({
      items: ['fake'],
      total: 1,
      currentPage:1,
      lastPage: 1,
      perPage: 1
    })
  })

})
