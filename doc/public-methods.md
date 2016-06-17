# Documentation 

[Cleave.js](https://github.com/nosir/cleave.js) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Public methods

- [getValue](#getvalue)
- [setValue](#setvaluevalue)
- [destroy](#destroy)
- [setPhoneRegionCode](#setphoneregionCode)

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

