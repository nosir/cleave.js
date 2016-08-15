angular.module('cleave.js', [])
    .directive('cleave', function () {
        return {
            restrict: 'A',
            require:  'ngModel',

            scope: {
                options:       '=',
                onValueChange: '&?'
            },

            controller: function ($scope, $element) {
                $scope.cleave = new Cleave($element[0], $scope.options);
                $scope.onValueChange = $scope.onValueChange || null;
            },

            link: function ($scope, $element, attrs, ngModel) {
                if ($scope.onValueChange) {
                    $scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function () {
                        $scope.onValueChange()($scope.cleave.getFormattedValue(), $scope.cleave.getRawValue());
                    });
                }
            }
        };
    });
