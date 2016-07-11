# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > ReactJS component usage

## Playground

- [React JSFiddle](https://jsfiddle.net/nosir/gLLsrxxf/)

## Usage

### Babel compiler

Cleave.js uses ES6 spread / rest feature, and we recommend using Babel compiler to transfer ES6 code.

However, if your project doesn't support it, you can still refer to the [legacy way](#legacy-way).

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
import CleavePhone from 'cleave.js/dist/addons/cleave-phone.{country}';
```

And define the component:

```js
class MyComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            creditCardRawValue: '',
            phoneRawValue:      '',
            customRawValue:     ''
        };
    }

    onCreditCardChange(event) {
        this.setState({creditCardRawValue: event.target.rawValue});
    }

    onPhoneChange(event) {
        this.setState({phoneRawValue: event.target.rawValue});
    }

    onCustomChange(event) {
        this.setState({customRawValue: event.target.rawValue});
    }

    render() {
        return (
            <div>
                <Cleave placeholder="Enter your credit card number" options={{mode: 'creditCard'}}
                        onChange={this.onCreditCardChange.bind(this)}/>

                <Cleave className="css-phone" options={{mode: 'phone', phoneRegionCode: 'AU'}}
                        onChange={this.onPhoneChange.bind(this)}/>

                <Cleave options={{blocks: [4,3,3], delimiter: '-', numericOnly: true}}
                        onChange={this.onCustomChange.bind(this)}/>

                <div>
                    <p>credit card: {this.state.creditCardRawValue}</p>
                    <p>phone: {this.state.phoneRawValue}</p>
                    <p>custom: {this.state.customRawValue}</p>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<MyComponent/>, document.getElementById('content'));
```

### Legacy way

If your project doesn't support ES6 compiling, just include cleave.js like this. It will expose `Cleave` variable to global:

```js
var React = require('...');

require('cleave.js/dist/cleave-react');
require('cleave.js/dist/addons/cleave-phone.{country}.js');
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
                options={{mode: 'creditCard'}}
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
<script src="cleave.js/dist/addons/cleave-phone.{country}.js"></script>
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

    Internally it interpolates native React `onChange` and `onKeyDown` events, does all the formatting magic and triggers the event callback.
    
    The only thing getting added to the event object is the `rawValue` (delimiter stripped value) of the input field, that you might be interested in.
    
    In the example above, we get the `rawValue` and update its `state` in handler, eventually it will be passed to backend or `store` layer.

## References

- browserify: http://browserify.org/
- babelify: https://github.com/babel/babelify
- browserify-shim: https://github.com/thlorenz/browserify-shim
- webpack shim: http://webpack.github.io/docs/shimming-modules.html
- webpack: http://webpack.github.io/
- babel: http://babeljs.io/
- babel-loader: https://github.com/babel/babel-loader
