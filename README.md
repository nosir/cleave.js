# Cleave.js

[![Travis](https://img.shields.io/travis/nosir/cleave.js.svg?maxAge=2592000)](https://travis-ci.org/nosir/cleave.js)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b1c0b0da42fa418f887076a3f7352aea)](https://www.codacy.com/app/nosir/cleave-js?utm_source=github.com&utm_medium=referral&utm_content=nosir/cleave.js&utm_campaign=badger)
[![npm version](https://badge.fury.io/js/cleave.js.svg)](https://badge.fury.io/js/cleave.js)
[![npm downloads](https://img.shields.io/npm/dm/cleave.js.svg)](https://www.npmjs.com/package/cleave.js)
[![Documents](https://img.shields.io/badge/documents-check-3362c2.svg)](https://github.com/nosir/cleave.js/blob/master/doc/doc.md)

Cleave.js has a simple purpose: to help you format input text content automatically.

## Features

- Credit card number formatting
- Phone number formatting (i18n js lib separated for each country to reduce size)
- Date formatting
- Numeral formatting
- Custom delimiter, prefix and blocks pattern
- CommonJS / AMD mode
- ReactJS component
- AngularJS directive (1.x)
- ES Module

**TL;DR** [the demo page](http://nosir.github.io/cleave.js/)

## Why?

The idea is to provide an easy way to increase input field readability by formatting your typed data. By using this library, you won't need to write any mind-blowing regular expressions or mask patterns to format input text.

However, this isn't meant to replace any validation or mask library, you should still sanitize and validate your data in backend.

## Installation

#### npm

```bash
npm install --save cleave.js
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
    phone: true,
    phoneRegionCode: '{country}'
});
```

> `.input-element` here is a unique DOM element. If you want to apply Cleave for multiple elements, you need to give different CSS selectors and apply to each of them, effectively, you might want to create individual instance by a loop, e.g. [loop  solution](https://github.com/nosir/cleave.js/issues/138#issuecomment-268024840)

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

#### ES Module
```js
// Rollup, WebPack
import Cleave from 'cleave.js';
var cleave = new Cleave(...)

// Browser
import Cleave from 'node_modules/cleave.js/dist/cleave-esm.min.js';
var cleave = new Cleave(...)
```

#### TypeScript

Types are contributed by the community and are available via `npm install --save-dev @types/cleave.js`. Once installed, you can import Cleave like the following:

```ts
import Cleave = require('cleave.js');
```

Types for the React-component are also available and can be imported in the same way.

```ts
import Cleave = require('cleave.js/react');
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

    constructor(props, context) {
        super(props, context);
        this.onCreditCardChange = this.onCreditCardChange.bind(this);
        this.onCreditCardFocus = this.onCreditCardFocus.bind(this);
    }

    onCreditCardChange(event) {
        // formatted pretty value
        console.log(event.target.value);

        // raw value
        console.log(event.target.rawValue);
    }

    onCreditCardFocus(event) {
        // update some state
    }

    render() {
        return (
            <Cleave placeholder="Enter your credit card number"
                options={{creditCard: true}}
                onFocus={this.onCreditCardFocus}
                onChange={this.onCreditCardChange} />
        );
    }
}
```

As you can see, here you simply use `<Cleave/>` as a normal `<input/>` field

- Attach HTML `<input/>` attributes
- Pass in the custom `options` prop
- Add ReactJS `onChange` event listener

Advanced usage:

- [How to pass default value](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md#how-to-pass-default-value)
- [How to get ref of cleave instance and call methods](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md#how-to-call-public-methods)
- [How to update raw value](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md#how-to-update-raw-value)
- [How to get ref of the input field](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md#how-to-get-ref-of-the-input-field)
- [How to use it with redux form](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md#how-to-use-it-with-redux-form)

Usage for `Webpack`, `Browserify` and more in documentation: [ReactJS component usage](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md)

## AngularJS directive usage

First include the directive module:

```html
<script src="cleave.js/dist/cleave-angular.min.js"></script>
<script src="cleave.js/dist/addons/cleave-phone.{country}.js"></script>
```

And in your model:

```js
angular.module('app', ['cleave.js'])

.controller('AppController', function($scope) {
    $scope.onCreditCardTypeChanged = function(type) {
        $scope.model.creditCardType = type;
    };

    $scope.model = {
        rawValue: ''
    };

    $scope.options = {
        creditCard: {
            creditCard: true,
            onCreditCardTypeChanged: $scope.onCreditCardTypeChanged
        }
    };
});
```

Then easily you can apply `cleave` directive to `input` field:

```html
<div ng-controller="AppController">
    <input ng-model="model.rawValue" ng-whatever="..." type="text" placeholder="Enter credit card number"
        cleave="options.creditCard"/>
</div>
```

More usage in documentation: [Angular directive usage](https://github.com/nosir/cleave.js/blob/master/doc/angularjs-directive-usage.md)

## jQuery fn usage
Please check [here](https://github.com/nosir/cleave.js/issues/341)

## Playground

- [Plain JSFiddle (Basic usage)](https://jsfiddle.net/nosir/kbaxx64s/)
- [Plain JSFiddle (More examples)](https://jsfiddle.net/nosir/aLnhdf3z/)
- [React JSFiddle](https://jsfiddle.net/nosir/gLLsrxxf/)
- [Angular JSFiddle](https://jsfiddle.net/nosir/q58sh22t/)

## Documentation

- [JavaScript API](https://github.com/nosir/cleave.js/blob/master/doc/js-api.md)
    - [Constructor](https://github.com/nosir/cleave.js/blob/master/doc/constructor.md)
    - [Options](https://github.com/nosir/cleave.js/blob/master/doc/options.md)
    - [Public methods](https://github.com/nosir/cleave.js/blob/master/doc/public-methods.md)
- [Phone lib addon](https://github.com/nosir/cleave.js/blob/master/doc/phone-lib-addon.md)
- [ReactJS component usage](https://github.com/nosir/cleave.js/blob/master/doc/reactjs-component-usage.md)
- [AngularJS directive usage](https://github.com/nosir/cleave.js/blob/master/doc/angularjs-directive-usage.md)

## Run tasks

```bash
npm install
```

Build assets

```bash
gulp build
```

Run tests

```bash
gulp test
```

Lint

```bash
gulp eslint
```

Publish (build, tests & lint)

```bash
gulp publish
```

> For contributors, please run `gulp publish` to ensure your PR passes tests and lint, also we have a [not in the plan](https://github.com/nosir/cleave.js/blob/master/doc/not-in-the-plan.md) list you may concern.

## Get in touch
- Twitter: [@rison](https://twitter.com/rison)

## References

- Payment credit card number IIN https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_.28IIN.29
- Google phone numbers formatting https://github.com/googlei18n/libphonenumber
- Decimal mark and thousands separating style https://en.wikipedia.org/wiki/Decimal_mark#Examples_of_use

## Licence

Cleave.js is licensed under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

- Google [libphonenumber](https://github.com/googlei18n/libphonenumber) is included under its [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

[![Analytics](https://ga-beacon.appspot.com/UA-79828599-1/cleave.js?pixel)](https://github.com/igrigorik/ga-beacon)
