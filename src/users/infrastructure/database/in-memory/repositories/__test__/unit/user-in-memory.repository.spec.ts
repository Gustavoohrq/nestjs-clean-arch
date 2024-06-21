import { UserInMemoryRepository } from "../../user-in-memory.repository";
import { UserEntity } from "@/users/domain/entities/user.entity";
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder";
import { NotFoundError } from "@/shared/domain/errors/not-found-error";
import { ConflictError } from "@/shared/domain/errors/conflict.error";


describe('UserInMemoryRepository unit tests', () => {
  let sut: UserInMemoryRepository

  beforeEach(() => {
    sut = new UserInMemoryRepository()
  })

  it('Should throw error when not found - findByEmail()', async () => {
    await expect(sut.findByEmail('email@gmail.com')).rejects.toThrow(new NotFoundError('Entity not found using email email@gmail.com'))
  })

  it('Should find a entity by email - findByEmail()', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await sut.insert(entity)
    const result = await sut.findByEmail(entity.email)
    expect(result.toJSON()).toStrictEqual(entity.toJSON())
  })

  it('Should throw error when not found - emailExists()', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await sut.insert(entity)
    await expect(sut.emailExists(entity.email)).rejects.toThrow(new ConflictError(`Email adress already using.`))
  })

  it('Should not exist - emailExists()', async () => {
    expect.assertions(0)
    await sut.emailExists('a@a.com')
  })

  it('Should no filter items when filter object is null - applyFilter()', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await sut.insert(entity)
    const result = await sut.findAll()
    const spyFilter = jest.spyOn(result, 'filter')
    const itemsFiltered = await sut['applyFilter'](result, null)
    expect(spyFilter).not.toHaveBeenCalled()
    expect(itemsFiltered).toStrictEqual(result)
  })

  it('Should name field using filter param - applyFilter()', async () => {
    const items = [
      new UserEntity(UserDataBuilder({name: 'Test'})),
      new UserEntity(UserDataBuilder({name: 'TEST'})),
      new UserEntity(UserDataBuilder({name: 'fake'})),
    ]
    const spyFilter = jest.spyOn(items, 'filter')
    const itemsFiltered = await sut['applyFilter'](items, 'TEST')
    expect(spyFilter).toHaveBeenCalled()
    expect(itemsFiltered).toStrictEqual([items[0], items[1]])
  })

  it('Should sort by createdAt when sort params is null - applySort()', async () => {
    const createdAt = new Date()
    const items = [
      new UserEntity(UserDataBuilder({name: 'Test', createdAt})),
      new UserEntity(UserDataBuilder({name: 'TEST', createdAt: new Date(createdAt.getTime() + 1)})),
      new UserEntity(UserDataBuilder({name: 'fake', createdAt: new Date(createdAt.getTime() + 2)})),
    ]
    const itemsSorted = await sut['applySort'](items, null, null)
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]])
  })

  it('Should sort by name field - applySort()', async () => {
    const items = [
      new UserEntity(UserDataBuilder({name: 'c'})),
      new UserEntity(UserDataBuilder({name: 'd'})),
      new UserEntity(UserDataBuilder({name: 'a'})),
    ]
    let itemsSorted = await sut['applySort'](items, 'name', 'asc')
    expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]])

    itemsSorted = await sut['applySort'](items, 'name', null)
    expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]])
  })
})
