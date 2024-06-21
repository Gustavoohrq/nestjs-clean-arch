import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error'
import { HashProvider } from '@/shared/application/providers/hash-provider'
export namespace UpdatePassowordUseCase {
  export type Input = {
    id: string,
    password: string
    oldPassword: string
  }


  export class UseCase implements DefaultUseCase<Input, UserOutput> {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProvider
    ) { }

    async execute(input: Input): Promise<UserOutput> {
      const entity = await this.userRepository.findById(input.id)
      if (!input.password || !input.oldPassword) throw new InvalidPasswordError('Old password and new password required')
      const checkOldPassword = await this.hashProvider.compareHash(input.oldPassword, entity.password)
      if (!checkOldPassword) throw new InvalidPasswordError('Invalid password.')
      const hashPassword = await this.hashProvider.generateHash(input.password)
      entity.updatePassword(hashPassword)
      return UserOutputMapper.toOutput(entity)
    }
  }
}
