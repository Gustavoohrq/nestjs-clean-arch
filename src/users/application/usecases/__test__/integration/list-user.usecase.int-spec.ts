import { PrismaClient } from "@prisma/client"
import { setupPrismaTests } from "@/shared/infrastructure/database/prisma/testing/setup-prisma-tests"
import { UserPrismaRepository } from "@/users/infrastructure/database/prisma/repositories/user-prisma.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { DatabaseModule } from "@/shared/infrastructure/database/database.module"
import { UserEntity } from "@/users/domain/entities/user.entity"
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder"
import { ListUsersUseCase } from "../../list-user.usecase"
describe('ListUsersUseCase integrations tests', () => {
  const prismaService = new PrismaClient()
  let sut: ListUsersUseCase.UseCase
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
    sut = new ListUsersUseCase.UseCase(repository)
    await prismaService.user.deleteMany()
  })
  afterAll(async () => {
    await module.close()
  })


  it('should returns the users ordered by createdAt', async () => {
    const createdAt = new Date()
    const entities: UserEntity[] = []
    const arrange = Array(3).fill(UserDataBuilder({}))
    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...element,
          email: `test${index}@mail.com`,
          createdAt: new Date(createdAt.getTime() + index)
        })
      )
    })
    await prismaService.user.createMany({
      data: entities.map(item => item.toJSON())
    })
    const output = await sut.execute({})
    expect(output).toStrictEqual({
      items: entities.reverse().map(item => item.toJSON()),
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1
    })
  })

})
