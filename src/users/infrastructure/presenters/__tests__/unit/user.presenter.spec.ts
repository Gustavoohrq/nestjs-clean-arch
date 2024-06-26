import { instanceToPlain } from 'class-transformer';
import { UserPresenter } from '../../user.presenter';

describe('UserPresenter unit tests', () => {
  const createdAt = new Date()
  let sut: UserPresenter;
  let props = {
    id: "587da622-3540-499e-9ab0-cd810e1e64c0",
    name: 'test name',
    email: 'a@a.com',
    createdAt,
    password: 'fake'

  }
  beforeEach(() => {
    sut = new UserPresenter(props)
  })

  describe('constructor', () => {
    it('should set values', () => {
      expect(sut.id).toEqual(props.id)
      expect(sut.name).toEqual(props.name)
      expect(sut.email).toEqual(props.email)
      expect(sut.createdAt).toEqual(props.createdAt)
    });
  });
  it('should presenter data', () => {
    const output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      id: "587da622-3540-499e-9ab0-cd810e1e64c0",
      name: 'test name',
      email: 'a@a.com',
      createdAt: createdAt.toISOString(),
    })
  });

});
