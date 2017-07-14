import chai from 'chai'
import Resolver from '../src/resolver'
import chaiAsPromised from 'chai-as-promised'
import * as cheerio from 'cheerio'
import Definition from '../src/models/definition'

chai.use(chaiAsPromised)

let should = chai.should()

describe('Resolver', () => {
  // let resolver
  let defID

  // before(done => {
  //   // create a definition to test resolves
  //   const definition = {
  //     category: 'definition',
  //     word: 'def1',
  //     text: 'This is an example definition.',
  //     filetype: 'opMainzed'
  //   }
  //   Definition.create(definition, (err, def) => {
  //     if (err) done(err)
  //     defID = def._id
  //     done()
  //   })
  //
  //   // resolver = new Resolver('<p>some html!</p>')
  // })

  after(done => {
    Definition.collection.drop()
    done()
  })

  it('should init new converter with given parameters', () => {
    const resolver = new Resolver('<p>some html!</p>')
    resolver.should.not.be.undefined
    resolver.should.be.a('object')
  })

  it('getElements() should record definitions (with & w/o placeholders)', () => {
    const resolver = new Resolver('<p>some markdown and a { definition: someDef } as well as a definition with { definition: someDef: somePlaceholder }</p>')
    const elements = resolver.getElements()

    elements.should.be.a('array')
    elements.length.should.be.eql(2)

    // without placeholder
    elements[0].should.have.property('markdown')
    elements[0].markdown.should.be.eql('{ definition: someDef }')

    elements[0].should.have.property('category')
    elements[0].category.should.be.eql('definition')

    elements[0].should.have.property('shortcut')
    elements[0].shortcut.should.be.eql('someDef')

    elements[0].should.have.property('placeholder')
    should.equal(elements[0].placeholder, undefined)

    // with placeholder
    elements[1].should.have.property('markdown')
    elements[1].markdown.should.be.eql('{ definition: someDef: somePlaceholder }')

    elements[1].should.have.property('category')
    elements[1].category.should.be.eql('definition')

    elements[1].should.have.property('shortcut')
    elements[1].shortcut.should.be.eql('someDef')

    elements[1].should.have.property('placeholder')
    elements[1].placeholder.should.be.eql('somePlaceholder')
  })

  it('getElements() should record legacy definitions (with & w/o placeholders)', () => {
    const resolver = new Resolver('<p>some html and a { legacyDef } and with a placeholder { legacyDef: placeholder }</p>')
    const elements = resolver.getElements()

    elements.should.be.a('array')
    elements.length.should.be.eql(2)

    // without placeholder
    elements[0].should.have.property('markdown')
    elements[0].markdown.should.be.eql('{ legacyDef }')

    elements[0].should.have.property('category')
    elements[0].category.should.be.eql('definition')

    elements[0].should.have.property('shortcut')
    elements[0].shortcut.should.be.eql('legacyDef')

    elements[0].should.have.property('placeholder')
    should.equal(elements[0].placeholder, undefined)

    // with placeholder
    elements[1].should.have.property('markdown')
    elements[1].markdown.should.be.eql('{ legacyDef: placeholder }')

    elements[1].should.have.property('category')
    elements[1].category.should.be.eql('definition')

    elements[1].should.have.property('shortcut')
    elements[1].shortcut.should.be.eql('legacyDef')

    elements[1].should.have.property('placeholder')
    elements[1].placeholder.should.be.eql('placeholder')
  })

  it('getElements() should record citations', () => {
    const resolver = new Resolver('<p>some html and a { citation: cit1 }</p>')
    const elements = resolver.getElements()

    elements.should.be.a('array')
    elements.length.should.be.eql(1)

    elements[0].markdown.should.be.eql('{ citation: cit1 }')
    elements[0].category.should.be.eql('citation')
    elements[0].shortcut.should.be.eql('cit1')
  })

  it('getElements() should record stories', () => {
    const resolver = new Resolver('<p>some html and a { story: story1 }</p>')
    const elements = resolver.getElements()

    elements.should.be.a('array')
    elements.length.should.be.eql(1)

    elements[0].markdown.should.be.eql('{ story: story1 }')
    elements[0].category.should.be.eql('story')
    elements[0].shortcut.should.be.eql('story1')
  })

  // it('findDefinitionAndGetReplacement() should create definition content', done => {
  //   const element = {
  //     markdown: '{ definition: def1 }',
  //     category: 'definition',
  //     shortcut: 'def1'
  //   }
  //
  //   converter.findDefinitionAndGetReplacement(element).then((result) => {
  //     result.should.have.property('element')
  //     result.should.have.property('replacement')
  //
  //     const expected = `
  //       <span id="${defID}" class="shortcut">
  //         def1
  //         <span class="definition">
  //           <span class="definition-title">def1</span>
  //           <span class="definition-text">This is an example definition.</span>
  //           <span class="definition-author">undefined</span>
  //           <span class="definition-website">undefined</span>
  //         </span>
  //       </span>
  //     `.replace(/\s/g, '')
  //     const actual = result.replacement.replace(/\s/g, '')
  //     actual.should.be.eql(expected)
  //     done()
  //   }).catch(err => done(err))
  // })

  it('findCitationAndGetReplacement()')
  it('findStoryAndGetReplacement()')
  it('findIncludeAndGetReplacement()')
  it('getElement()')

  it('get and resolve includes')

  it('resolve() given html content should resolve definitions', done => {
    const resolver = new Resolver('<p>This markdown contains a { definition: def1 }!</p>')
    resolver.resolve().then(() => {
      resolver.$page.html().should.be.eql(`
        <p>This markdown contains a
          <span id="${defID}" class="shortcut">
            def1
            <span class="definition">
              <span class="definition-title">def1</span>
              <span class="definition-text">This is an example definition.</span>
              <span class="definition-author">undefined</span>
              <span class="definition-website">undefined</span>
            </span>
          </span>
        !</p>
      `)
    }).catch(err => done(err))
  })

  it('resolveLegacyStories()')

})
