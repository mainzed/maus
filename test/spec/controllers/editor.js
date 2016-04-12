'use strict';

describe('Controller: EditorCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp'));

    var EditorCtrl;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $cookies) {
        scope = $rootScope.$new();
        EditorCtrl = $controller('EditorCtrl', {
            $scope: scope,
            $cookies: $cookies
            // place here mocked dependencies
        });

    }));

    /*it('should append editor to scope', function () {

        EditorCtrl.codemirrorLoaded(_editor);

        expect(EditorCtrl.editor.getValue()).toBe(3);
    });*/

    /*it('should add given snippet to codemirror content', function () {
        //scope.codemirrorLoaded(_editor);
        //var content = "some content";
        //scope.editor.setValue(content);

        var snippet = "some *markdown* snippet!";
        scope.addSnippet(snippet);

        expect(EditorCtrl.editor.getValue()).toBe(content + snippet);

    });*/

    /*it('should save as new file given non-existing file (no id)', function () {
        var file = {
            author: "John Doe",
            markdown: "some **markdown**!"
        };

        EditorCtrl.onSaveClick(file);

        expect(EditorCtrl.editor.getValue()).toBe(3);
    });*/

    


  /*it('should attach a list of awesomeThings to the scope', function () {
    expect(EditorCtrl.awesomeThings.length).toBe(3);
  });*/

  /*it('should return awesome stuff!', function () {
    expect(scope.onTitleChange()).toBe("works!");
  });


  it('should attach a list of awesomeThings to the scope', function () {
    expect(2===3).toBe(true);
  });

  it('should add then remove an item from the list', function () {
    scope.todo = 'Test 1';
    //scope.addTodo();
    //scope.removeTodo(0);
    expect(scope.todos.length).toBe(0);
  });*/

});
