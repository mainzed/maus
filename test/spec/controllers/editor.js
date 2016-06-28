'use strict';

describe('Controller: EditorCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp'));

    var EditorCtrl;
    var scope;
    var httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
        scope = _$rootScope_.$new();
        httpBackend = _$httpBackend_;
        EditorCtrl = _$controller_('EditorCtrl', {
            $scope: scope
            // place here mocked dependencies
        });

    }));


    it('should have defined scope', function () {
        expect(scope).toBeDefined();
    });

    describe("processIncludes()", function() {

        beforeEach(function () {
            // mock definitions request
            httpBackend.when("GET", "/api/definitions")  // has to be same url that is used in service
                .respond(200, [{
                                _id: "571725cd5c6b2bd90ed10b6e",
                                 word: "definition",
                                __v: 0,
                                url: "www.google.de",
                                text: "This is the definition description!",
                                updated_at: "2016-04-20T06:46:37.887Z",
                                filetype: "opOlat",
                                category: "definition",
                                author: "John Doe"
                        }]);
        });

        afterEach(function() {
            try {
                httpBackend.flush();
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();
            } catch(e) {
                // statements
                //console.log(e);
            }

        });


        it('should do nothing if no includes defined', function(done) {
            var markdown = [
                "# heading 1",
                "some text"
            ].join("/n");

            var expected = markdown;
            var actual;
            scope.processIncludes(markdown, function() {
                actual = markdown;
                expect(1).toBe(2);
                done();
            });



        });

        it('should replace include with content', function() {
            var file = {
                markdown: "content of included file!"
            }
            var markdown = [
                "# heading 1",
                "some text before",
                "include some_other_file",
                "some text after"
            ].join("\n");

            var actual = scope.processIncludes(markdown);
            var expected = [
                "# heading 1",
                "some text before",
                "content of included file!",
                "some text after"
            ].join("\n");

            expect(actual).toBe(expected);
        });

        it('should throw error if include does not exist');
    });


    /*it('should initiate codemirror editor', function() {
        //expect(scope.showSuccess).toBe(false);

        scope.onCodeMirrorLoaded();

        expect(scope.editor).toBeDefined();
        //$scope.addSnippet
    }, 2000);*/

    /*it('should add given snippet to codemirror content', function () {
        //scope.codemirrorLoaded(_editor);
        //var content = "some content";
        //scope.editor.setValue(content);

        var snippet = "some *markdown* snippet!";
        scope.addSnippet(snippet);

        expect(EditorCtrl.editor.getValue()).toBe(content + snippet);

    });*/

    describe('definition functions', function() {

        /*it('should add new object to definitions array', function() {

            //scope.file.type = "testtype";
            scope.definitions = [{
                    _id: "definition1",
                    word: "Test"
                },{
                    _id: "definition2",
                    word: "Test2"
                }];

            expect(scope.definitions.length).toBe(2);

            // add new
            scope.onCreateDefinitionClick();

            expect(scope.definitions.length).toBe(3);
            //expect(scope.definitions[2]).toBe("testtype");

        });*/

    });




});
