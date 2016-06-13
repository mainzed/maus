'use strict';

describe('Service: AuthService', function () {

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    var service;

    beforeEach(inject(function (_AuthService_) {
        service = _AuthService_;
    }));


    it('should be defined', function () {
        expect(service).toBeDefined();
    });

    describe('login / logout', function() {
        
        afterEach(function() {
            service.logout();
        });

        it('should create user if username and password are correct', function() {

        var success;
        service.login("axel", "axel", function() {
                // success
                success = true;
            }, function() {
                // error
                success = false;
            });
            expect(success).toBe(true);
            expect(service.getUser().name).toEqual("axel");
            expect(service.getUser().group).toEqual("admin");
            expect(service.isAuthenticated()).toBe(true);
        });

        it('should not create user if password or user is incorrect', function() {

            var success;
            service.login("Unknown User", "password", function() {
                // success
                success = true;
            }, function() {
                // error
                success = false;
            });
            expect(success).toBe(false);
            expect(service.getUser()).toBeUndefined();
            expect(service.isAuthenticated()).toBe(false);
        });

        it('should logout if currentUser exists', function() {

            // login user
            var success;
            service.login("axel", "axel", function() {
                // success
                success = true;
            }, function() {
                // error
                success = false;
            });
            expect(success).toBe(true);

            // logout
            service.logout();

            expect(service.getUser()).toBeUndefined();
            expect(service.isAuthenticated()).toBe(false);
        });

    });

    

});
