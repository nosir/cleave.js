# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md) > Constructor

## Constructor

### `new Cleave(selector|element, [options])`

Creating an instance by providing an input field, it can be either HTML `selector` or the dom `element`.

The `options` is an object documented in the [Options](https://github.com/nosir/cleave.js/blob/master/doc/options.md) section.

With the instance created, you can call these [Public methods](https://github.com/nosir/cleave.js/blob/master/doc/public-methods.md).

```js
var cleave = new Cleave('.my-input', {
    creditCard: true
});
```
