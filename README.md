# Cleave.js

[![Travis](https://img.shields.io/travis/nosir/cleave.js.svg?maxAge=2592000)](https://travis-ci.org/nosir/cleave.js)
[![Codacy branch grade](https://img.shields.io/codacy/grade/b1c0b0da42fa418f887076a3f7352aea/master.svg?maxAge=2592000)](https://www.codacy.com/app/nosir/cleave-js)
[![npm version](https://badge.fury.io/js/cleave.js.svg)](https://badge.fury.io/js/cleave.js)

Cleave.js has a simple purpose: to help you format input text content automatically.

## Features

- Credit card number formatting
- Phone number formatting (i18n js lib separated by country to reduce size)
- Date formatting
- Numeral formatting
- Custom delimiter, prefix and blocks pattern
- CommonJS / AMD mode
- ReactJS component port

**TL;DR** [the demo page](http://nosir.github.io/cleave.js/)

## Why?

The idea is to provide an easy way to increase input field readability by formatting your typed data. By using this library, you won't need to write any mind-blowing regular expressions or mask patterns to format input text.

However, this isn't meant to replace any validation or mask library, you should still sanitize and validate your data in backend.

## Installation

#### npm

```bash
npm install --save cleave.js
```

#### bower

```bash
bower install --save cleave.js
```

#### old school
Grab file from [dist](https://github.com/nosir/cleave.js/tree/master/dist) directory

## Usage

Simply include

```html
<script src="cleave.min.js"></script>
<script src="cleave-phone.{country}.js"></script>
```

> `cleave-phone.{country}.js` addon is only required when phone shortcut mode is enabled. See more in documentation: [phone lib addon](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-addon.md) section

Then have a text field

```html
<input class="input-phone" type="text"/>
```

Now in your JavaScript

```js
var cleave = new Cleave('.input-phone', {
    mode:       'phone',
    regionCode: '{country}'
});
```

More examples: [the demo page](http://nosir.github.io/cleave.js/)

#### CommonJS
```js
var Cleave = require('cleave.js');
require('cleave.js/dist/addons/cleave-phone.{country}');

var cleave = new Cleave(...)
```

#### AMD

```js
require(['cleave.js/dist/cleave.min', 'cleave.js/dist/addons/cleave-phone.{country}'], function (Cleave) {
    var cleave = new Cleave(...)
});
```

## ReactJS component usage

```js
import React from 'react';
import ReactDOM from 'react-dom';

import Cleave from 'cleave.js/react';
```

Then in JSX:

```js
class MyComponent extends React.Component {
    onCreditCardChange(event) {
        // formatted pretty value
        console.log(event.target.value);
        
        // raw value
        console.log(event.target.rawValue);
    }

    render() {
        return (
            <Cleave placeholder="Enter your credit card number"
                options={{mode: 'creditCard'}}
                onChange={this.onCreditCardChange.bind(this)} />
        );
    }
}
```

As you can see, here you simply use `<Cleave/>` as a normal `<input/>` field 

- Attach HTML `<input/>` attributes
- Pass in the custom `options` prop
- Add ReactJS `onChange` event listener

See more in documentation: [ReactJS component usage](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md) section

## Playground

- [Plain JSFiddle](https://jsfiddle.net/nosir/kbaxx64s/)
- [React JSFiddle](https://jsfiddle.net/nosir/gLLsrxxf/)
- [Demo page](http://nosir.github.io/cleave.js/)

## Documentation

- [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md)
    - [Constructor](https://github.com/nosir/cleave.js/blob/master/doc/constructor.md)
    - [Options](https://github.com/nosir/cleave.js/blob/master/doc/options.md)
    - [Public methods](https://github.com/nosir/cleave.js/blob/master/doc/public-methods.md)
- [Phone lib addon](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-addon.md)
- [ReactJS component usage](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md)

## Building & Running tests

```bash
npm install
```

Build assets

```bash
gulp build
```

Run unit tests and lint

```bash
gulp mocha && gulp eslint
```

## Todo
- [x] ReactJS component port
- [x] Mocha unit tests for formatter classes
- [ ] AngularJS component port
- [ ] PhantomJS / Jest browser tests

## Get in touch
- Bugs / Suggestions: [open an issue](https://github.com/nosir/cleave.js/issues)
- Twitter: [@rison](https://twitter.com/rison)

## References

- Payment credit card number IIN https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29
- Google phone numbers formatting https://github.com/googlei18n/libphonenumber
- Decimal mark and thousands separating style https://en.wikipedia.org/wiki/Decimal_mark#Examples_of_use

## Licence

Cleave.js is licensed under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

- Google [libphonenumber](https://github.com/googlei18n/libphonenumber) is included under its [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

[![Analytics](https://ga-beacon.appspot.com/UA-79828599-1/cleave.js?pixel)](https://github.com/igrigorik/ga-beacon)
