process.env.NODE_ENV = 'test'

import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../../src/app'

let should = chai.should()
chai.use(chaiHttp)

describe('Routes: Processing', () => {
  before(() => {
    process.env.NODE_ENV = 'test'
  })

  after(done => {
    server.close() // close express server
    done()
  })

  it('should convert file and return preview path on POST /preview', done => {
    const file = {
      userID: 'someID',
      type: 'jahresbericht',
      markdown: 'This is some new *markdown*!'
    }
    chai.request(server)
      .post('/api/preview')
      .send(file)
      .end((err, res) => {
        // err.should.be.null
        res.should.have.status(200)
        res.should.be.json
        res.body.message.should.equal('success')
        res.body.previewPath.should.equal('preview/jahresbericht/preview_someID.html')
        done()
      })
  })

  it('should return 422 when parameters are missing', done => {
    chai.request(server)
      .post('/api/preview')
      .send({})
      .end((err, res) => {
        // console.log(err)
        res.should.have.status(422)
        done()
      })
  })

  it('should convert file and return json with zipPath on POST /export', done => {
    const file = {
      userID: 'someID',
      type: 'jahresbericht',
      markdown: 'This is some new *markdown*!'
    }
    chai.request(server)
      .post('/api/export')
      .send(file)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.have.property('zipPath')
        done()
      })
  })
})
