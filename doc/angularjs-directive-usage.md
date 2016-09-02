# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > AngularJS directive usage

## Playground

- [Angular JSFiddle](https://jsfiddle.net/nosir/q58sh22t/)

## Basic usage

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

## Advanced usage

By using `Cleave.js`, angular renders the input field with the formatted value, but keeps `ng-model` value as the raw value.

If you are looking to obtain the formatted value, here is the way:

First in you model:

```js
angular.module('app', ['cleave.js'])

.controller('AppController', function($scope) {
    $scope.onCleaveValueChange = function(formattedValue) {
        $scope.model.formattedValue = formattedValue;
    };
    
    $scope.onCreditCardTypeChanged = function(type) {
        $scope.model.creditCardType = type;
    };
    
    $scope.model = {
        rawValue: '',
        formattedValue: ''
    };
    
    $scope.options = {
        creditCard: {
            creditCard: true,
            onCreditCardTypeChanged: $scope.onCreditCardTypeChanged
        }
    };
});
```

Then in your html:

```html
<div ng-controller="AppController">
    <input ng-model="model.rawValue" ng-whatever="..." type="text" placeholder="Enter credit card number"
        cleave="options.creditCard" on-value-change="onCleaveValueChange"/>
    
    <p>raw (ng-model) value: {{model.rawValue}}</p>
    <p>formatted value: {{model.formattedValue}}</p>
    
    <p>type: {{model.creditCardType}}</p>
</div>
```

As you can see, by passing the function (without `()`) to `on-value-change`, you register a callback from `cleave.js` directive.

Then in the callback, it returns `formattedValue` as the only parameter.
