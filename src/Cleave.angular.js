angular.module('cleave.js', [])
    .directive('cleave', function () {
        return {
            restrict: 'A',
            require:  'ngModel',

            scope: {
                cleave:        '&',
                onValueChange: '&?'
            },

            compile: function () {
                return {
                    pre: function ($scope, $element, attrs, ngModelCtrl) {
                        $scope.cleave = new window.Cleave($element[0], $scope.cleave());

                        ngModelCtrl.$formatters.push(function (val) {
                            $scope.cleave.setRawValue(val);

                            return $scope.cleave.getFormattedValue();
                        });

                        ngModelCtrl.$parsers.push(function (newFormattedValue) {
                            if ($scope.onValueChange) {
                                $scope.onValueChange()(newFormattedValue);
                            }

                            return $scope.cleave.getRawValue();
                        });
                    }
                };
            }
        };
    });
