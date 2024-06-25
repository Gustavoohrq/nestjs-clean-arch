import { PrismaClient } from "@prisma/client"
import { setupPrismaTests } from "@/shared/infrastructure/database/prisma/testing/setup-prisma-tests"
import { SignupUseCase } from "../../signup.usecase"
import { UserPrismaRepository } from "@/users/infrastructure/database/prisma/repositories/user-prisma.repository"
import { HashProvider } from "@/shared/application/providers/hash-provider"
import { Test, TestingModule } from "@nestjs/testing"
import { DatabaseModule } from "@/shared/infrastructure/database/database.module"
import { BcryptHashProvider } from "@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider"
import { DeleteUserUseCase } from "../../delete-user.usecase"
import { NotFoundError } from "@/shared/domain/errors/not-found-error"
import { UserEntity } from "@/users/domain/entities/user.entity"
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder"
describe('DeleteUserUseCase integrations tests', () => {
  const prismaService = new PrismaClient()
  let sut: DeleteUserUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    jest.setTimeout(60000)
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    sut = new DeleteUserUseCase.UseCase(repository)
    await prismaService.user.deleteMany()
  })
  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() => sut.execute({ id: '526696df-bfca-4a98-9a1b-6320fb315422' })).rejects.toThrow(new NotFoundError('UserModel not found using ID 526696df-bfca-4a98-9a1b-6320fb315422'))
  })
  it('should delete a user ', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await prismaService.user.create({
      data: entity.toJSON()
    })
    await sut.execute({ id: entity._id })

    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id
      }
    })
    expect(output).toBeNull()
    const models = await prismaService.user.findMany()
    expect(models).toHaveLength(0)
  })

})
