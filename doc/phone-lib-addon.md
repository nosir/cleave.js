# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > Phone lib addon

## Why separate phone lib as an addon

Phone lib uses google [libphonenumber](https://github.com/googlei18n/libphonenumber/) `AsYouTypeFormatter` feature to format phone numbers. 

Since the original i18n lib includes patterns for all the countries, the file size is relatively large (minified: 254K, gzipped 50K).

In order to reduce the size, Cleave.js helped you separate the module based on countries, so that you can include any of them as an addon (minified: 14K, gzipped 5KB each).

## How to include phone lib addon

Under `dist/addons` directory, you can find:

- Individual `cleave-phone.{country}.js` for each country

    e.g. `cleave-phone.au.js` for `AU` Australia

- i18n all-in-one `cleave-phone.i18n.js` but with large size

> You can find your country code in [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) list.

### Simply HTML include

```html
<script src="cleave.min.js"></script>
<script src="cleave-phone.{country}.js"></script>

<script>var cleave = new Cleave(...)</script>
```

### CommonJS

```javascript
var Cleave = require('cleave.js');
require('cleave.js/dist/addons/cleave-phone.{country}');

var cleave = new Cleave(...)
```

### AMD

```javascript
require(['dist/cleave.min', 'dist/addons/cleave-phone.{country}'], function (Cleave) {
    var cleave = new Cleave(...)
});
```

## Customize building

Sometimes you might want to build phone lib for multiple counties.

Please be aware this is the **wrong** way:

```html
// This is the WRONG way! Don't do
<script src="cleave-phone.ca.js"></script>
<script src="cleave-phone.us.js"></script>
```

Don't include addons one by one, instead, you should build your owner country combination lib like `(US & CA).js`

To build it by yourself, please see [here](https://github.com/nosir/libphonenumber-country-metadata#build-phone-type-formatterjs-for-cleavejs).

[JSFiddle demo](https://jsfiddle.net/nosir/ta11Lhup/)

If you had any problem in building your own or need some specific combinations, create an issue [here](https://github.com/nosir/cleave.js/issues)
