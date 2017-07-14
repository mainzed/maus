'use strict'

angular.module('meanMarkdownApp').component('msFilegroup', {
  bindings: {
    files: '<',
    filter: '=',
    onDownloadClick: '&',
    onHistoryClick: '&',
    onEditClick: '&',
    onRemoveClick: '&'
  },
  templateUrl: 'scripts/components/files/filegroup/filegroup.component.html',
  controller: function () {
    var ctrl = this

    if (!ctrl.onDownloadClick || !ctrl.onHistoryClick || !ctrl.onEditClick || !ctrl.onRemoveClick) {
      console.error('missing component attribute')
    }

    ctrl.$onInit = function () {
      // console.log(ctrl.files.length)
      // console.log(ctrl.files[0])
    }
  }
})
