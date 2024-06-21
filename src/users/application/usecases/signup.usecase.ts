import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BadRequestError } from '@/shared/domain/errors/bad-request-error'
import { UserOutput } from '../dtos/UserOutput'

export namespace SignupUseCase {
  export type Input = {
    name: string
    email: string
    password: string
  }

  export class UseCase {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProvider,
    ) { }

    async execute(input: Input): Promise<UserOutput> {
      const { email, name, password } = input

      if (!email || !name || !password) {
        throw new BadRequestError('Input data not provided')
      }

      await this.userRepository.emailExists(email)

      const hashPassword = await this.hashProvider.generateHash(password)

      const entity = new UserEntity(
        Object.assign(input, { password: hashPassword }),
      )

      await this.userRepository.insert(entity)
      return entity.toJSON()
    }
  }
}
