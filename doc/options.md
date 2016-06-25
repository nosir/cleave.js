# Documentation 

[Cleave.js](https://github.com/nosir/cleave.js#documentation) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Options

- Credit card numbers:
    - [creditCard](#creditcard)
- Phone numbers:
    - [phone](#phone)
    - [phoneRegionCode](#phoneregioncode)
- Date:
    - [date](#date)
    - [datePattern](#datepattern)
- Numerals:
    - [numeral](#numeral)
    - [numeralThousandsGroupStyle](#numeralthousandsgroupstyle)
    - [numeralDecimalScale](#numeraldecimalscale)
    - [numeralDecimalMark](#numeraldecimalmark)
- General config:
    - [delimiter](#delimiter)
    - [blocks](#blocks)
    - [prefix](#prefix)
    - [numericOnly](#numericonly)

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

## Phone numbers

### `phone`

A `Boolean` value indicates if this is a phone input field. Enable to trigger phone shortcut mode.

This phone mode has to be used together with `phoneRegionCode` below.

**Default value**: `false`

### `phoneRegionCode`

A `String` value indicates the country region code for phone number formatting.

You can find country code in [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) list.

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

- `thousand`: Global numbering group style. It groups numbers in thousands and the delimiter occurs every 3 digits. `1,234,567.89`
- `lakh`: Indian numbering group style. It groups the rightmost 3 digits in a similar manner to regular way but then groups every 2 digits thereafter. `12,34,567.89`
- `wan`: Chinese numbering group style. It groups numbers in 10-thousand(万, 萬) and the delimiter occurs every 4 digits. `123,4567.89`

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
    numeralDecimalMark: ','
    delimiter: '.'
});
```

```js
// 1.234.567,89
```

## General config

### `delimiter`

A `String` value indicates the delimiter to use in formatting.

**Default value**: a space (`/` if date shortcut mode is enabled)

```js
new Cleave('.my-input', {
    creditCard: true,
    delimiter: '-'
});
```

```js
// XXXX-XXXX-XXXX-XXXX
```

### `blocks`

An `Array` value indicates the groups to format the input value. It will insert delimiters in between these groups.

Ignored by `creditCard`, `phone` and `date` shortcuts mode, the value will be set internally.

**Default value**: `[]`

```js
new Cleave('.my-input', {
    blocks: [2, 5, 5]
});
```

```js
// XX XXXXX XXXXX
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

### `numericOnly`

A `Boolean` value indicates if this only allows numeric input.

Ignored by `creditCard` and `date` shortcuts mode, the value will always be `true`.

**Default value**: `false`
