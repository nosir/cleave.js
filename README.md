# Cleave.js

[![Travis](https://img.shields.io/travis/nosir/cleave.js.svg?maxAge=2592000)](https://travis-ci.org/nosir/cleave.js)

Cleave.js has a simple purpose: to help you format input text content automatically.

## Features

- Credit card number formatting
- Phone number formatting (metadata pattern js separated by countries to reduce size)
- Date formatting
- Numeral formatting
- Custom delimiter, prefix and blocks pattern
- CommonJS / AMD mode
- ReactJS component port

**TL;DR** [the demo page]()

## Why?

The idea is to provide an easy way to increase readability when you are typing. By using the library, you won't need to write any mind-blowing regular expressions or mask patterns to format input text.

However, this isn't meant to replace any validation or mask library, you should still sanitize and validate your data in backend.

## Installation

#### npm

```
npm install --save cleave.js
```

#### bower

```
bower install --save cleave.js
```

#### throwback
Grab the file from [dist](https://github.com/nosir/cleave.js/tree/master/dist) directory

## Usage

Simply include

```html
<script src="cleave.min.js"></script>
<script src="cleave-phone.{country}.js"></script>
```

> `cleave-phone.js` plugin is only required when phone shortcut mode is enabled. See more in documentation: [phone lib plugin](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-plugin.md) section

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

#### CommonJS (Node.js)
```javascript
var Cleave = require('cleave.js');
require('cleave.js/dist/plugin/cleave-phone.{country}');

var cleave = new Cleave(...)
```

#### AMD

```javascript
require(['cleave.js/dist/cleave.min', 'cleave.js/dist/plugin/cleave-phone.{country}'], function (Cleave) {
    var cleave = new Cleave(...)
});
```

## ReactJS usage

```
import React from 'react';
import ReactDOM from 'react-dom';

import Cleave from 'cleave.js/react';
```

Then in JSX:

```
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
                options={{creditCard: true}}
                onChange={this.onCreditCardChange.bind(this)} />
        );
    }
}
```

As you can see, here you simply use `<Cleave/>` as a normal `<input/>` field 

- Attach HTML `<input/>` attributes
- Pass in the custom `options` prop
- Add ReactJS `onChange` event listener

See more in documentation: [ReactJS usage](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-usage.md) section

## Documentation

- [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md)
    - [Constructor](https://github.com/nosir/cleave.js/blob/master/doc/constructor.md)
    - [Options](https://github.com/nosir/cleave.js/blob/master/doc/options.md)
    - [Public methods](https://github.com/nosir/cleave.js/blob/master/doc/public-methods.md)
- [Phone lib plugin](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-plugin.md)
- [ReactJS usage](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-usage.md)

## Building & Running tests

```
npm install
```

Build assets

```
gulp build
```

Run unit tests and lint

```
gulp mocha && gulp eslint
```

## Todo
- [x] ReactJS component port
- [ ] AngularJS component port
- [x] Mocha unit tests for formatter classes
- [ ] PhantomJS / Jest browser tests

## References

- Payment credit card number IIN https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29
- Google phone numbers formatting https://github.com/googlei18n/libphonenumber
- Decimal mark and thousands separating style https://en.wikipedia.org/wiki/Decimal_mark#Examples_of_use

## Licence

Cleave.js is licensed under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

- Google [libphonenumber](https://github.com/googlei18n/libphonenumber) is included under its [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
