import React from 'react'
import SelectLevel from '../../postalCodeFrom/SelectLevel'
import { shallow, mount } from 'enzyme'
import useThreeLevels from '../../__mocks__/country/useThreeLevels'
import address from '../../__mocks__/newAddress'
import MockInput from '../../__mocks__/inputs/DefaultInput/Input'

describe('SelectLevel', () => {
  it('render it right', () => {
    const wrapper = shallow(
      <SelectLevel
        level={0}
        Input={MockInput}
        address={address}
        rules={useThreeLevels}
        onChangeAddress={jest.fn()}
      />,
    )

    expect(wrapper.find('InputFieldContainer')).toHaveLength(1)
  })

  it('should call handleChange', () => {
    const Component = jest.fn(({ onChange }) => {
      onChange('Beni')
      return <div />
    })
    const handleChange = jest.fn()

    mount(
      <SelectLevel
        level={0}
        Input={Component}
        address={address}
        rules={useThreeLevels}
        onChangeAddress={handleChange}
      />,
    )

    expect(handleChange).toHaveBeenCalled()
  })

  it('should call handleChange and clear dependent fields', () => {
    const Component = jest.fn(({ onChange }) => {
      onChange('II Región')
      return <div />
    })
    const handleChange = jest.fn()

    mount(
      <SelectLevel
        level={0}
        Input={Component}
        address={{
          ...address,
          state: { value: 'I Región ' },
          city: { value: 'Calama' },
          postalCode: { value: '1390000' },
        }}
        rules={useThreeLevels}
        onChangeAddress={handleChange}
      />,
    )

    expect(handleChange).toHaveBeenCalledWith({
      state: {
        value: 'II Región',
        geolocationAutoCompleted: undefined,
        postalCodeAutoCompleted: undefined,
      },
      city: { value: null },
      neighborhood: { value: null },
      postalCode: { value: null },
    })
  })
})
