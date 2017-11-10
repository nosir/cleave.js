angular.module('cleave.js', [])
    .directive('cleave', function () {
        return {
            restrict: 'A',
            require: 'ngModel',

            scope: {
                cleave: '&',
                onInit: '&?',
                onValueChange: '&?'
            },

            compile: function () {
                return {
                    pre: function ($scope, $element, attrs, ngModelCtrl) {
                        $scope.instance = new window.Cleave($element[0], $scope.cleave());

                        if ($scope.onInit) {
                            $scope.onInit()($scope.instance);
                        }

                        ngModelCtrl.$formatters.push(function (val) {
                            $scope.instance.setRawValue(val);

                            return $scope.instance.getFormattedValue();
                        });

                        ngModelCtrl.$parsers.push(function (newFormattedValue) {
                            if ($scope.onValueChange) {
                                $scope.onValueChange()(newFormattedValue);
                            }

                            return $scope.instance.getRawValue();
                        });
                    }
                };
            }
        };
    });
