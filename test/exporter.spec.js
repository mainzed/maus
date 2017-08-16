var chai = require('chai')
var Exporter = require('../server/exporter')
var File = require('../server/models/file')
var Definition = require('../server/models/definition')
var mockFile = require('./mockFile')
var expect = chai.expect

var file = new File({
  type: 'opMainzed',
  author: 'John Doe',
  title: 'Test file',
  markdown: `
    This is **markdown**
  `
})

describe('Exporter', () => {
  let exporter = null

  beforeEach(() => {
    exporter = new Exporter(file)
  })

  it('should instanciate given file', () => {
    expect(exporter).to.not.be.undefined
    expect(exporter).to.have.property('file')
  })

  it('replaceDefinition() replace definitions', () => {
    const markdown = `some { definition: someDef }`
    expect(exporter.replaceDefinitions(markdown)).to.eql(`some someDef ({{#}})`)
  })

  describe('citations', () => {
    it('replaceCitation() should replace citation with blockquote', () => {
      file.markdown = `
        text before
        { citation: someCitation }
        text after
      `
      const citation = new Definition({
        shortcut: 'someCitation',
        text: 'some citation content',
        author: 'John Doe'
      })
      const result = exporter.replaceCitation('someCitation', citation)
      expect(result).to.eql(`
        text before
        > some citation content
        text after
      `)
    })
  })

  describe('links', () => {
    it('replaceLinks() should remove link urls', () => {
      const markdown = `some text with a [link](www.google.de) inside it`
      const result = exporter.replaceLinks(markdown)
      expect(result).to.eql('some text with a link ({{#}}) inside it')
    })
  })

  describe('Export', () => {
    it('export() should replace all links and definitions', () => {
      const result = exporter.export(mockFile)
      expect(result).to.include('some content with a link (1) and a someDef (2)')
      expect(result).to.include('more content with another link (3)')
    })

    it('should number links and definitions correctly by main sections', () => {
      const result = exporter.export(mockFile)
      expect(result).to.include('link (1) and a someDef (2)')
      expect(result).to.include('should have resetted link (1) and aDef (2) numbers')
    })
  })

  // it.skip('export() should replace citations with blockquotes', () => {
  //   file.markdown = `
  //     text before

  //     { citation: someCitation }

  //     text after
  //   `
  //   var exporter = new Exporter(file)
  //   var html = exporter.export()
  //   expect(html).to.eql(`
  //   text before

  //   > some citation with some content

  //   text after
  //   `)
  // })

})
