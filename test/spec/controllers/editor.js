'use strict';

describe('Controller: EditorCtrl', function () {

  // load the controller's module
  beforeEach(module('meanMarkdownApp'));

  var EditorCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditorCtrl = $controller('EditorCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

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
