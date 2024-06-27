import { instanceToPlain } from 'class-transformer';
import { UserCollectionPresenter } from '../../user.collection.presenter';
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter';
import { UserPresenter } from '../../user.presenter';

describe('UserCollectionPresenter unit tests', () => {
  const createdAt = new Date()
  let props = {
    id: "587da622-3540-499e-9ab0-cd810e1e64c0",
    name: 'test name',
    email: 'a@a.com',
    createdAt,
    password: 'fake'

  }


  describe('constructor', () => {
    it('should set values', () => {
      const sut = new UserCollectionPresenter({
        items: [props],
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1
      })
      expect(sut.meta).toBeInstanceOf(PaginationPresenter)
      expect(sut.meta).toStrictEqual(new PaginationPresenter({
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1
      }))
      expect(sut.data).toStrictEqual([new UserPresenter(props)])
    });
  });
  it('should presenter data', () => {
    let sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1
    })
    let output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: "587da622-3540-499e-9ab0-cd810e1e64c0",
          name: 'test name',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        }
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1
      }
    })


    sut = new UserCollectionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '1' as any
    })
    output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: "587da622-3540-499e-9ab0-cd810e1e64c0",
          name: 'test name',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        }
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1
      }
    })
  });

});
