import { Entity } from "@/shared/domain/entities/entity";
import { UserInMemoryRepository } from "../../user-in-memory.repository";
import { UserEntity } from "@/users/domain/entities/user.entity";
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder";
import { NotFoundError } from "@/shared/domain/erros/not-found-error";
import { ConflictError } from "@/shared/domain/erros/conflict.error";

type StubEntityProps = {
  name: string;
  price: number;
}
class StubEntity extends Entity<StubEntityProps> { }



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
})
