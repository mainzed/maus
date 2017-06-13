let expect = require('chai').expect
let Converter = require('../converter')
let mongoose = require('mongoose')

describe('Converter', () => {
  before(() => {
    // mongoose model cleanup
    mongoose.models = {}
    mongoose.modelSchemas = {}
  })

  it('should be defined', () => {
    expect(Converter).to.not.be.undefined
  })

  it('should instanciate with default parameters', () => {
    let converter = new Converter()
    expect(converter.type).to.equal('olat')
    expect(converter.markdown).to.equal('This is **markdown**.')
    expect(converter.recipe).to.be.a('object')
    expect(converter.page).to.be.a('object')
    expect(converter.elements).to.be.a('array')
  })

  it('should set properties', () => {
    let converter = new Converter('jahresbericht', 'Some *markdown*.')
    expect(converter.type).to.equal('jahresbericht')
    expect(converter.markdown).to.equal('Some *markdown*.')
  })

})
