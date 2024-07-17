import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest'
import { UsersController } from '../../users.controller';
import { instanceToPlain } from 'class-transformer';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UserController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository.Repository
  const prismaService = new PrismaClient()
  let entity: UserEntity

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [EnvConfigModule, UsersModule, DatabaseModule.forTest(prismaService)]
    }).compile()
    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()
    repository = module.get<UserRepository.Repository>('UserRepository')
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
  })

  describe('GET /users', () => {

    it('should return the users order by createdAt', async () => {
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

      const searchParams = {}
      const queryParams = new URLSearchParams(searchParams as any).toString()

      const res = await request(app.getHttpServer())
        .get(`/users/${queryParams}`)
        .expect(200)
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta'])
      expect(res.body).toStrictEqual({
        data: [...entities].reverse().map(item => instanceToPlain(UsersController.userToResponse(item))),
        meta: { currentPage: 1, perPage: 15, lastPage: 1, total: 3 }
      })

    });

    it('should return the users order by createdAt', async () => {
      const entities: UserEntity[] = []
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']
      arrange.forEach((element, index) => {
        entities.push(
          new UserEntity({
            ...UserDataBuilder({}),
            name: element,
            email: `test${index}@mail.com`,
          })
        )
      })
      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON())
      })

      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST'
      }
      const queryParams = new URLSearchParams(searchParams as any).toString()

      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .expect(200)
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta'])
      expect(res.body).toStrictEqual({
        data: [entities[0].toJSON(), entities[4].toJSON()].map(item => instanceToPlain(UsersController.userToResponse(item))),
        meta: { currentPage: 1, perPage: 2, lastPage: 2, total: 3 }
      })

    });

    it('should return a error with 422 code when the query params is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/?fakeId=10`)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual(['property fakeId should not exist'])
    });


  });
});
