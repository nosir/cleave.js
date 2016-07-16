<template>
    <input type="text" v-model='initValue' @input='onInput(initValue)' :maxlength='maxLength'>
</template>

<script>
  'use strict'
  const NumeralFormatter = require('../lib/shortcuts/NumeralFormatter')
  const DateFormatter = require('../lib/shortcuts/DateFormatter')
  const PhoneFormatter = require('../lib/shortcuts/PhoneFormatter')
  const CreditCardDetector = require('../lib/shortcuts/CreditCardDetector')
  const Util = require('../lib/utils/Util')
  const DefaultProperties = require('../lib/common/DefaultProperties')

  require('../lib/addons/phone-type-formatter.cn')

  export default {
    data() {
      return {
        initValue: '',
        maxLength: ''
      }
    },
    computed: {
      properties() {
        return DefaultProperties.assign({}, this.options)
      }
    },
    props: {
      options: {
        type: Object,
        required: true
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {
        let owner = this,
            pps = owner.properties

        // so no need for this lib at all
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && (pps.blocksLength === 0 && !pps.prefix)) {
            return
        }

        pps.maxLength = Util.getMaxLength(pps.blocks)

        owner.initNumeralFormatter()
        owner.initDateFormatter()
        owner.initPhoneFormatter()

        owner.onInput(owner.initValue)
      },

      initNumeralFormatter() {
          let owner = this,
              pps = owner.properties

          if (!pps.numeral) {
              return
          }

          pps.numeralFormatter = new NumeralFormatter(
              pps.numeralDecimalMark,
              pps.numeralDecimalScale,
              pps.numeralThousandsGroupStyle,
              pps.delimiter
          )
      },

      initDateFormatter() {
          let owner = this,
              pps = owner.properties

          if (!pps.date) {
              return
          }

          pps.dateFormatter = new DateFormatter(pps.datePattern)
          pps.blocks = pps.dateFormatter.getBlocks()
          pps.blocksLength = pps.blocks.length
          pps.maxLength = Util.getMaxLength(pps.blocks)
          switch (pps.maxLength) {
            case 8:
              owner.maxLength = 10
              break
            case 6:
              owner.maxLength = 7
              break
            default:
              owner.maxLength = pps.maxLength
              break
          }
      },

      initPhoneFormatter() {
          let owner = this,
              pps = owner.properties

          if (!pps.phone) {
              return
          }

          // Cleave.AsYouTypeFormatter should be provided by
          // external google closure lib
          try {
              pps.phoneFormatter = new PhoneFormatter(
                  new window.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
                  pps.delimiter
              )
          } catch (ex) {
              throw new Error('Please include phone-type-formatter.{country}.js lib')
          }
      },

      onInput(value) {
          let owner = this, pps = owner.properties,
              prev = pps.result
          // case 1: delete one more character "4"
          // 1234*| -> hit backspace -> 123|
          // case 2: last character is not delimiter which is:
          // 12|34* -> hit backspace -> 1|34*

          if (pps.backspace && value.slice(-1) !== pps.delimiter) {
              value = Util.headStr(value, value.length - 1)
          }

          // phone formatter
          if (pps.phone) {
              pps.result = pps.phoneFormatter.format(value)
              owner.updateValueState()

              return
          }

          // numeral formatter
          if (pps.numeral) {
              pps.result = pps.prefix + pps.numeralFormatter.format(value)
              owner.updateValueState()

              return
          }

          // date
          if (pps.date) {
              value = pps.dateFormatter.getValidatedDate(value)
          }

          // strip delimiters
          value = Util.strip(value, pps.delimiterRE)

          // strip prefix
          value = Util.getPrefixStrippedValue(value, pps.prefixLength)

          // strip non-numeric characters
          value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value

          // convert case
          value = pps.uppercase ? value.toUpperCase() : value
          value = pps.lowercase ? value.toLowerCase() : value

          // prefix
          if (pps.prefix) {
              value = pps.prefix + value

              // no blocks specified, no need to do formatting
              if (pps.blocksLength === 0) {
                  pps.result = value
                  owner.updateValueState()

                  return
              }
          }

          // update credit card props
          if (pps.creditCard) {
              owner.updateCreditCardPropsByValue(value)
          }

          // strip over length characters
          value = Util.headStr(value, pps.maxLength)

          // apply blocks
          pps.result = Util.getFormattedValue(value, pps.blocks, pps.blocksLength, pps.delimiter)

          // nothing changed
          // prevent update value to avoid caret position change
          if (prev === pps.result && prev !== pps.prefix) {
              return
          }

          owner.updateValueState()
      },

      updateCreditCardPropsByValue(value) {
          let owner = this, pps = owner.properties,
              creditCardInfo

          // At least one of the first 4 characters has changed
          if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
              return
          }

          creditCardInfo = CreditCardDetector.getInfo(value, pps.creditCardStrictMode)

          pps.blocks = creditCardInfo.blocks
          pps.blocksLength = pps.blocks.length
          pps.maxLength = Util.getMaxLength(pps.blocks)
          switch (pps.maxLength) {
            case 16:
              owner.maxLength = pps.maxLength + 3
              break;
            default:
              owner.maxLength = pps.maxLength + 2
              break;
          }
          // credit card type changed
          if (pps.creditCardType !== creditCardInfo.type) {
              pps.creditCardType = creditCardInfo.type

              pps.onCreditCardTypeChanged.call(owner, pps.creditCardType)
          }
      },

      updateValueState() {
          this.initValue = this.properties.result
      },
    }
  }
</script>