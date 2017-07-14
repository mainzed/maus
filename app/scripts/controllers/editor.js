'use strict'

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
.controller('EditorCtrl', function (
  $document,
  $filter,
  $http,
  $location,
  $routeParams,
  $scope,
  $timeout,
  $window,
  HTMLService,
  FileService,
  AuthService,
  ngDialog,
  DefinitionService,
  ConfigService,
  TemplateService
) {
  if (!AuthService.isAuthenticated()) {
    $location.path('/login')
  }

  $scope.init = function () {
    $scope.currentUser = AuthService.getUser()

    // get file based on id provided in address bar
    FileService.get({ id: $routeParams.id }, function (file) {
      $scope.file = file

      // workaround, part of file hidden until click
      setTimeout(function () {
        $scope.editor.refresh()
      }, 0)

      // lock editor if news
      if ($scope.file.type === 'news' && $scope.currentUser.group !== 'admin') {
        $scope.editor.setOption('readOnly', true)
      }
    })
  }

  $scope.hasEnrichment = function (type, enrichment) {
    return ConfigService.hasEnrichment(type, enrichment)
  }

  $scope.initResizable = function () {
    // init jquery col resizable plugin
    // $(function () {
    //   $(".filegroup").colResizable()
    // })
  }

  $scope.showSuccess = false
  $scope.showError = false
  $scope.editMode = false  // used in definitions dialog

  /**
   * makes editor available to rest of controller
   */
  $scope.onCodeMirrorLoaded = function (_editor) {
    $scope.editor = _editor  // for global settings
  }

  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: false,
    mode: 'markdown',  // CurlyBraceWrappedText
    showTrailingSpace: false,
    showMarkdownLineBreaks: true,  // custom
    showOlatMarkdown: true, // custom OLAT
    scrollbarStyle: null
  }

  $scope.onSaveClick = function () {
    var id = $scope.file._id

    // migration steps
    if ($scope.file.type === 'OLAT') {
      $scope.file.type = 'opOlat'
    } else if ($scope.file.type === 'presentation') {
      $scope.file.type = 'prMainzed'
    }

    var newFile = {
      author: $scope.file.author,
      markdown: $scope.file.markdown,
      type: $scope.file.type,
      title: $scope.file.title,
      private: $scope.file.private,
      updated_by: $scope.currentUser.name
    }

    FileService.update({ id: id }, newFile, function success () {
      $scope.unsavedChanges = false
      $scope.showSuccess = true
      $timeout(function () { $scope.showSuccess = false }, 3000)
    }, function error () {
      $scope.showError = true
      $timeout(function () { $scope.showError = false }, 3000)
    })
  }

  $scope.onFilesClick = function () {
    if ($scope.unsavedChanges) {
      ngDialog.openConfirm({
        template: "views/dialog_confirm_home.html",
        className: 'smalldialog',
        scope: $scope
      }).then(function(success) {
        // user confirmed to go back to files
        $location.path("/files")
      }, function (error) {
        console.log(error)
      })
    } else {  // no changes, go back without asking
      $location.path("/files")
    }
  }

  $scope.addSnippet = function (snippet) {
    // add snippet at cursor position or replace selection
    $scope.editor.replaceSelection(snippet)
    $scope.editor.focus()
  }

  $scope.addDefinition = function (definition) {
    var snippet = "{definition: " + definition.word + "}"
    $scope.addSnippet(snippet)
  }

  $scope.addStory = function(definition) {
    var snippet = "{story: " + definition.word + "}"
    $scope.addSnippet(snippet)
  }

  $scope.addImage = function(definition) {
    var snippet = "{picture: " + definition.word + "}"
    $scope.addSnippet(snippet)
  }

  $scope.addCitation = function(definition) {
    var snippet = "{citation: " + definition.word + "}" // changes
    $scope.addSnippet(snippet)
  }

  $scope.onLabelClick = function() {
    var snippet = "[I'm a Label](http://labeling.i3mainz.hs-mainz.de/label/#ec25d32d-3c1a-4539-9755-9bc63c17d989)"
    $scope.addSnippet(snippet)
  }

  $scope.onLinkClick = function() {
    var snippet = "[I'm a link](https://www.google.com)"
    $scope.addSnippet(snippet)
  }

  $scope.onImageClick = function() {
    var snippet = "![image-alt](bilder/filname.jpg \"caption author license url\")"
    $scope.addSnippet(snippet)
  }

  $scope.onStoryScriptClick = function() {
      var snippet
      var selection = $scope.editor.getSelection()

      if (selection.length) {
          snippet = "\nstory{\n\n" + selection + "\n\n}story\n"
      } else {
          snippet = "\nstory{\n\nWrite **normal** markdown inside *storyscript* tags\n\n}story\n"
      }

      $scope.addSnippet(snippet)
  }

  $scope.onExportClick = function () {
    // ngDialog.open({
    //   template: "views/dialog_export.html",
    //   className: "smalldialog",
    //   disableAnimation: true,
    //   scope: $scope
    // })

    var type = $scope.file.type
    if (type === 'opMainzed') type = 'jahresbericht'
    var postData = {
      'userID': $scope.currentUser._id,
      'type': type,
      'markdown': $scope.file.markdown
    }

    // get preview path
    var url = ConfigService.API_PATH + '/export'

    $http.post(url, postData).then(function (res) {
      window.location = res.data.zipPath
    }, function error (res) {
      console.log(res)
    })
  }

  $scope.onUndoClick = function () {
    $scope.editor.undo()
  }

  $scope.onRedoClick = function () {
    $scope.editor.redo()
  }

  $scope.onPreviewClick = function () {
    var type = $scope.file.type === 'opMainzed'
      ? 'jahresbericht' : $scope.file.type

    type = type === 'opOlat' ? 'olat' : type

    var postData = {
      'type': type,
      'markdown': $scope.file.markdown,
      'userID': $scope.currentUser._id
    }

    // get preview path
    $http.post(ConfigService.API_PATH + '/preview', postData).then(function (res) {
      // open dialog
      var randNum = Math.floor((Math.random() * 10000000) + 1)
      $scope.previewPath = res.data.previewPath + '?time=' + randNum

      ngDialog.open({
        template: 'views/dialog_preview.html',
        disableAnimation: true,
        scope: $scope
      })
    }, function error (res) {
      console.error(res.data.error)
    })
  }

  /**
   * update markdown service when editor changes
   */
  $scope.onEditorChange = function() {
      $scope.unsavedChanges = true  // gets reset on save
  }

  // handler for click on button "Glossareintrag"
  $scope.onDefinitionClick = function() {
      $scope.definitions = DefinitionService.query()

      // select first enrichment by default
      var template = ConfigService.getTemplateByType($scope.file.type)
      if (template && template.enrichments) {
          $scope.category = template.enrichments[0]
      }

      ngDialog.open({
          template: "views/dialog_definitions.html",
          scope: $scope,
          disableAnimation: true,
          preCloseCallback: function() {
              $scope.onApplyDefinitionChanges()
              $scope.editMode = false
          }
      })
  }

  $scope.onRemoveDefinitionClick = function(id) {
      DefinitionService.remove({id: id}, function() {
          // success
          // remove from local definitions array without reloading
          var index = _.findIndex($scope.definitions, {_id: id})
          $scope.definitions.splice(index, 1)
      })
  }

  /**
   * saves all defintions in case they were changed
   */
  $scope.onApplyDefinitionChanges = function() {
      $scope.definitions.forEach(function(definition) {
          if (definition._id) {
              DefinitionService.update({id: definition._id}, definition)
          } else {  // new definition
              DefinitionService.save(definition)
          }
      })
  }

  $scope.onCreateDefinitionClick = function(category) {
      // add empty object to local definitions array
      var timestmap = $filter('date')(new Date(), "yyyy-MM-ddTHH:mm:ss.sssZ", "CEST")

      $scope.definitions.push({
          filetype: $scope.file.type,  // to be shown in table
          category: category,
          updated_at: timestmap // to be sorted to top
      })
  }

  $scope.onHelpClick = function() {
      $window.open("https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet", "_blank")
  }

// save hotkey
$(document).keydown(function (e) {
  var code = e.keyCode || e.which
  // shiftKey ctrlKey
  if(e.ctrlKey && code === 83) { // Shift + S
    $scope.onSaveClick()
    e.preventDefault()  // stop save action
  }
})

// undo hotkey
$(document).keydown(function (e) {
  var code = e.keyCode || e.which
  // shiftKey ctrlKey
  if(e.ctrlKey && code === 90) {
    console.log("Ctrl + Z")
    $scope.onUndoClick()
    e.preventDefault()
  }
})

  /**
   * prompt when trying to refresh with unsaved changes
   */
  $(window).bind('beforeunload', function () {
      // this.removeActiveState(function() {
      //     //console.log("unload")
      //     if ($scope.unsavedChanges) {
      //         //this.removeActiveState()
      //
      //
      //     }
      // })
      //this.removeActiveState(function() {
      //    console.log("remove active")
      //})
      //console.log("want to close!")
      return 'It seems like you made unsaved changes to your document. Are you sure you want to leave without saving?'

      /*if ($scope.unsavedChanges) {
          console.log("still unsaved!")
      }*/
  })
})

function initDownload (filename, html) {
  var blob = new Blob([html], { type: "data:text/plaincharset=utf-8" })
  var downloadLink = angular.element('<a></a>')
  downloadLink.attr('href', window.URL.createObjectURL(blob))
  downloadLink.attr('download', filename)
  downloadLink[0].click()
}
