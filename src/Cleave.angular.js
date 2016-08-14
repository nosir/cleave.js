angular.module('cleave.js', [])
    .directive('cleave', function () {
        return {
            restrict: 'A',

            scope: {
                options: '='
            },

            controller: function ($scope, $element) {
                new Cleave($element[0], $scope.options);
            }
        };
    });
