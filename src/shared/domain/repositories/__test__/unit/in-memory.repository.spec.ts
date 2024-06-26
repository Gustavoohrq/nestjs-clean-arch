import { Entity } from "@/shared/domain/entities/entity";
import { InMemoryRepository } from "../../in-memory.repository";
import { NotFoundError } from "@/shared/domain/errors/not-found-error";

type StubEntityProps = {
  name: string;
  price: number;
}
class StubEntity extends Entity <StubEntityProps> {}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}


describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository

  beforeEach(() => {
    sut = new StubInMemoryRepository()
  })

  it('Should items a new entity', async () => {
    const entity = new StubEntity({name: 'teste', price: 10})
    await sut.insert(entity)
    expect(entity.toJSON()).toStrictEqual(sut.items[0].toJSON())
  })

  it('Should throw error when entity not found', async () => {
    await expect(sut.findById('fake_id')).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should find a entity by id', async () => {
    const entity = new StubEntity({name: 'teste', price: 10})
    await sut.insert(entity)
    const result = await sut.findById(entity._id)
    expect(entity.toJSON()).toStrictEqual(result.toJSON())
  })

  it('Should find all entities', async () => {
    const entity = new StubEntity({name: 'teste', price: 10})
    await sut.insert(entity)
    const result = await sut.findAll()
    expect([entity]).toStrictEqual(result)
  })

  it('Should throw error on update when entity not found', async () => {
    const entity = new StubEntity({name: 'teste', price: 10})

    await expect(sut.update(entity)).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should update an entity by id', async () => {
    const entity = new StubEntity({name: 'teste', price: 10})
    await sut.insert(entity)
    const entityUpdate = new StubEntity(
     {name: 'updated', price: 22}, entity._id
    )
    await sut.update(entityUpdate)
    expect(entityUpdate.toJSON()).toStrictEqual(sut.items[0].toJSON())
  })

  it('Should throw error when entity not found', async () => {
    await expect(sut.delete('fake_id')).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should delte an entity by id', async () => {
    const entity = new StubEntity({name: 'teste', price: 10})
    await sut.insert(entity)
    await sut.delete(entity._id)
    expect(sut.items).toHaveLength(0)
  })
})
