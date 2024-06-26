import { PrismaClient, User } from "@prisma/client"
import { UserModelMapper } from "../../user-model.mapper"
import { ValidationError } from "@/shared/domain/errors/validation-error"
import { UserEntity } from "@/users/domain/entities/user.entity"
import { setupPrismaTests } from "@/shared/infrastructure/database/prisma/testing/setup-prisma-tests"
describe('UserModelMapper integrations tests', () => {
  let prismaService: PrismaClient
  let props: any

  beforeAll(async () => {
    setupPrismaTests()
    prismaService = new PrismaClient()
    await prismaService.$connect()
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    props = {
      id: '526696df-bfca-4a98-9a1b-6320fb315422',
      name: 'Test',
      email: 'gustavo@gmail.com',
      password: '1234',
      createdAt: new Date()
    }
  })
  afterAll(async () => {
    await prismaService.$disconnect()
  })

  it('should throws error when user model is invalid', async () => {
    const model: User = Object.assign({name: null})
    expect(() => UserModelMapper.toEntity(model)).toThrowError(ValidationError)
  })


  it('should convert a user model to a user entity', async () => {
    const model: User = await prismaService.user.create({
      data: props
    })
    const sut = UserModelMapper.toEntity(model)
    expect(sut).toBeInstanceOf(UserEntity)
  })
})
