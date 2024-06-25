import { PrismaClient, User } from "@prisma/client"
import { setupPrismaTests } from "@/shared/infrastructure/database/prisma/testing/setup-prisma-tests"
import { UserPrismaRepository } from "../../user-prisma.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { DatabaseModule } from "@/shared/infrastructure/database/database.module"
import { NotFoundError } from "@/shared/domain/errors/not-found-error"
import { UserEntity } from "@/users/domain/entities/user.entity"
import { UserDataBuilder } from "@/users/domain/testing/helpers/user-data-builder"
import { UserRepository } from "@/users/domain/repositories/user.repository"
import { SearchResult } from "@/shared/domain/repositories/searchable-repository-contracts"
describe('UserPrismaRepository integrations tests', () => {
  const prismaService = new PrismaClient()
  let sut: UserPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
  })

  beforeEach(async () => {
    sut = new UserPrismaRepository(prismaService as any)
    await prismaService.user.deleteMany()
  })

  it('should throws error when entity not found', async () => {
    expect(() => sut.findById('fake_id')).rejects.toThrow(new NotFoundError(`UserModel not found using ID fake_id`))
  })

  it('should finds a entity by id', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    const newUser = await prismaService.user.create({
      data: entity.toJSON()
    })
    const output = await sut.findById(newUser.id)
    expect(output.toJSON().name).toEqual(entity.toJSON().name)
  })
  it('should inset a new entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await sut.insert(entity)
    const result = await prismaService.user.findUnique({
      where: { id: entity._id }
    })
    expect(result.name).toEqual(entity.toJSON().name)
  })

  it('should returns all users', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON()
    })
    const entities = await sut.findAll()
    expect(entities).toHaveLength(1)
    entities.map(item => expect(item.toJSON().name).toStrictEqual(entity.toJSON().name))
  })

  describe('search method tests', () => {
    it('should apply only pagination when the other params are null', async () => {
      const createdAt = new Date()
      const entities: UserEntity[] = []
      const arrange = Array(16).fill(UserDataBuilder({}))
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

      const searchOutput = await sut.search(new UserRepository.SearchParams())


      expect(searchOutput).toBeInstanceOf(SearchResult)
      expect(searchOutput.total).toBe(16)
      expect(searchOutput.items.length).toBe(15)
    })
  })
})
