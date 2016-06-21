'use strict';

//var MainCtrl = require('./app/controllers/main.js');

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp'));

    var MainCtrl;
    var scope;
    var httpBackend;
    var location;
    var AuthService;
    var route;

    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_, _$location_, _$route_, _AuthService_) {
        scope = _$rootScope_.$new();
        MainCtrl = _$controller_("MainCtrl", {
          $scope: scope
          // place here mocked dependencies
        });
        httpBackend = _$httpBackend_;
        location = _$location_;
        route = _$route_;
        AuthService = _AuthService_;

    }));

    it('should have defined scope', function () {
        expect(scope).toBeDefined();
        expect(MainCtrl).toBeDefined();
    });

    /*it('should redirect to login page if user is not logged in ', inject(function() {

        // make sure no user is logged in
        expect(AuthService.isAuthenticated()).toBe(false);

        // start check
        scope.init();

        // redirect to login page
        expect(location.path()).toEqual("/login");
    }));*/

    /*it('should stay on page if user is logged in', inject(function($route) {

        // create a mock for the AuthService
        AuthService = {
            isAuthenticated: function() {
                return true;
            },

            getUser: function() {
                return {
                    name: "John Doe",
                    group: "admin"
                };
            }
        };

        // check if mocked AuthService works
        expect(AuthService.isAuthenticated()).toBe(true);
        expect(AuthService.getUser()).toEqual({
            name: "John Doe",
            group: "admin"
        });

        // start check
        scope.init();

        // should still be the current page
        expect(location.path()).toEqual("/files");

    }));*/


    it('should remove files from local array', function() {
        var files = [
            {
                _id: "file1"
            },{
                _id: "file2"
            },{
                _id: "file3"
            },{
                _id: "file4"
            }
        ];

        var index = _.findIndex(files, {_id: "file2"});

        files.splice(index, 1);

        expect(files.length).toBe(3);
        expect(files).toEqual(
            [{
                _id: "file1"
            },{
                _id: "file3"
            },{
                _id: "file4"
            }]
        );
    });



});
