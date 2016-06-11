# Cleave.js

[![Travis](https://img.shields.io/travis/nosir/cleave.js.svg?maxAge=2592000)](https://travis-ci.org/nosir/cleave.js)

Cleave.js has a simple purpose: to help you separate input text content automatically.

The idea is to provide an easy way to increase readability when you are typing. By using the library, you won't need to write any mind-blowing regular expressions or mask patterns to format input text.

However, this isn't meant to replace any form validation or mask library, you should still validate your data before submitting.

**tl;dr** [the demo page]()

## Features
- Credit card number formatting
- Phone number formatting (country specify support)
- Date formatting
- Customize delimiter, prefix and blocks pattern
- CommonJS / AMD support

## Installation

#### npm

```
npm install --save cleave.js
```

#### bower

```
bower install --save cleave.js
```

#### Manually download
Grab the file from [dist](https://github.com/nosir/cleave.js/tree/master/dist) folder

## Usage

Simply include

```html
<script src="cleave.min.js"></script>
<script src="cleave-phone.{country}.js"></script>
```

> `cleave-phone.js` is only required when phone number formatting option is enabled. This is same for CommonJS and AMD mode below

Then have a text field

```html
<input class="input-phone" type="text"/>
```

Now in your JavaScript

```javascript
var cleave = new Cleave('.input-phone', {
    phone:      true,
    regionCode: '{country}'
});
```

More examples: [the demo page](https://github.com)

#### CommonJS

```javascript
var Cleave = require('cleave.js');
require('cleave.js/dist/vendor/cleave-phone.{country}');

var cleave = new Cleave(...)
```

#### AMD

```javascript
require(['cleave.min', 'vendor/cleave-phone.{country}'], function (Cleave) {
    var cleavePhone = new Cleave(...)
});
```

## Building & Running tests

```
npm install
```

```
gulp build & gulp test
```

## How does it work?

#### Credit card numbers
It detects credit card type dynamically by checking card [IIN](https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29). Based on different card types, lengths and grouping rules, it then separates the card number into blocks. 

#### Phone numbers
It uses `AsYouTypeFormatter` from google [libphonenumber](https://github.com/googlei18n/libphonenumber/) library to separate the phone number. Since the original lib includes patterns metadata of all the countries, the size is relatively large (gzipped 50K). Cleave.js separates the module for each country, so that you can include any of them as an extension (gzipped 5KB). 

#### Date
It revises invalid date input, and applies formatting with the pattern you passed in.

## References

- Payment credit card number IIN https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29
- Google phone numbers formatting https://github.com/googlei18n/libphonenumber

## Licence

Cleave.js is licensed under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

- Google [libphonenumber](https://github.com/googlei18n/libphonenumber) is included under its [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
