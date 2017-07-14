import chai from 'chai'
import chaiHttp from 'chai-http'
import Definition from '../../src/models/definition'

const URL = 'http://localhost:3002'

let should = chai.should()
chai.use(chaiHttp)

describe('Routes: Definitions', () => {
  let defID = ''

  beforeEach(done => {
    // create dummy definition
    Definition.create({
      category: 'definition',
      word: 'Example',
      text: 'This is an example definition.',
      filetype: 'opOlat'
    }, (err, definition) => {
      if (err) done(err)
      defID = definition._id
      done()
    })
  })

  afterEach(done => {
    Definition.collection.drop()
    done()
  })

  it('should GET all the definitions', (done) => {
    chai.request(URL)
      .get('/api/definitions')
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('array')
        // res.body.length.should.be.eql(1)
        res.body[0].should.have.property('category')
        res.body[0].should.have.property('word')
        res.body[0].should.have.property('text')
        res.body[0].should.have.property('filetype')
        done()
      })
  })

  it('should get a single definition on GET /definitions/:id', done => {
    chai.request(URL)
      .get('/api/definitions/' + defID)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')

        res.body.should.have.property('category')
        res.body.should.have.property('word')
        res.body.should.have.property('text')
        res.body.should.have.property('filetype')
        done()
      })
  })

  it('should create a definition on POST /definitions', (done) => {
    const definition = {
      'category': 'citation',
      'word': 'cit1',
      'text': 'This is a citation!',
      'filetype': 'opMainzed'
    }
    chai.request(URL)
      .post('/api/definitions')
      .send(definition)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')

        res.body.category.should.equal('citation')
        res.body.word.should.equal('cit1')
        res.body.text.should.equal('This is a citation!')
        res.body.filetype.should.equal('opMainzed')
        done()
      })
  })

  it('should update definition on PUT /definitions/:id', done => {
    const definition = {
      word: 'Updated Example',
      category: 'definition',
      text: 'This is an example definition.'
    }
    chai.request(URL)
      .put('/api/definitions/' + defID)
      .send(definition)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.category.should.equal('definition')
        res.body.word.should.equal('Updated Example')
        res.body.text.should.equal('This is an example definition.')
        done()
      })
  })

  it('should delete definition on DELETE /definitions/:id', done => {
    chai.request(URL)
      .delete('/api/definitions/' + defID)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        done()
      })
  })
})
