# Documentation 

[Cleave.js](https://github.com/nosir/cleave.js) > Phone lib usage

## Steps

- Include `cleave-phone.{country}.js` as a shortcut extension.

- Enable [phone option](https://github.com/nosir/cleave.js/blob/master/doc/options.md#phonenumbers) to create Cleave instance.

## Why separate phone lib

Phone lib uses `AsYouTypeFormatter` from google [libphonenumber](https://github.com/googlei18n/libphonenumber/) to format phone numbers. 

Since the original lib includes patterns for all the countries, the file size is relatively large (gzipped 50K). In order to reduce the size, Cleave.js helped you separate the module based on countries, so that you can include any of them as an extension (gzipped 5KB each).

## How to include phone lib

Under `dist/plugin` folder, you can find:

- Individual `cleave-phone.{country}.js` for every single country
- All-in-one `cleave-phone.full.js` but with large size

### Simply HTML include

```html
<script src="cleave.min.js"></script>
<script src="cleave-phone.{country}.js"></script>

<script>var cleave = new Cleave(...)</script>
```

### CommonJS

```javascript
var Cleave = require('cleave.js');
require('cleave.js/dist/plugin/cleave-phone.{country}');

var cleave = new Cleave(...)
```

### AMD

```javascript
require(['cleave.min', 'plugin/cleave-phone.{country}'], function (Cleave) {
    var cleavePhone = new Cleave(...)
});
```

## Customize building

You can even build your owner country combination lib, e.g. `(US & CA).js`

Please see [here](https://github.com/nosir/libphonenumber-country-metadata#build-phone-type-formatterjs-for-cleavejs)
