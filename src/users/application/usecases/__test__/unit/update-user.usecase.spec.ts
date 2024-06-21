import { UserInMemoryRepository } from "@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository";
import { NotFoundError } from "@/shared/domain/errors/not-found-error";
import { UserEntity } from "@/users/domain/entities/user.entity";
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder";
import { UpdateUserUseCase } from "../../update-user.usecase";
import { BadRequestError } from "@/shared/application/errors/bad-request-error";

describe('GetUserUseCase unit tests', () => {
  let sut: UpdateUserUseCase.UseCase
  let repository: UserInMemoryRepository

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    sut = new UpdateUserUseCase.UseCase(repository)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fake_id', name: 'test' })).rejects.toThrow(new NotFoundError('Entity not found.'))
  })

  it('Should throws error when name not provided', async () => {
    await expect(() => sut.execute({ id: 'fake_id', name: '' })).rejects.toThrow(new BadRequestError('Name not provided.'))
  })

  it('Should update user', async () => {
    const spyUpdate = jest.spyOn(repository, 'update')
    const items = [new UserEntity(UserDataBuilder({}))]
    repository.items = items
    const result = await sut.execute({ id: items[0]._id, name: 'new name' })
    await expect(spyUpdate).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({
      id: items[0]._id,
      email: items[0].email,
      name: 'new name',
      password: items[0].password,
      createdAt: items[0].createdAt,
    })
  })
})
