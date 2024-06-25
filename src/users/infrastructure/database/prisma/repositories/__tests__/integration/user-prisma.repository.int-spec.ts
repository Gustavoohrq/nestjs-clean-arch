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
import { ConflictError } from "@/shared/domain/errors/conflict.error"
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
    await expect(() => sut.findById('fake_id')).rejects.toThrow(new NotFoundError(`UserModel not found using ID fake_id`))
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
  it('should throws error on update when entity not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(() => sut.update(entity)).rejects.toThrow(new NotFoundError(`UserModel not found using ID ${entity._id}`))
  })

  it('should update a entity ', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await prismaService.user.create({
      data: entity.toJSON()
    })
    entity.update('new name')
    await sut.update(entity)

    const output = await prismaService.user.findUnique({where: {
      id: entity._id
    }})
    expect(output.name).toBe('new name')
  })

  it('should throws error on delete when entity not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(() => sut.delete(entity._id)).rejects.toThrow(new NotFoundError(`UserModel not found using ID ${entity._id}`))
  })

  it('should delete a entity ', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await prismaService.user.create({
      data: entity.toJSON()
    })
    await sut.delete(entity._id)

    const output = await prismaService.user.findUnique({where: {
      id: entity._id
    }})
    expect(output).toBeNull()
  })

  it('should throws error when entity not found', async () => {
    await expect(() => sut.findByEmail('email@a.com')).rejects.toThrow(new NotFoundError(`UserModel not found using email email@a.com`))
  })

  it('should finds a entity by email', async () => {
    const entity = new UserEntity(UserDataBuilder({email: 'a@a.com'}))

    await prismaService.user.create({
      data: entity.toJSON()
    })
    const output = await sut.findByEmail('a@a.com')


    expect(output.toJSON().email).toBe('a@a.com')
  })


  it('should throws error when a entity found by email', async () => {
    const entity = new UserEntity(UserDataBuilder({email: 'a@a.com'}))

    await prismaService.user.create({
      data: entity.toJSON()
    })
    await expect(() => sut.emailExists('a@a.com')).rejects.toThrow(new ConflictError('Email address already used'))
  })


  it('should not find entity by email', async () => {
    expect.assertions(0)
    await sut.emailExists('a@gmail.com')
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
      const items = searchOutput.items

      expect(searchOutput).toBeInstanceOf(SearchResult)
      expect(searchOutput.total).toBe(16)
      expect(searchOutput.items.length).toBe(15)
      items.reverse().forEach((item, index) => {
        expect(`test${index + 1}@mail.com`).toBe(item.email)
      })
    })

    it('should search using filter, sort and paginate', async () => {
      const createdAt = new Date()
      const entities: UserEntity[] = []
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...UserDataBuilder({name: element}),
            createdAt: new Date(createdAt.getTime() + index)
          })
        )
      })
      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON())
      })

      const searchOutputPage1 = await sut.search(new UserRepository.SearchParams({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'test'
      }))

      expect(searchOutputPage1.items[0].toJSON().name).toEqual(entities[0].toJSON().name)
      expect(searchOutputPage1.items[1].toJSON().name).toEqual(entities[4].toJSON().name)

      const searchOutputPage2 = await sut.search(new UserRepository.SearchParams({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'test'
      }))

      expect(searchOutputPage2.items[0].toJSON().name).toEqual(entities[2].toJSON().name)

    })
  })
})
