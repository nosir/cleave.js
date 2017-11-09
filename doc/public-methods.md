# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Public methods

- [getRawValue](#getrawvalue)
- [setRawValue](#setrawvaluevalue)
- [getFormattedValue](#getformattedvalue)
- [getISOFormatDate](#getisoformatdate)
- [destroy](#destroy)
- [setPhoneRegionCode](#setphoneregioncoderegioncode)

### `.getRawValue()`

Gets raw value without any format pattern or delimiter, normally you should pass over this value to model or backend.

```js
cleave.getRawValue();
```

### `.setRawValue(value)`

Sets raw value, it will then apply formatting automatically.

```js
cleave.setRawValue('5555444433332222');
```

### `.getFormattedValue()`

Gets formatted pretty value, this is same as `DOMInputElement.value`.

```js
cleave.getFormattedValue();
```

### `.getISOFormatDate()`

Gets ISO format date value, this only works for date input type.

```js
cleave.getISOFormatDate();
```

### `.destroy()`

Garbage collection, removes all listeners.

```js
cleave.destroy();
```

### `.setPhoneRegionCode(regionCode)`

Sets / Changes country region code.

You will only need to call this when dealing with country switching for a phone input field.

e.g. user selected a different country option via `<select>`, which triggered the country change. See more in documentation [phone lib addon](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-addon.md) section.
