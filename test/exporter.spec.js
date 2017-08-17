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

  it('recordCitations() should return list with used citations', () => {
    const citations = exporter.recordCitations(mockFile)
    expect(citations).to.be.a('array')
    expect(citations).to.contain('someCitation')
  })

  it('replaceCitations() should replace all given citations', () => {
    const markdown = '{ citation: someCitation }'
    const citations = [{
      word: 'someCitation',
      text: 'this is the actual citation text',
      author: 'John Doe'
    }]
    expect(exporter.replaceCitations(markdown, citations)).to.eql('> this is the actual citation text')
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
    it('export() should replace all links and definitions', (done) => {
      exporter.export(mockFile).then((result) => {
        expect(result).to.include('some content with a link (1) and a someDef (2)')
        expect(result).to.include('more content with another link (3)')
        done()
      })

    })

    it('export() should number links and definitions correctly by main sections', (done) => {
      exporter.export(mockFile).then((result) => {
        expect(result).to.include('link (1) and a someDef (2)')
        expect(result).to.include('should have resetted link (1) and aDef (2) numbers')
        done()
      })
    })

    it('export() should replace citations')

    it('should replace pictures')

    it('should replace picture groups')
  })

  it('get')

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
