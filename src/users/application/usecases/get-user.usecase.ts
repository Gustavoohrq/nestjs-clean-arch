import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
export namespace GetUserUseCase {
  export type Input = {
    id: string
  }


  export class UseCase implements DefaultUseCase<Input, UserOutput> {
    constructor(
      private userRepository: UserRepository.Repository
    ) { }

    async execute(input: Input): Promise<UserOutput> {
      const entity = await this.userRepository.findById(input.id)
      return UserOutputMapper.toOutput(entity)
    }
  }
}