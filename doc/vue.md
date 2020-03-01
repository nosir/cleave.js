# Use in VueJs
Please check [here](https://github.com/nosir/cleave.js/issues/341)

While this package does not have an official support for use in VueJs. This can be done in few simple steps.

## To use globally

```js
import Vue from 'vue'
import Cleave from 'cleave.js';

Vue.directive('cleave', {
    inserted: (el, binding) => {
        el.cleave = new Cleave(el, binding.value || {})
    },
    update: (el) => {
        const event = new Event('input', {bubbles: true});
        setTimeout(function () {
            el.value = el.cleave.properties.result
            el.dispatchEvent(event)
        }, 100);
    }
})
```

## To use as a local local directive

```js
import Cleave from 'cleave.js';
export default {

    ...
    directives: {
        cleave: {
            inserted: (el, binding) => {
                el.cleave = new Cleave(el, binding.value || {})
            },
            update: (el) => {
                const event = new Event('input', {bubbles: true});
                setTimeout(function () {
                    el.value = el.cleave.properties.result
                    el.dispatchEvent(event)
                }, 100);
            }
        }
    }
    ...
}
```

And use it in your HTML like

```html
    <input v-model="ccNumber" class="input-element" v-cleave="{creditCard: true, onCreditCardTypeChanged : cardChanged}">                      
    <input name="text"  v-model="ccMonth" v-cleave="{date: true,datePattern: ['m']}">             
    <input type="number" v-model="ccv" v-cleave="{numeral: true,numeralPositiveOnly: true,numeralIntegerScale: 3}">           
```

Here is a [codesandbox](https://codesandbox.io/s/cleave-js-vue-integration-qmw28)
