import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput } from '../dtos/UserOutput'

export namespace GetUserUseCase {
  export type Input = {
    id: string
  }


  export class UseCase {
    constructor(
      private userRepository: UserRepository.Repository
    ) { }

    async execute(input: Input): Promise<UserOutput> {
      const entity = await this.userRepository.findById(input.id)
      return entity.toJSON()
    }
  }
}
