import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest'
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdatePasswordDto } from '../../dtos/update-password.dto';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider';

describe('UserController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository.Repository
  let updatePasswordDto: UpdatePasswordDto
  let hashProvider: HashProvider
  let entity: UserEntity

  const prismaService = new PrismaClient()

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [EnvConfigModule, UsersModule, DatabaseModule.forTest(prismaService)]
    }).compile()
    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()
    repository = module.get<UserRepository.Repository>('UserRepository')
    hashProvider = new BcryptHashProvider()
  })

  beforeEach(async () => {
    updatePasswordDto = {
      password: 'new_password',
      oldPassword: 'old_password'
    }
    await prismaService.user.deleteMany()
    const hashPassword = await hashProvider.generateHash('old_password')
    entity = new UserEntity(UserDataBuilder({ password: hashPassword }))
    await repository.insert(entity)
  })

  describe('PATCH /users', () => {
    it('should update a password', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(200)
      expect(Object.keys(res.body)).toStrictEqual([
        'data'
      ])
      const user = await repository.findById(res.body.data.id)
      const checkNewPassword = await hashProvider.compareHash('new_password', user.password)
      expect(checkNewPassword).toBeTruthy()
    });

    it('should return a error with 422 code when the request body is invalid.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/fakeId')
        .send({})
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
        'oldPassword should not be empty',
        'oldPassword must be a string'
      ])
    });

    it('should return a error with 404 code when throw NotFoundError with invalid id.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/fakeId')
        .send(updatePasswordDto)
        .expect(404)

      expect(res.body.error).toBe('Not Found')
      expect(res.body.message).toEqual('UserModel not found using ID fakeId')
    });

    it('should return a error with 422 code when the password field is invalid.', async () => {
      delete updatePasswordDto.password
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ])
    });

    it('should return a error with 422 code when the oldPassword field is invalid.', async () => {
      delete updatePasswordDto.oldPassword
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'oldPassword should not be empty',
        'oldPassword must be a string'
      ])
    });

    it('should return a error with 422 code when password does not match.', async () => {
      updatePasswordDto.oldPassword = 'fake_password'
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',        
          message: 'Old password does not match'
        })
    });
   
  });
});
