/**
 * ngCssInjector 0.2.2
 * https://github.com/CristianMR/ngcssinjector
 * (c) Cristian Martín Rios 2014 | License MIT
 * Based on angular-css-injector v1.0.4, copyright (c) 2013 Gabriel Delépine
 */
'use strict';
angular.module('ngCssInjector', []).provider('cssInjector', [function() {
    var singlePageMode = false;
    var defaultOrderByExpression = false;

    function CssInjector($q, $rootScope, $filter, scope){
        var defers = {};
        var indexedStylesheets = {};
        var orderBy = $filter('orderBy');

        // Capture the event `locationChangeStart` when the url change. If singlePageMode===TRUE, call the function `disableAll`
        $rootScope.$on('$locationChangeStart', function(){
            if(singlePageMode === true)
                disableAll();
        });

        // Used to add a CSS files in the head tag of the page, and return promise if true, else false
        var addStylesheet = function(href){
            var extra = false;
            //Extra info can be used to order the array
            if(typeof href === "object"){
                if(!href.href) return;
                extra = href;
                extra.disabled = false;
                href = href.href;
            }

            if(indexedStylesheets[href]) {
                enableStylesheet(href);
                return false;
            }
            var stylesheet = extra || {disabled: false, href: href};
            scope.injectedStylesheets.push(stylesheet);
            if(scope.orderByExpression)
                scope.injectedStylesheets = orderBy(scope.injectedStylesheets, scope.orderByExpression);
            indexedStylesheets[href] = stylesheet;

            var defer = $q.defer();
            defers[href] = defer;
            return defer.promise;
        };

        /**
         * Multiple styles plus promise when loaded all !
         */
        var addManyStylesheet = function(array){
            var deferAll = $q.defer();
            var promises = [];
            for(var i = 0; i < array.length; i++){
                var promise = addStylesheet(array[i]);
                if(promise){
                    promises.push(promise);
                }
            }

            $q.all(promises).then(deferAll.resolve, deferAll.reject);

            return deferAll.promise;
        };

        var enableStylesheet = function(href){
            if(typeof href === "object") href = href.href;
            if(indexedStylesheets[href]) indexedStylesheets[href].disabled = false;
        };

        var disableStylesheet = function(href){
            if(typeof href === "object") href = href.href;
            if(indexedStylesheets[href]) indexedStylesheets[href].disabled = true;
        };

        var disableManyStylesheet = function(array){
            if(indexedStylesheets)
                for(var i = 0; i < array.length; i++){
                    disableStylesheet(array[i]);
                }
        };

        var disableAll = function(){
            if(indexedStylesheets)
                for(var i = 0; i < indexedStylesheets.length; i++)
                    disableStylesheet(indexedStylesheets[i]);
        };

        var remove = function(href){
            if(indexedStylesheets && indexedStylesheets[href]){
                delete indexedStylesheets[href];
                for(var i = 0; i < scope.injectedStylesheets.length; i++){
                    if(scope.injectedStylesheets[i].href === href){
                        scope.injectedStylesheets.splice(i, 1);
                        break;
                    }
                }
            }
        };

        var removeMany = function(array){
            for(var i = 0; i < array.lenght; i++)
                remove(array[i]);
        };

        var removeAll = function(){
            indexedStylesheets = {}; // Make it empty
            scope.injectedStylesheets = [];
        };

        //Resolve promise
        var loaded = function(href){
            if(defers[href]){
                defers[href].resolve();
                delete defers[href];
            }
        };

        return {
            add: addStylesheet,
            addMany: addManyStylesheet,
            disable: disableStylesheet,
            disableMany: disableManyStylesheet,
            disableAll: disableAll,
            remove: remove,
            removeAll: removeAll,
            removeMany: removeMany,
            loaded: loaded //used by cssInjectorCallback directive
        };
    }

    this.$get = ['$q', '$compile', '$filter', '$timeout', '$rootScope', function($q, $compile, $filter, $timeout, $rootScope){
        var head = angular.element(document.getElementsByTagName('head')[0]);
        var scope = head.scope();
        if(scope === undefined)
            throw("ngCssInjector error : Please initialize your app in the HTML tag and be sure your page has a HEAD tag.");
        scope.injectedStylesheets = [];
        scope.orderByExpression = defaultOrderByExpression;
        $timeout(function(){
            head.append($compile("<link data-ng-repeat='href in injectedStylesheets track by href.href' data-ng-href='{{href.href}}' value='href.disabled' css-injector-callback rel='stylesheet'/>")(scope))
        });
        return new CssInjector($q, $rootScope, $filter, scope);
    }];

    this.setSinglePageMode = function(mode){
        singlePageMode = mode;
        return this;
    };

    this.setOrderByExpression = function(expression){
        defaultOrderByExpression = expression;
    };
}]).directive('cssInjectorCallback', ['cssInjector', function (cssInjector) {
    return {
        scope: {
            value: '='
        },
        link: function(scope, element, attrs) {

            scope.$watch('value', function(value){
                element[0].disabled = value;//Enable or disable link element
            });

            element.bind('load', function () {
                cssInjector.loaded(attrs.href);
            });
            /*
             If error happend, that's okey :D
             */
            element.bind('error', function () {
                console.error('CSS INJECTOR: CSS NOT FOUND:', attrs.href);
                cssInjector.loaded(attrs.href);
            });
        }
    }
}]);