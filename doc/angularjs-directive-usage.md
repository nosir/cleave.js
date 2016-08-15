# Cleave.js Documentation 

[Documentation](https://github.com/nosir/cleave.js/blob/master/doc/doc.md) > AngularJS directive usage

## Playground

- [Angular JSFiddle](https://jsfiddle.net/nosir/q58sh22t/)

## Basic usage

First include the directive module:

```html
<script src="cleave-angular.min.js"></script>
<script src="cleave-phone.{country}.js"></script>
```

And in your model:

```js
angular.module('app', ['cleave.js'])

.controller('AppController', function($scope) {
    $scope.onCreditCardTypeChanged = function(type) {
        $scope.model.creditCardType = type;
    };
    
    $scope.model = {
        value: ''
    };
    
    $scope.options = {
        creditCard: {
            creditCard: true,
            onCreditCardTypeChanged: $scope.onCreditCardTypeChanged
        }
    };
});
```

Then you can just use `cleave` directive with `input` field:

```html
<div ng-controller="AppController">
    <input ng-model="model.value" ng-whatever="..." type="text" placeholder="Enter credit card number"
        cleave options="options.creditCard"/>
</div>
```

## Advanced usage

Sometimes you might want to get the raw value. Here is the way to deal with it:

First in you model:

```js
angular.module('app', ['cleave.js'])

.controller('AppController', function($scope) {
    $scope.onCleaveValueChange = function(formattedValue, rawValue) {
        $scope.model.formattedValue = formattedValue;
        $scope.model.rawValue = rawValue;
    };
    
    $scope.onCreditCardTypeChanged = function(type) {
        $scope.model.creditCardType = type;
    };
    
    $scope.model = {
        value: ''
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
    <input ng-model="model.value" ng-whatever="..." type="text" placeholder="Enter credit card number"
        cleave options="options.creditCard" on-value-change="onCleaveValueChange"/>
    
    <p>raw value: {{model.rawValue}}</p>
    <p>formatted value: {{model.formattedValue}}</p>
    
    <p>ng-model value: {{model.value}}</p>
    
    <p>type: {{model.creditCardType}}</p>
</div>
```

As you can see, by passing the function (without `()`) to `on-value-change`, you register a callback from `cleave.js` directive.

Then in the callback, it returns `formattedValue` and `rawValue`. `formattedValue` here is same as your `ng-model` value.
