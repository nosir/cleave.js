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
        creditCard: true,
        onCreditCardTypeChanged: $scope.onCreditCardTypeChanged
    };
});
```

Then easily you can apply `cleave` directive to `input` field:

```html
<div ng-controller="AppController">
    <input ng-model="model.rawValue" ng-whatever="..." type="text" placeholder="Enter credit card number"
        cleave="options"/>
</div>
```

## Advanced usage

### How to get formatted value

By using `Cleave.js`, angular renders the input field with the formatted value, but keeps `ng-model` value as the raw value.

If you are looking to obtain the formatted value, here is the way:

To get input changed value object from [on value changed](https://github.com/nosir/cleave.js/blob/master/doc/options.md#onvaluechanged) callback:

First in you model:

```js
angular.module('app', ['cleave.js'])

.controller('AppController', function($scope) {
    $scope.onCreditCardTypeChanged = function(type) {
        $scope.model.creditCardType = type;
    };
    
    $scope.onValueChanged = function(e) {
        $scope.model.formattedValue = e.target.value;
    };
    
    $scope.model = {
        creditCardType: '',
        rawValue: '',
        formattedValue: ''
    };
    
    $scope.options = {
        creditCard: true,
        onCreditCardTypeChanged: $scope.onCreditCardTypeChanged
        onValueChanged: $scope.onValueChanged
    };
});
```

Then in your html:

```html
<div ng-controller="AppController">
    <input ng-model="model.rawValue" ng-whatever="..."
        type="text" placeholder="Enter credit card number"
        cleave="options" />
    
    <p>raw (ng-model) value: {{model.rawValue}}</p>
    <p>formatted value: {{model.formattedValue}}</p>
    <p>type: {{model.creditCardType}}</p>
</div>
```

### How to call public methods

In order to call [public methods](https://github.com/nosir/cleave.js/blob/master/doc/public-methods.md), you will need to get the ref of the instance.

It returns the cleave instance as the parameter within the `on-init` callback.

Consider the formatted value demo above:

```
$scope.onInit = function(cleave) {
    $scope.model.cleave = cleave;
};
```

[JSFiddle to call getISOFormatDate()](https://jsfiddle.net/nosir/frtfwop5/)
