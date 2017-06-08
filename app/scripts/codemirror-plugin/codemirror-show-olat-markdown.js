'use strict'

CodeMirror.defineOption('showOlatMarkdown', false, function(codeMirror, newValue, oldValue) {
  if (oldValue === CodeMirror.Init) {
    oldValue = false
  }

  if (oldValue && !newValue) {
      codeMirror.removeOverlay("show-olat-markdown")
  } else if (!oldValue && newValue) {
    codeMirror.addOverlay({
      name: "show-olat-markdown",
      token: storyTag
    })
  }
})

function storyTag (stream) {
  // Returns separate CSS classes for each trailing space
  if (!stream.string.length) {
    return null
  }

  // starting storyscript
  if (stream.match(/story{/) || stream.match(/}story/)) {
    return 'markdown-story'
  }

  // definitions
  if (stream.match(/{(.*?)}/)) {
    return 'markdown-definition'
  }

  // html comments
  if (stream.match(/<!--(.*?)-->/)) {
    return 'html-comment'
  }

  // metatags
  if (stream.match(/^@title:.*/)) {
    return 'metatag'
  }

  if (stream.match(/^@author:.*/)) {
    return 'metatag'
  }

  if (stream.match(/^@created:.*/)) {
    return 'metatag'
  }

  if (stream.match(/^@updated:.*/)) {
    return 'metatag'
  }

  if (stream.match(/^@cover-description:.*/)) {
    return 'metatag'
  }

  if (stream.match(/^@pdf:.*/)) {
    return 'metatag'
  }

  if (stream.match(/^include\((.*)\)/m)) {
    return 'include'
  }

  stream.eat(/./)
}
