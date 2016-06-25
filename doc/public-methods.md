# Documentation 

[Cleave.js](https://github.com/nosir/cleave.js) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Public methods

- [getRawValue](#getrawvalue)
- [setRawValue](#setrawvaluevalue)
- [getValue](#getvalue)
- [destroy](#destroy)
- [setPhoneRegionCode](#setphoneregionCode)

### `.getRawValue()`

Gets raw value without any format pattern or delimiter, normally you should pass over this value to model or backend.

```js
cleave.getRawValue();
```

### `.setRawValue(value)`

Sets raw value, it will then apply formatting automatically.

```js
cleave.setRawValue('5555444433331111');
```

### `.getValue()`

Gets formatted pretty value, this is same as `DOMInputElement.value`.

```js
cleave.getValue();
```

### `.destroy()`

Garbage collection, removes all listeners.

```js
cleave.destroy();
```

### `.setPhoneRegionCode(regionCode)`

Sets / Changes country region code.

You will only need to call this when dealing with country switching for a phone input field.

e.g. user selected a different country option via a form `<select>`, which triggered the country change. See more in documentation [phone lib plugin](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-plugin.md) section.

