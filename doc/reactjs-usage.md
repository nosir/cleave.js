# Documentation 

[Cleave.js](https://github.com/nosir/cleave.js) > ReactJS usage

## Usage

### Babel compiler

> We assume you are familiar with building ReactJS project with Browserify / Webpack and Babel. Otherwise you may want to check [References](#references)

Cleave.js uses ES6 spread / rest feature, so you will need Babel compiler to transfer ES6 code.

If your project doesn't support it, please refer to [Legacy way](#legacy-way)

First install babel presets:

```bash
npm install --save babel-preset-es2015 babel-preset-react babel-preset-stage-0
```

And in `.babelrc`:

```json
{
  "presets": ["es2015", "stage-0", "react"]
}
```

Now in your ReactJS app:

```js
import React from 'react';
import ReactDOM from 'react-dom';

import Cleave from 'cleave.js/react';
import CleavePhone from 'cleave.js/dist/plugin/cleave-phone.{country}';
```

And define the component:

```js
class MyComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            creditCardRawValue: '',
            phoneRawValue:      '',
            dateRawValue:       '',
            numeralRawValue:    '',
            customRawValue:     ''
        };
    }

    onCreditCardChange(event) {
        this.setState({creditCardRawValue: event.target.rawValue});
    }

    onPhoneChange(event) {
        this.setState({phoneRawValue: event.target.rawValue});
    }

    onDateChange(event) {
        this.setState({dateRawValue: event.target.rawValue});
    }

    onNumeralChange(event) {
        this.setState({numeralRawValue: event.target.rawValue});
    }

    onCustomChange(event) {
        this.setState({customRawValue: event.target.rawValue});
    }

    render() {
        return (
            <div>
                <Cleave placeholder="credit card" options={{creditCard: true}}
                        onChange={this.onCreditCardChange.bind(this)}/>

                <Cleave placeholder="phone" options={{phone: true, phoneRegionCode: 'AU'}}
                        onChange={this.onPhoneChange.bind(this)}/>

                <Cleave placeholder="date" options={{date: true}}
                        onChange={this.onDateChange.bind(this)}/>

                <Cleave className="input-numeral" value="1234" options={{numeral: true}}
                        onChange={this.onNumeralChange.bind(this)}/>

                <Cleave options={{blocks: [4,3,3], delimiter: '-', numericOnly: true}}
                        onChange={this.onCustomChange.bind(this)}/>

                <div>
                    <p>credit card: {this.state.creditCardRawValue}</p>
                    <p>phone: {this.state.phoneRawValue}</p>
                    <p>date: {this.state.dateRawValue}</p>
                    <p>numeral: {this.state.numeralRawValue}</p>
                    <p>custom: {this.state.customRawValue}</p>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<MyComponent/>, document.getElementById('content'));
```

### Legacy way

If the project doesn't support compiling ES6, just include cleave lib like this. It will expose `Cleave` variable to global:

```js
var React = require('...');

require('cleave.js/dist/cleave-react.min');
require('cleave.js/dist/plugin/cleave-phone.{country}.js');
```

And define the component:

```js
var MyComponent = React.createClass({
    onCreditCardChange: function (event) {
        // formatted pretty value
        console.log(event.target.value);
        
        // raw value
        console.log(event.target.rawValue);
    },

    render: function () {
        return (
            <Cleave placeholder="Enter your credit card number"
                options={{creditCard: true}}
                onChange={this.onCreditCardChange} />
        );
    }
});
```

### Shim

Alternatively you can shim `Cleave.js` module. In your html:

```html
<script src="react/dist/react.min.js"></script>
<script src="react-dom/dist/react-dom.min.js"></script>

<script src="cleave.js/dist/cleave-react.min.js"></script>
<script src="cleave.js/dist/plugin/cleave-phone.{country}.js"></script>
```

The global expose name is `Cleave`

Then config your shim with [browserify-shim](https://github.com/thlorenz/browserify-shim) or [webpack](http://webpack.github.io/docs/shimming-modules.html)

## How does it work?

As you can see, here you simply use `<Cleave/>` as a normal `<input/>` field 

- Attach HTML `<input/>` attributes

    During rendering, it spreads all the input attributes down and apply formatting to the real input field.

- Pass in the custom `options` prop

    See full [options](https://github.com/nosir/cleave.js/blob/master/doc/options.md) documentation

- Add ReactJS `onChange` event listener

    Internally it only interpolates native React `onChange` and `onKeydown` events, but doesn't overwrite them, which means you can still attach the event listener, and do whatever you want in the handler.

    In the example above, we get the `rawValue` and update its `state` in handler, eventually will pass it to backend or `store` layer.


## References

- browserify: http://browserify.org/
- babelify: https://github.com/babel/babelify

- browserify-shim: https://github.com/thlorenz/browserify-shim
- webpack shim: http://webpack.github.io/docs/shimming-modules.html

- webpack: http://webpack.github.io/
- babel: http://babeljs.io/
- babel-loader: https://github.com/babel/babel-loader
