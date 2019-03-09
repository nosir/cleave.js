# Cleave.js Documentation

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > ReactJS component usage

## Playground

- [React JSFiddle](https://jsfiddle.net/nosir/gLLsrxxf/)

## Babel usage

Cleave.js uses ES6 spread / rest feature, and we recommend using Babel compiler to transfer ES6 code.

However, if for some reason you would like to just refer to the final bundled script, check the [legacy way](#legacy-way).

First, install babel presets:

```bash
npm install --save babel-preset-es2015 babel-preset-react
```

For `Webpack`, also do:

```bask
npm install --save babel-core babel-loader
```

After that, add `.babelrc` to your project root with:

```json
{
  "presets": ["es2015", "react"]
}
```

Now in your ReactJS app:

```js
import React from 'react';
import ReactDOM from 'react-dom';

import Cleave from 'cleave.js/react';
import CleavePhone from 'cleave.js/dist/addons/cleave-phone.{country}';
```

**About the `{country}` code:** Unlike the `phoneRegionCode` value in `Cleave` component `options` property, the `country` here in this `import` statement must be given in lowercase.

**Example:**

```js
import CleavePhone from 'cleave.js/dist/addons/cleave-phone.pt';
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

        this.onCreditCardChange = this.onCreditCardChange.bind(this);
        this.onCreditCardFocus = this.onCreditCardFocus.bind(this);
        this.onPhoneChange = this.onPhoneChange.bind(this);
        this.onCustomChange = this.onCustomChange.bind(this);
    }

    onCreditCardChange(event) {
        this.setState({creditCardRawValue: event.target.rawValue});
    }

    onCreditCardFocus(event) {
        // update some state
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
                <Cleave placeholder="Enter your credit card number" options={{creditCard: true}}
                        onChange={this.onCreditCardChange}
                        onFocus={this.onCreditCardFocus}/>

                <Cleave className="css-phone" options={{phone: true, phoneRegionCode: 'AU'}}
                        onChange={this.onPhoneChange}/>

                <Cleave options={{blocks: [4,3,3], delimiter: '-', numericOnly: true}}
                        onChange={this.onCustomChange}/>

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

### Webpack and Browserify config

#### Webpack

```js
loaders: [
    {
        test: ...,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
            presets: ['es2015', 'react']
        }
    }
]
```

#### Browserify

```js
browserify(...).transform('babelify', {presets: ['es2015', 'react']})...
```

## Legacy way

If for some reason you would like to just refer to the final bundled script (e.g. your project doesn't support ES6 compiling), you can include cleave.js like this.

It will also expose `Cleave` variable to global:

```js
import Cleave from 'cleave.js/dist/cleave-react';
import CleavePhone from 'cleave.js/dist/addons/cleave-phone.{country}';
```

or

```js
var Cleave = require('cleave.js/dist/cleave-react');
var CleavePhone = require('cleave.js/dist/addons/cleave-phone.{country}');
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

## Shim

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

## Advanced usage

### How to pass default value

```js
<Cleave placeholder="Enter credit card number" options={{creditCard: true}}
        onChange={this.onCreditCardChange}
        value="Default Card Value"/>
```

### How to call public methods

In order to call [public methods](https://github.com/nosir/cleave.js/blob/master/doc/public-methods.md), you will need to get the ref of the instance.

Pass `onInit` callback into component, which returns the cleave instance, then store it as a variable or in state.

```
onCreditCardInit(cleave) {
    this.setState({creditCardCleave: cleave});
}
```

```
<Cleave options={{creditCard: true}} onInit={this.onCreditCardInit} />
```

### How to update raw value

Basically, out of the box, cleave component can be seen as an uncontrolled input component, and there is no data binding between the `value` attribute and the actual value updating logic internally.

Try to bind `value` with any state in your component can lead to unexpected behaviours. The only case of using `value` attribute is to pass it as the default value in initialization.

While sometimes you might want to set / update the raw value, here is what you can do:

- Pass `onInit` callback into component, which returns the cleave instance, then store it as a variable or in state.
- Call `cleave.setRawValue('...')` to update the raw value.
- `onChange` event will be triggered, from here you can grab the returned raw / formatted value and update your state.

```js
class MyComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            creditCardCleave:   null,
            creditCardRawValue: ''
        };

        this.onCreditCardChange = this.onCreditCardChange.bind(this);
        this.onCreditCardInit = this.onCreditCardInit.bind(this);

        this.reset = this.reset.bind(this);
    }

    onCreditCardChange(event) {
        this.setState({creditCardRawValue: event.target.rawValue});
    }

    onCreditCardInit(cleave) {
        this.setState({creditCardCleave: cleave});
    }

    reset() {
        this.state.creditCardCleave.setRawValue(Math.floor(5000 * Math.random()));
    }

    render() {
        return (
            <div>
                <Cleave placeholder="Enter credit card number"
                        options={{creditCard: true}}
                        onInit={this.onCreditCardInit}
                        onChange={this.onCreditCardChange}/>

                <p>credit card: {this.state.creditCardRawValue}</p>

                <button onClick={this.reset}>Reset!</button>
            </div>
        );
    }
}

ReactDOM.render(<MyComponent/>, document.getElementById('content'));

```

[JSFiddle](https://jsfiddle.net/nosir/k4pom0ap/)

### How to get ref of the input field

Sometimes you might want to call the underlying input method, e.g: `focus`, `blur`, etc...

Instead of using `ref`, you need to use `htmlRef` to pass the ref callback function, like this:

```js
class MyComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onBtnClick = this.onBtnClick.bind(this);
    }

    onBtnClick() {
        this.ccInput.focus();
    }

    render() {
        return (
            <div>
                <Cleave htmlRef={(ref) => this.ccInput = ref } options={{creditCard: true}}/>

                <button onClick={this.onBtnClick}>Focus!</button>
            </div>
        );
    }
}

ReactDOM.render(<MyComponent/>, document.getElementById('content'));
```

For more about ReactJS callback refs, check [here](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute)

Also please be aware cleave.js doesn't support [The ref String Attribute](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-string-attribute), which is claimed as legacy by ReactJS (very likely to be deprecated in the future)

Please avoid using this ref to get / set any value of the input field, which can lead to unexpected behaviour.

### How to use it with Redux Form

Create a stateless component function:

```js
import Cleave from 'cleave.js/react';

const renderCleaveField = field => (
    <Cleave {...field.input} options={{creditCard: true}} />
)
```

Render it into the normal `redux-form` `Field`

```js
<form onSubmit={...}>
    <Field name="creditCard" component={renderCleaveField} />
    <Field name="email" component="input" type="email" />
    <button type="submit">Submit</button>
</form>
```

Then it just works.

Or, you could also use the normalize abstraction at `Field` level, check the discussion [here](https://github.com/nosir/cleave.js/issues/159#issuecomment-326487309)

### How to use it with React Final Form

Create an adapter with cleave.js:

[here](https://github.com/nosir/cleave.js/issues/335#issuecomment-402936738)

## References

- browserify: http://browserify.org/
- babelify: https://github.com/babel/babelify
- browserify-shim: https://github.com/thlorenz/browserify-shim
- webpack shim: http://webpack.github.io/docs/shimming-modules.html
- webpack: http://webpack.github.io/
- babel: http://babeljs.io/
- babel-loader: https://github.com/babel/babel-loader
