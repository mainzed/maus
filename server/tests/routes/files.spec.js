import chai from 'chai'
import chaiHttp from 'chai-http'
import File from '../../src/models/file'

let should = chai.should()
const URL = 'http://localhost:3002'

chai.use(chaiHttp)

describe('Routes: Files', () => {
  let fileID = ''

  beforeEach(done => {
    // clear database
    File.collection.drop()

    // create dummy file
    File.create({ title: 'New File', markdown: 'This is *markdown*!' }, (err, file) => {
      if (err) done(err)
      fileID = file._id
      done()
    })
  })

  it('should GET all the files', done => {
    chai.request(URL)
      .get('/api/files')
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)

        res.body[0].should.have.property('title')
        res.body[0].should.have.property('markdown')
        res.body[0].should.have.property('createdAt')
        res.body[0].should.have.property('updatedAt')
        res.body[0].should.have.property('updated_by')
        res.body[0].should.have.property('author')
        // res.body[0].should.not.have.property('private')
        // res.body[0].should.not.have.property('__v')
        done()
      })
  })

  it('should get a single file on GET /files/:id', done => {
    chai.request(URL)
      .get('/api/files/' + fileID)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('title')
        res.body.should.have.property('markdown')
        res.body.should.have.property('createdAt')
        res.body.should.have.property('updatedAt')
        res.body.should.have.property('updated_by')
        res.body.should.have.property('author')
        done()
      })
  })

  it('should create a file on POST /files', done => {
    const file = {
      'title': 'My new file',
      'markdown': 'Some **new** content!'
    }
    chai.request(URL)
      .post('/api/files')
      .send(file)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('title')

        res.body.should.have.property('markdown')
        res.body.should.have.property('createdAt')
        res.body.should.have.property('updatedAt')
        res.body.should.have.property('updated_by')
        res.body.should.have.property('author')

        res.body.title.should.equal('My new file')
        res.body.markdown.should.equal('Some **new** content!')
        done()
      })
  })

  it('should update file on PUT /file/:id', done => {
    const updatedFile = {
      title: 'My updated title'
    }

    chai.request(URL)
      .put('/api/files/' + fileID)
      .send(updatedFile)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        res.body.should.have.property('title')
        res.body.title.should.equal('My updated title')
        done()
      })
  })

  it('should delete file on DELETE /files/:id', done => {
    chai.request(URL)
      .delete('/api/files/' + fileID)
      .end((err, res) => {
        if (err) done(err)
        res.should.have.status(200)
        res.should.be.json
        done()
      })
  })
})
