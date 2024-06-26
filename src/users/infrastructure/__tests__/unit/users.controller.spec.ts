import { UsersController } from '../../users.controller';
import { UserOutput } from '@/users/application/dtos/user-output';
import { SignupUseCase } from '@/users/application/usecases/signup.usecase';
import { SignupDto } from '../../dtos/signup.dto';
import { SigninUseCase } from '@/users/application/usecases/signin.usecase';
import { SigninDto } from '../../dtos/signin.dto';
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase';
import { UpdatePasswordDto } from '../../dtos/update-password.dto';
import { GetUserUseCase } from '@/users/application/usecases/get-user.usecase';
import { ListUsersUseCase } from '@/users/application/usecases/list-user.usecase';
import { UserPresenter } from '../../presenters/user.presenter';
import { UserCollectionPresenter } from '../../presenters/user.collection.presenter';

describe('UsersController unit tests', () => {
  let sut: UsersController;
  let id: string;
  let props: UserOutput

  beforeEach(async () => {
    sut = new UsersController()
    id = '526696df-bfca-4a98-9a1b-6320fb315422'
    props = {
      id,
      name: 'Test',
      email: 'gustavo@gmail.com',
      password: '1234',
      createdAt: new Date()
    }

  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should create a user', async () => {
    const output: SignupUseCase.Output = props
    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['signupUseCase'] = mockSignupUseCase as any

    const input: SignupDto = {
      name: 'Test',
      email: 'gustavo@gmail.com',
      password: '1234',
    }
    const presenter = await sut.create(input)
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input)
  });

  it('should authenticate a user', async () => {
    const output: SigninUseCase.Output = props
    const mockSigninUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['signinUseCase'] = mockSigninUseCase as any

    const input: SigninDto = {
      email: 'gustavo@gmail.com',
      password: '1234',
    }
    const presenter = await sut.login(input)
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input)
  });

  it('should update a user', async () => {
    const output: UpdateUserUseCase.Output = props
    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['updateUserUseCase'] = mockUpdateUserUseCase as any

    const input: UpdateUserDto = {
      name: 'José',
    }
    const presenter = await sut.update(id, input)
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({ id, ...input })
  });

  it('should update password a user', async () => {
    const output: UpdatePasswordUseCase.Output = props
    const mockUpdatePasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['updatePasswordUseCase'] = mockUpdatePasswordUseCase as any

    const input: UpdatePasswordDto = {
      oldPassword: '1234',
      password: 'new password'
    }
    const presenter = await sut.updatePassword(id, input)
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({ id, ...input })
  });

  it('should delete a user', async () => {
    const output = undefined
    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any


    const result = await sut.remove(id)

    expect(output).toStrictEqual(result);
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id })
  });

  it('should gets a user', async () => {
    const output: GetUserUseCase.Output = props
    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['getUserUseCase'] = mockGetUserUseCase as any


    const presenter = await sut.findOne(id)
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({ id })
  });


  it('should list users', async () => {
    const output: ListUsersUseCase.Output = {
      items: [props],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1
    }
    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output))
    }
    sut['listUsersUseCase'] = mockListUsersUseCase as any

    const searchParams = {
      page: 1,
      perPage: 1
    }
    const presenter = await sut.search(searchParams)

    expect(presenter).toBeInstanceOf(UserCollectionPresenter);
    expect(presenter).toEqual(new UserCollectionPresenter(output));
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams)
  });
});
