# JavaScript API

## Constructor

### `new Cleave(selector|element, [options])`

Creating an instance by providing an input field, it can be either HTML `selector` or the dom `element`.

The `options` is an object documented in the [Options](#options) section.

With the instance created, you can call these [Public methods](#public-methods).

```js
var cleave = new Cleave('.my-input', {
    creditCard: true
});
```


## Public methods

### `.getValue()`

Gets the raw value without any format pattern or delimiter, normally you should pass over this value to model or backend.

```js
cleave.getValue();
```

### `.setValue(value)`

Sets the raw value, it will then apply formatting automatically.

```js
cleave.setValue('5555444433331111');
```

### `.destroy()`

Garbage collection, removes all listeners.

```js
cleave.destroy();
```

### `.setPhoneRegionCode(regionCode)`

Sets / Changes country region code.

You will only need to call this when dealing with country switching for a phone input field.

e.g. user selected a different country option via a form `<select>`, which triggered the country change. See more in documentation [phone lib usage](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-usage.md) section.


## Options

### `creditCard`

A `Boolean` value indicates if this is a credit card input field. Enable to trigger credit card shortcut mode.

It detects credit card type dynamically and automatically by checking card [IIN](https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29).

**Default value**: `false`

```js
new Cleave('.my-input', {
    creditCard: true
});
```

```
// Visa:        XXXX XXXX XXXX XXXX
// Amex:        XXXX XXXXXX XXXXX
// MasterCard:  XXXX XXXX XXXX XXXX
// Diners Club: XXXX XXXXXX XXXX
// UATP:        XXXX XXXXX XXXXXX
...
```

### `creditCardStrictMode`

A `Boolean` value indicates if to apply strict credit card check mode.

In theory, visa credit card can have up to 19 digital numbers. If this is set to `true`, it won't restrain visa credit card max-length to 16 numbers. Given that this long digital case is relatively rare, mostly you don't need to enable this option.

**Default value**: `false`

```js
new Cleave('.my-input', {
    creditCard: true,
    creditCardStrictMode: true
});
```

### `phone`

A `Boolean` value indicates if this is a phone input field. Enable to trigger phone shortcut mode.

This phone mode has to be used together with `phoneRegionCode` below.

**Default value**: `false`

### `phoneRegionCode`

A `String` value indicates the country region code for phone number formatting.

You can find your country code in the [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) list.

**Default value**: `null`

```js
new Cleave('.my-input', {
    phone: true,
    phoneRegionCode: 'AU'
});
```

```
// +61 4XX XXX XXX
// +61 2 XXXX XXXX
// 04XX XXX XXX
// 02 XXXX XXXX
```

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

```
['d', 'm', 'Y']: 26/04/1965
['d', 'm', 'y']: 26/04/65
['Y', 'm', 'd']: 1965/04/26
```

### `numericOnly`

A `Boolean` value indicates if this only allows numeric input.

Ignored by `creditCard` and `date` shortcuts mode, the value will always be `true`.

**Default value**: `false`

### `delimiter`

A `String` value indicates the delimiter to use in formatting.

**Default value**: a space (`/` if date shortcut mode is enabled)

```js
new Cleave('.my-input', {
    creditCard: true,
    delimiter: '-'
});
```

```
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

```
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

```
// 253874 XXX XXX
```
