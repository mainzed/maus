import chai from 'chai'
import Converter from '../src/converter'
import chaiAsPromised from 'chai-as-promised'
import * as cheerio from 'cheerio'

chai.use(chaiAsPromised)

let should = chai.should()

describe('Converter', () => {
  it('should init new converter with default parameters', () => {
    let converter = new Converter()
    converter.should.not.be.undefined
    converter.should.be.a('object')
    converter.should.have.property('type')
    converter.should.have.property('markdown')
    converter.should.have.property('recipe')
    converter.should.have.property('page')
    converter.should.have.property('elements')

    converter.type.should.equal('olat')
    converter.markdown.should.equal('This is **markdown**.')

    // methods
    converter.should.have.property('convert')
    converter.convert.should.be.a('function')

    converter.should.have.property('getRecipe')
    converter.getRecipe.should.be.a('function')

    converter.should.have.property('createGlossary')
    converter.createGlossary.should.be.a('function')
    // ...
  })

  it('should init new converter with given parameters', () => {
    let converter = new Converter('jahresbericht', 'some markdown!')
    converter.should.not.be.undefined
    converter.should.be.a('object')
    converter.type.should.equal('jahresbericht')
    converter.markdown.should.equal('some markdown!')
  })

  describe('Methods', () => {
    let converter = {}

    beforeEach(() => {
      converter = new Converter('jahresbericht', 'some markdown!')
    })

    it('convert() should return valid html', done => {
      converter.convert().then((html) => {
        html.should.be.a('string')

        // check if markdown has been inserted
        const page = cheerio.load(html)
        page.should.be.not.undefined
        page('#read').html().should.equal('<p>some markdown!</p>\n')

        done()
      })
    })

    it('getRecipe() should return recipe when given filetype', done => {
      converter.getRecipe(converter.type).then(recipe => {
        recipe.should.be.a('object')
        recipe.should.have.property('template-path')
        recipe.should.have.property('metadata')
        // ...
        done()
      }).catch((err) => console.log(err))
    })

    it('getLegacyType() should return valid type', () => {
      const type = converter.getLegacyType()
      type.should.equal('opMainzed')
    })

  })
})
