import { expect } from 'chai'
import Exporter from '../src/exporter'
import File from '../src/models/file'
import mockFile from './mock/markdown'
import mockDefinitions from './mock/definitions'
import mockCitations from './mock/citations'
import mockPictures from './mock/pictures'

describe('Exporter', () => {
  let exporter = null

  beforeEach(() => {
    exporter = new Exporter()
  })

  it('should instanciate', () => {
    expect(exporter).to.not.be.undefined
  })

  it('getMapping() should record definitions, links and citations and give them a number', () => {
    const mapping = exporter.getMapping(mockFile)
    expect(mapping).to.be.a('array')

    expect(mapping).to.deep.include({ section: 1, footnote: 1, type: 'link', placeholder: '[link](www.google.de)' })
    expect(mapping).to.deep.include({ section: 1, footnote: 2, type: 'definition', placeholder: '{ definition: someDef }' })
    expect(mapping).to.deep.include({ section: 1, footnote: 3, type: 'link', placeholder: '[link](www.google.de)' })
    expect(mapping).to.deep.include({ section: 1, type: 'picturegroup', placeholder: '{picturegroup: pic2, pic1}', pictures: [{ id: 'pic2', number: 1 }, { id: 'pic1', number: 2 }] })

    expect(mapping).to.deep.include({ section: 2, footnote: 1, type: 'link', placeholder: '[link](www.google.de)' })
    expect(mapping).to.deep.include({ section: 2, footnote: 2, type: 'definition', placeholder: '{definition: aDef}' })

    expect(mapping).to.deep.include({ type: 'citation', placeholder: '{ citation: someCitation }' })
    expect(mapping).to.deep.include({ section: 2, type: 'picture', placeholder: '{ picture: pic1 }', number: 1 })
    expect(mapping).to.deep.include({ type: 'citation', placeholder: '{ citation: anotherCitation }' })
    expect(mapping).to.deep.include({ section: 2, footnote: 3, type: 'link', placeholder: '[Dipl.-Ing. (FH) Guido Heinz M.Eng.](http://web.rgzm.de/no_cache/ueber-uns/team/m/guido_heinz.html)' })
    expect(mapping).to.deep.include({ section: 2, type: 'picturegroup', placeholder: '{ picturegroup: pic1, pic2 }', pictures: [{ id: 'pic1', number: 2 }, { id: 'pic2', number: 3 }] })
    expect(mapping).to.deep.include({ type: 'citation', placeholder: '{ citation: two words }' })

    expect(mapping).to.deep.include({ section: 2, footnote: 4, type: 'definition', placeholder: '{definition: Akademie der Wissenschaften und der Literatur | Mainz}'})
    expect(mapping).to.deep.include({ section: 2, footnote: 5, type: 'definition', placeholder: '{definition: Hochschule Mainz}'})

    expect(mapping).to.deep.include({ type: 'citation', placeholder: '{citation: Gersmann}' })
  })

  // output of main indesign markdown
  it('resolveMapping() should replace tokens with actual content', () => {
    const mapping = exporter.getMapping(mockFile)
    const result = exporter.resolveMapping(mockFile, mapping, mockCitations, mockPictures)

    // links and definitions
    expect(result).to.include('some content with a link (1) and a someDef (2)')
    expect(result).to.include('more content with another link (3)')
    expect(result).to.include('resetted link (1) and aDef (2)')

    // citations
    expect(result).to.include('> Be water my friend.\nBruce Lee')
    expect(result).to.include('> Winter is coming.\nEddard Stark')
    expect(result).to.include('> i am no one\nMany-faced God')
    expect(result).to.include('> In Laboratorien wie dem jüngst gegründeten „Mainzer Zentrum für Digitalität in den Geistes- und Kulturwissenschaften“ (mainzed), für das sechs Mainzer Wissenschaftsorganisationen ihre Kompetenzen in den digitalen Geistes- und Kulturwissenschaften gebündelt haben, werden systematisch neue digitale Methoden in Disziplinen wie Archäologie, Geschichte, Sprachwissenschaft etc. erarbeitet und erprobt.\nGudrun Gersmann, Einige Überlegungen zur digitalen Geschichtswissenschaft. Blog, Digitalität Theorien und Praktiken des Digitalen in den Geisteswissenschaften. 4. Juli 2016. https://digigeist.hypotheses.org/132#more-132 (20. Juni 2017)')

    // figures
    expect(result).to.include('<some-url.de>\nAbb. 1: some caption')

    // picture group
    expect(result).to.include('<some-url.de>\n<some-other-url.de>\nAbb. 2: some caption\nAbb. 3: some other caption')
  })

  // output of extra file containing all the footnotes
  it('getFootnotes() should return string containing all definitions', () => {
    const mapping = exporter.getMapping(mockFile)
    let result = exporter.getFootnotes(mapping, mockDefinitions)
    // console.log(result)
    expect(result).to.include(`# Kapitel 1`)
    expect(result).to.include(`1. www.google.de`)
    expect(result).to.include(`2. this is the actual definition, John Doe, www.google.com`)
    expect(result).to.include(`3. www.google.de`)

    expect(result).to.include(`# Kapitel 2`)
    expect(result).to.include(`1. www.google.de`)
    expect(result).to.include(`2. this is another definition, Max Mustermann, www.duckduckgo.com`)
    expect(result).to.include(`3. http://web.rgzm.de/no_cache/ueber-uns/team/m/guido_heinz.html`) // picture
  })
})
