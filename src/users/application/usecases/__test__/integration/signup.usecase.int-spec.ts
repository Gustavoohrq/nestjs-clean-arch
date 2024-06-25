import { PrismaClient, User } from "@prisma/client"
import { ValidationError } from "@/shared/domain/errors/validation-error"
import { UserEntity } from "@/users/domain/entities/user.entity"
import { setupPrismaTests } from "@/shared/infrastructure/database/prisma/testing/setup-prisma-tests"
import { SignupUseCase } from "../../signup.usecase"
import { UserPrismaRepository } from "@/users/infrastructure/database/prisma/repositories/user-prisma.repository"
import { HashProvider } from "@/shared/application/providers/hash-provider"
import { Test, TestingModule } from "@nestjs/testing"
import { DatabaseModule } from "@/shared/infrastructure/database/database.module"
import { BcryptHashProvider } from "@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider"
describe('SignupUseCase integrations tests', () => {
  const prismaService = new PrismaClient()
  let sut: SignupUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let hashProvider: HashProvider

  beforeAll(async () => {
    setupPrismaTests()
    jest.setTimeout(60000)
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcryptHashProvider()
  })

  beforeEach(async () => {
    sut = new SignupUseCase.UseCase(repository, hashProvider)
    await prismaService.user.deleteMany()
  })
  afterAll(async () => {
    await module.close()
  })

  it('should create a user', async () => {
    const props: SignupUseCase.Input = {
      name: 'test',
      email: 'a@a.com',
      password: '1234'
    }
    const output = await sut.execute(props)
    expect(output.id).toBeDefined()
    expect(output.createdAt).toBeDefined()
  })


})
