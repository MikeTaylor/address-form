import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AddressContainer from '../../src/AddressContainer'
import CountrySelector from '../../src/CountrySelector'
import AddressForm from '../../src/AddressForm'
import AddressSummary from '../../src/AddressSummary'
import PostalCodeGetter from '../../src/PostalCodeGetter'
import AutoCompletedFields from '../../src/AutoCompletedFields'

import {
  addValidation,
  removeValidation,
  isValidAddress,
} from '../../src/index'

import DefaultInput from '../../src/DefaultInput'

import GoogleMapsContainer from '../../src/geolocation/GoogleMapsContainer'
import GeolocationInput from '../../src/geolocation/GeolocationInput'
import Map from '../../src/geolocation/Map'
import 'react-select/dist/react-select.css'

import MyInput from './MyInput'

import { injectIntl, intlShape } from 'react-intl'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: addValidation({
        addressId: '10',
        addressType: 'residential',
        city: null,
        complement: null,
        country: 'BRA',
        geoCoordinates: [],
        neighborhood: null,
        number: null,
        postalCode: null,
        receiverName: null,
        reference: null,
        state: null,
        street: null,
        addressQuery: null,
      }),
      rules: {},
      shipsTo: this.addCountryLabel(props.intl, props.shipsTo),
    }
  }

  componentDidMount() {
    this.loadCurrentCountryRules()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      shipsTo: this.addCountryLabel(nextProps.intl, nextProps.shipsTo),
    })
  }

  addCountryLabel(intl, countries) {
    return countries.map(countryCode => ({
      label: intl.formatMessage({ id: 'country.' + countryCode }),
      value: countryCode,
    }))
  }

  loadCurrentCountryRules = () => {
    const country = this.state.address.country.value
    const hasRulesLoaded = this.state.rules[country]

    if (hasRulesLoaded) {
      return
    }

    import('../../src/country/' + country).then(rules => {
      this.setState(prevState => ({
        rules: { ...prevState.rules, [country]: rules.default },
      }))
    })
  }

  handleAddressChange = address => {
    this.setState(prevState => ({
      address: {
        ...prevState.address,
        ...address,
      },
    }))
  }

  componentDidUpdate(_, prevState) {
    const countryChanged =
      this.state.address.country.value !== prevState.address.country.value

    if (countryChanged) {
      this.loadCurrentCountryRules()
    }
  }

  handleClickMaskedInfoIcon = e => {
    e.preventDefault()

    if (window && window.$) {
      window.$(window).trigger('showMessage.vtex', ['maskedInfo'])
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    const rules = this.getCurrentRules(this.state)

    const { valid, address } = isValidAddress(this.state.address, rules)

    if (valid) {
      this.setState({ submitted: true, address })
      return
    }

    this.setState({ address })
  }

  getCurrentRules(state) {
    const country = state.address.country.value
    const selectedRules = state.rules[country]
    return selectedRules
  }

  render() {
    const { address, shipsTo } = this.state
    const { intl, accountName, googleMapsAPIKey, locale } = this.props

    const selectedRules = this.getCurrentRules(this.state)
    if (!selectedRules) {
      return <div>Loading...</div>
    }

    if (this.state.submitted) {
      return (
        <div className="step" style={{ padding: '20px' }}>
          <AddressSummary
            address={removeValidation(address)}
            rules={selectedRules}
            onClickMaskedInfoIcon={this.handleClickMaskedInfoIcon}
          />
        </div>
      )
    }

    const validGeoCoords =
      address.geoCoordinates &&
      address.geoCoordinates.valid &&
      address.geoCoordinates.value.length === 2

    return (
      <div className="step" style={{ padding: '20px' }}>
        <AddressContainer
          accountName={accountName}
          address={address}
          rules={selectedRules}
          onChangeAddress={this.handleAddressChange}
          autoCompletePostalCode={!validGeoCoords}
        >
          {onChangeAddress =>
            (<div>
              <CountrySelector
                Input={DefaultInput}
                address={address}
                shipsTo={shipsTo}
                onChangeAddress={onChangeAddress}
              />

              <GoogleMapsContainer apiKey={googleMapsAPIKey} locale={locale}>
                {({ loading, googleMaps }) =>
                  (<div>
                    <GeolocationInput
                      loadingGoogle={loading}
                      googleMaps={googleMaps}
                      address={address}
                      rules={selectedRules}
                      onChangeAddress={onChangeAddress}
                    />

                    {validGeoCoords &&
                      <Map
                        loadingGoogle={loading}
                        googleMaps={googleMaps}
                        geoCoordinates={address.geoCoordinates.value}
                        rules={selectedRules}
                        onChangeAddress={onChangeAddress}
                        mapProps={{
                          style: {
                            height: '120px',
                            marginBottom: '10px',
                            width: '260px',
                          },
                        }}
                      />}
                  </div>)}
              </GoogleMapsContainer>

              {!validGeoCoords &&
                <PostalCodeGetter
                  Input={DefaultInput}
                  address={address}
                  rules={selectedRules}
                  onChangeAddress={onChangeAddress}
                />}

              <AutoCompletedFields
                address={address}
                rules={selectedRules}
                onChangeAddress={onChangeAddress}
              >
                <a
                  className="link-edit"
                  id="force-shipping-fields"
                  style={{ cursor: 'pointer' }}
                >
                  {intl.formatMessage({ id: 'address-form.edit' })}
                </a>
              </AutoCompletedFields>

              <AddressForm
                Input={MyInput}
                address={address}
                rules={selectedRules}
                onChangeAddress={onChangeAddress}
                omitPostalCodeFields={!validGeoCoords}
              />
            </div>)}
        </AddressContainer>

        <button className="btn btn-default" onClick={this.handleSubmit}>
          Submit
        </button>
      </div>
    )
  }
}

App.propTypes = {
  intl: intlShape,
  accountName: PropTypes.string.isRequired,
  googleMapsAPIKey: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  shipsTo: PropTypes.array.isRequired,
}

export default injectIntl(App)
