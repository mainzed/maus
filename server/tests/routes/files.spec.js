process.env.NODE_ENV = 'test'

import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../../src/app'
import File from '../../src/models/file'

let should = chai.should()

chai.use(chaiHttp)

describe('Routes: Files', () => {
  let fileID = ''

  before(() => {
    process.env.NODE_ENV = 'test'
  })

  after(done => {
    server.close()
    done()
  })

  beforeEach(done => {
    // clear database
    File.collection.drop()

    // create dummy file
    File.create({ title: 'New File', markdown: 'This is *markdown*!' }, (err, file) => {
      fileID = file._id
      done()
    })
  })

  it('should GET all the files', done => {
    chai.request(server)
      .get('/api/files')
      .end((err, res) => {
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
    chai.request(server)
      .get('/api/files/' + fileID)
      .end((err, res) => {
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
    chai.request(server)
      .post('/api/files')
      .send(file)
      .end((err, res) => {
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

    chai.request(server)
      .put('/api/files/' + fileID)
      .send(updatedFile)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.have.property('title')
        res.body.title.should.equal('My updated title')
        done()
      })
  })

  it('should delete file on DELETE /files/:id', done => {
    chai.request(server)
      .delete('/api/files/' + fileID)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        done()
      })
  })
})
