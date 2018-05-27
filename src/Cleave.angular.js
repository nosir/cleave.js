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
                        // eslint-disable-next-line
                        $scope.instance = new Cleave($element[0], $scope.cleave());

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

                        // Recreate cleave instance if any cleave options change
                        $scope.$watch(function() {
                            return $scope.cleave();
                            // eslint-disable-next-line
                        }, function (newOptions, oldOptions) {
                            $scope.instance.destroy();
                            // eslint-disable-next-line
                            $scope.instance = new Cleave($element[0], newOptions);
                        }, true);

                        $scope.$on('$destroy', function () {

                            $scope.instance.destroy();
                            $scope.instance = null;
                        });
                    }
                };
            }
        };
    });
