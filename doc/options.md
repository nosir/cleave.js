# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Options

- Shortcuts mode
    - [mode](#mode)
- Mode: credit card
    - [onCreditCardTypeChanged](#oncreditcardtypechanged)
- Mode: phone
    - [phoneRegionCode](#phoneregioncode)
- Mode: date
    - [datePattern](#datepattern)
- Mode: numeral
    - [numeralThousandsGroupStyle](#numeralthousandsgroupstyle)
    - [numeralDecimalScale](#numeraldecimalscale)
    - [numeralDecimalMark](#numeraldecimalmark)
- Custom options
    - [delimiter](#delimiter)
    - [blocks](#blocks)
    - [prefix](#prefix)
    - [numericOnly](#numericonly)
    - [uppercase](#uppercase)
    - [lowercase](#lowercase)

## Shortcuts mode

### `mode`

A `String` value indicates the format shortcuts mode.

It accepts the following five value:

- `creditCard`: format content as a credit card number

    It detects card type dynamically by checking [card IIN](https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29).
    
    ```js
    new Cleave('.my-input', {
        mode: 'creditCard'
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
    
- `phone`: format content as a phone number

    This mode has to be used together with [phoneRegionCode](#phoneregioncode) below.

    ```js
    new Cleave('.my-input', {
        mode: 'phone',
        phoneRegionCode: 'US'
    });
    ```
    
    ```js
    // +1 4XX XXX XXXX
    // 202 XXX XXXX
    ```

- `date`: format content as a date string

    ```js
    new Cleave('.my-input', {
        mode: 'date'
    });
    ```
    
    ```js
    // 1965/04/26/
    ```
    
- `numeral`: format content as a numeral
    
    ```js
    new Cleave('.my-input', {
        mode: 'numeral'
    });
    ```
    
    ```js
    // 1,234,567.89
    ```

- `custom` (Default value): no shortcut mode applied, format content by custom options

**Default value**: `custom`

## Mode: credit card

### `onCreditCardTypeChanged`

A callback `Function`. Triggered after credit card type changes.

The unique `String` argument `type` is the type of the detected credit, which can be:

`amex` `mastercard` `visa` `diners` `discover` `jcb` `dankort` `instapayment` `uatp`

```js
new Cleave('.my-input', {
    mode: 'creditCard',
    onCreditCardTypeChanged: function (type) {
        // update UI ...
    }
});
```

## Mode: phone

### `phoneRegionCode`

A `String` value indicates the country region code for phone number formatting.

You can find your country code in [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) list.

**Default value**: `AU`

```js
new Cleave('.my-input', {
    mode: 'phone',
    phoneRegionCode: 'US'
});
```

```js
// +1 4XX XXX XXXX
// 202 XXX XXXX
```

## Mode: date

### `datePattern`

An `Array` value indicates the date pattern.

Since it's an input field, leading `0` before date and month is required. To indicate what patterns it should apply, you can use: 'Y', 'y', 'm' and 'd'.

**Default value**: `['d', 'm', 'Y']`

```js
new Cleave('.my-input', {
    mode: 'date',
    datePattern: ['Y', 'm', 'd']
});
```

```js
['d', 'm', 'Y']: 26/04/1965
['d', 'm', 'y']: 26/04/65
['Y', 'm', 'd']: 1965/04/26
```

## Mode: numerals

### `numeralThousandsGroupStyle`

A `String` value indicates the thousands separator grouping style.

It accepts the following three value:

- `thousand`: Global numbering group style. It groups numbers in thousands and the delimiter occurs every 3 digits. `1,234,567.89`
- `lakh`: Indian numbering group style. It groups the rightmost 3 digits in a similar manner to regular way but then groups every 2 digits thereafter. `12,34,567.89`
- `wan`: Chinese numbering group style. It groups numbers in 10-thousand(万, 萬) and the delimiter occurs every 4 digits. `123,4567.89`

**Default value**: `thousand`

```js
new Cleave('.my-input', {
    mode: 'numeral',
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
    mode: 'numeral',
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
    mode: 'numeral',
    numeralDecimalMark: ','
    delimiter: '.'
});
```

```js
// 1.234.567,89
```

## Custom options

### `delimiter`

A `String` value indicates the delimiter to use in formatting.

**Default value**: a space (`/` for `date` shortcut mode, and `,` for `numeral` shortcut mode)

```js
new Cleave('.my-input', {
    mode: 'creditCard',
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

A `Boolean` value indicates if it only allows numeric letters (0-9).

Ignored by `creditCard` and `date` shortcuts mode, the value will always be `true`.

**Default value**: `false`

### `uppercase`

A `Boolean` value indicates if it converts value to uppercase letters.

**Default value**: `false`

### `lowercase`

A `Boolean` value indicates if it converts value to lowercase letters.

**Default value**: `false`
