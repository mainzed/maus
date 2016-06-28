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

        it('should do nothing if no includes defined', function() {
            var markdown = [
                "# heading 1",
                "some text"
            ].join("/n");
            var actual = scope.processIncludes(markdown, []);

            expect(actual).toBe(markdown);
        });

        it('should replace include with content', function() {
            var files = [{
                _id: "571725cd5c6b2bd90ed10b6e",
                title: "some_other_file",
                markdown: "content of included file!"
            }];

            var markdown = [
                "# heading 1",
                "some text before",
                "include(some_other_file)",
                "some text after"
            ].join("\n");

            var expected = [
                "# heading 1",
                "some text before",
                "content of included file!",
                "some text after"
            ].join("\n");
            var actual = scope.processIncludes(markdown, files);

            expect(actual).toBe(expected);
        });

        it("should replace two different includes", function() {
            var files = [{
                    _id: "571725cd5c6b2bd90ed10b6e",
                    title: "some_other_file",
                    markdown: "content of included file!"
                },{
                    _id: "571725cd5c6b2bd90ed12331",
                    title: "even_another_file",
                    markdown: "content of the other included file!"
            }];

            var markdown = [
                "# heading 1",
                "some text before",
                "include(some_other_file)",
                "include(even_another_file)",
                "some text after"
            ].join("\n");

            var expected = [
                "# heading 1",
                "some text before",
                "content of included file!",
                "content of the other included file!",
                "some text after"
            ].join("\n");
            var actual = scope.processIncludes(markdown, files);

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
