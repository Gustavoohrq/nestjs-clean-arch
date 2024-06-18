import { validate as uuidValidate } from 'uuid'
import { ClassValidatorFields } from '../class-validator-fields'
import * as classValidator from 'class-validator'



class StubClassValidatorFields extends ClassValidatorFields<{ field: string }> { }

describe('ClassValidatorFields unit tests', () => {
  it('Should initialize errors and validatedData variables with null', () => {
    const sut = new StubClassValidatorFields()
    expect(sut.errors).toBeNull()
    expect(sut.validatedData).toBeNull()
  })


  it('Should validate with erros', () => {
    const spyValidateSync = jest.spyOn(classValidator, 'validateSync')
    spyValidateSync.mockReturnValueOnce([
      { property: 'field', constraints: { isRequired: 'test_error' } }
    ])
    const sut = new StubClassValidatorFields()
    expect(sut.validate(null)).toBeFalsy()
    expect(spyValidateSync).toHaveBeenCalled()
    expect(sut.validatedData).toBeNull()
    expect(sut.errors).toStrictEqual({ field: ['test_error'] })
  })

  it('Should validate without erros', () => {
    const spyValidateSync = jest.spyOn(classValidator, 'validateSync')
    spyValidateSync.mockReturnValueOnce([])
    const sut = new StubClassValidatorFields()
    expect(sut.validate({field: 'value'})).toBeTruthy()
    expect(spyValidateSync).toHaveBeenCalled()
    expect(sut.validatedData).toEqual({field: 'value'})
    expect(sut.errors).toBeNull()
  })

})
