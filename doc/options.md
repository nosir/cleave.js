# Cleave.js Documentation

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Options

- Credit card numbers:
    - [creditCard](#creditcard)
    - [creditCardStrictMode](#creditcardstrictmode)
    - [onCreditCardTypeChanged](#oncreditcardtypechanged)
- Phone numbers:
    - [phone](#phone)
    - [phoneRegionCode](#phoneregioncode)
- Date:
    - [date](#date)
    - [datePattern](#datepattern)
    - [dateMin](#datemin)
    - [dateMax](#datemax)
- Time:
    - [time](#time)
    - [timePattern](#timepattern)
- Numerals:
    - [numeral](#numeral)
    - [numeralThousandsGroupStyle](#numeralthousandsgroupstyle)
    - [numeralIntegerScale](#numeralintegerscale)
    - [numeralDecimalScale](#numeraldecimalscale)
    - [numeralDecimalMark](#numeraldecimalmark)
    - [numeralPositiveOnly](#numeralpositiveonly)
    - [signBeforePrefix](#signbeforeprefix)
    - [tailPrefix](#tailprefix)
    - [stripLeadingZeroes](#stripleadingzeroes)
- General config:
    - [blocks](#blocks)
    - [delimiter](#delimiter)
    - [delimiters](#delimiters)
    - [delimiterLazyShow](#delimiterlazyshow)
    - [prefix](#prefix)
    - [noImmediatePrefix](#noimmediateprefix)
    - [rawValueTrimPrefix](#rawvaluetrimprefix)
    - [numericOnly](#numericonly)
    - [uppercase](#uppercase)
    - [lowercase](#lowercase)
    - [swapHiddenInput](#swaphiddeninput)
    - [onValueChanged](#onvaluechanged)

## Credit card numbers

### `creditCard`

A `Boolean` value indicates if this is a credit card input field. Enable to trigger credit card shortcut mode.

It detects credit card type dynamically and automatically by checking card [IIN](https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29).

**Default value**: `false`

```js
new Cleave('.my-input', {
    creditCard: true
});
```

```js
// Visa:        XXXX XXXX XXXX XXXX
// Amex:        XXXX XXXXXX XXXXX
// MasterCard:  XXXX XXXX XXXX XXXX
// Diners Club: XXXX XXXXXX XXXX
// UATP:        XXXX XXXXX XXXXXX
...
```

You can also custom the [delimiter](#delimiter) for credit card numbers

### `creditCardStrictMode`

A `Boolean` value indicates if enable credit card strict mode.

Expand use of 19-digit PANs for supported credit card.

**Default value**: `false`

```js
new Cleave('.my-input', {
    creditCard: true,
    creditCardStrictMode: true
});
```

```js
// XXXX XXXX XXXX XXXXXXX
...
```

### `onCreditCardTypeChanged`

A callback `Function`. Triggered after credit card type changes.

The unique `String` argument `type` is the type of the detected credit, which can be:

`amex` `mastercard` `visa` `diners` `discover` `jcb` `dankort` `instapayment` `uatp` `mir` `unionPay`

```js
new Cleave('.my-input', {
    creditCard: true,
    onCreditCardTypeChanged: function (type) {
        // update UI ...
    }
});
```

## Phone numbers

### `phone`

A `Boolean` value indicates if this is a phone input field. Enable to trigger phone shortcut mode.

This phone mode has to be used together with `phoneRegionCode` below.

**Default value**: `false`

### `phoneRegionCode`

A `String` value indicates the country region code for phone number formatting.

You can find your country code in [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) list.

**Default value**: `AU`

```js
new Cleave('.my-input', {
    phone: true,
    phoneRegionCode: 'US'
});
```

```js
// +1 4XX XXX XXXX
// 408 XXX XXXX
// 202 XXX XXXX
```

You can also custom the [delimiter](#delimiter) and the [prefix](#prefix) for phone numbers

## Date

### `date`

A `Boolean` value indicates if this is a date input field. Enable to trigger date shortcut mode.

**Default value**: `false`

### `datePattern`

An `Array` value indicates the date pattern.

Since it's an input field, leading `0` before date and month is required. To indicate what patterns it should apply, you can use: 'Y', 'y', 'm' and 'd'.

**Default value**: `['d', 'm', 'Y']`

```js
new Cleave('.my-input', {
    date: true,
    datePattern: ['Y', 'm', 'd']
});
```

```js
['d', 'm', 'Y']: 26/04/1965
['d', 'm', 'y']: 26/04/65
['Y', 'm', 'd']: 1965/04/26
```

You can also custom the [delimiter](#delimiter) for date

### `dateMin`

An date `String` value indicates the min date boundary.

The date string format follows as ISO 8601 date format YYYY-MM-DD

### `dateMax`

An date `String` value indicates the max date boundary.

The date string format follows as ISO 8601 date format YYYY-MM-DD

```js
new Cleave('.my-input', {
    date: true,
    dateMin: '2000-01-01',
    dateMax: '2099-12-31',
    datePattern: ['d', 'm', 'Y']
});
```

```js
new Cleave('.my-input', {
    date: true,
    dateMin: '18-01',
    dateMax: '28-12',
    datePattern: ['m', 'y']
});
```

## Time

### `time`

A `Boolean` value indicates if this is a time input field. Enable to trigger time shortcut mode.

**Default value**: `false`

### `timePattern`

An `Array` value indicates the time pattern.

Since it's an input field, leading `0` before hour, minute and second is required. To indicate what patterns it should apply, you can use: 'h', 'm' and 's'.

**Default value**: `['h', 'm', 's']`

```js
new Cleave('.my-input', {
    time: true,
    timePattern: ['h', 'm']
});
```

```js
['h', 'm', 's']: 14:56:37
['h', 'm']: 21:56
['s', 'm', 'h']: 37:56:14
```

### `timeFormat`

A `String` value indicates time format

**Default value** `'24'` Military time format

```js
new Cleave('.my-input', {
    time: true,
    timeFormat: '12'
});
```

You can also custom the [delimiter](#delimiter) for time

## Numerals

### `numeral`

A `Boolean` value indicates if this is a numeral input field. Enable to trigger numeral shortcut mode.

**Default value**: `false`

```js
new Cleave('.my-input', {
    numeral: true
});
```

```js
// 1,234,567.89
```

### `numeralThousandsGroupStyle`

A `String` value indicates the thousands separator grouping style.

It accepts three preset value:

- `thousand`: Thousand numbering group style. It groups numbers in thousands and the delimiter occurs every 3 digits. `1,234,567.89`
- `lakh`: Indian numbering group style. It groups the rightmost 3 digits in a similar manner to regular way but then groups every 2 digits thereafter. `12,34,567.89`
- `wan`: Chinese numbering group style. It groups numbers in 10-thousand(万, 萬) and the delimiter occurs every 4 digits. `123,4567.89`
- `none`: Does not group thousands. `1234567.89`

**Default value**: `thousand`

```js
new Cleave('.my-input', {
    numeral: true,
    numeralThousandsGroupStyle: 'wan'
});
```

```js
// 123,4567.89
```

### `numeralIntegerScale`

An `Int` value indicates the numeral integer scale.

```js
new Cleave('.my-input', {
    numeral: true,
    numeralIntegerScale: 4
});
```

```js
// 1,234.56
```

### `numeralDecimalScale`

An `Int` value indicates the numeral decimal scale.

**Default value**: `2`

```js
new Cleave('.my-input', {
    numeral: true,
    numeralDecimalScale: 4
});
```

```js
// 12,345.6789
```

### `numeralDecimalMark`

A `String` value indicates the numeral decimal mark.

Decimal mark can be different in handwriting, and for [delimiter](#delimiter) as well.

**Default value**: `.`

```js
new Cleave('.my-input', {
    numeral: true,
    numeralDecimalMark: ',',
    delimiter: '.'
});
```

```js
// 1.234.567,89
```

### `numeralPositiveOnly`

A `Boolean` value indicates if it only allows positive numeral value

**Default value**: `false`

```js
new Cleave('.my-input', {
    numeral: true,
    numeralPositiveOnly: true
});
```

```js
// 1234.56
```

### `signBeforePrefix`

A `Boolean` value indicates if the sign of the numeral should appear before the prefix.

**Default value**: `false`

```js
new Cleave('.my-input', {
    numeral: true,
    prefix: '$',
    signBeforePrefix: true
});
```

```js
// -$1234.56
```

### `tailPrefix`

A `Boolean` value makes prefix should be appear after the numeral.

**Default value**: `false`

```js
new Cleave('.my-input', {
    numeral: true,
    prefix: '€',
    tailPrefix: true
});
```

```js
// 1234.56€
```

### `stripLeadingZeroes`

A `Boolean` value indicates if zeroes appearing at the beginning of the number should be stripped out. This also prevents a number like "100,000" to disappear if the leading "1" is deleted.

**Default value**: `true`

```js
new Cleave('.my-input', {
    numeral: true,
    stripLeadingZeroes: false
});
```

```js
// 000,0134.56
```
You can also custom the [prefix](#prefix) for numeral

## General config

### `blocks`

An `Array` value indicates the groups to format the input value. It will insert delimiters in between these groups.

This option is ignored by `creditCard`, `phone`, `date` and `numeral` shortcuts mode.

**Default value**: `[]`

```js
new Cleave('.my-input', {
    blocks: [2, 5, 5]
});
```

```js
// XX XXXXX XXXXX
```

### `delimiter`

A `String` value indicates the delimiter to use in formatting.

**Default value**: a space (`/` for `date` shortcut mode, and `,` for `numeral` shortcut mode)

```js
new Cleave('.my-input', {
    creditCard: true,
    delimiter: '-'
});
```

```js
// XXXX-XXXX-XXXX-XXXX
```

### `delimiters`

An `Array` value indicates the multiple delimiters to use in formatting.

This option is ignored by `creditCard`, `phone`, `date` and `numeral` shortcuts mode.

When delimiters array is defined, single [delimiter](#delimiter) option is ignored.

**Default value**: `[]`

```js
new Cleave('.my-input', {
    blocks: [3, 3, 3, 2],
    delimiters: ['.', '.', '-']
});
```

```js
// XXX.XXX.XXX-XX
```

### `delimiterLazyShow`

A `boolean` value that if true, will lazy add the delimiter only when the user starting typing the next group section

This option is ignored by `phone`, and `numeral` shortcuts mode.

**Default value**: `false`

```js
new Cleave('.my-input', {
    blocks: [3, 3, 3],
    delimiter: '-',
    delimiterLazyShow: true
});
```

```js
// XXX
// XXX-X
```

### `prefix`

A `String` value indicates the prepend string. It can't be removed or changed in the input field.

**Default value**: `null`

```js
new Cleave('.my-input', {
    blocks: [6, 3, 3],
    prefix: '253874'
});
```

```js
// 253874 XXX XXX
```

### `noImmediatePrefix`

A `boolean` value that if true, will only add the prefix once the user enters values. Useful if you need to use placeholders.

**Default value**: `false`

```js
new Cleave('.my-input', {
    numeral: true,
    prefix: '$',
    noImmediatePrefix: true
});
```

```js
// before input
//
// after input of 5
// $5
```

### `rawValueTrimPrefix`

A `Boolean` value indicates if to trim prefix in calling `getRawValue()` or getting `rawValue` in AngularJS or ReactJS component.

**Default value**: `false`

```js
new Cleave('.my-input', {
    numeral: true,
    prefix: '$',
    rawValueTrimPrefix: true
});
```

```js
// formatted value: $123,456.78
// raw value: 123456.78
```

### `numericOnly`

A `Boolean` value indicates if it only allows numeric letters (0-9).

Ignored by `creditCard` and `date` shortcuts mode, the value will always be `true`.

`numericOnly` doesn't work on it's own, you have to either specify the shortcuts mode or `blocks` option to enable the formatter.

**Default value**: `false`

### `uppercase`

A `Boolean` value indicates if it converts value to uppercase letters.

`uppercase` doesn't work on it's own, you have to either specify the shortcuts mode or `blocks` option to enable the formatter.

**Default value**: `false`

### `lowercase`

A `Boolean` value indicates if it converts value to lowercase letters.

`lowercase` doesn't work on it's own, you have to either specify the shortcuts mode or `blocks` option to enable the formatter.

**Default value**: `false`

### `swapHiddenInput`

A `Boolean` value indicates if it swaps the input field to a hidden field.

This way, formatting only happens on the cloned (visible) UI input, the value of hidden field will be updated as raw value without formatting.

**Default value**: `false`

### `onValueChanged`

A callback `Function`. Triggered after value changes.

It returns an object, which has a target key, value is the formatted and raw input value.

```js
new Cleave('.my-input', {
    creditCard: true,
    onValueChanged: function (e) {
        // e.target = { value: '5100-1234', rawValue: '51001234' }
    }
});
```
