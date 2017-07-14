import chai from 'chai'
import chaiHttp from 'chai-http'
let should = chai.should()

chai.use(chaiHttp)

const URL = 'http://localhost:3002'

describe('Routes: Processing', () => {
  it('should convert file and return preview path on POST /preview', done => {
    const file = {
      userID: 'someID',
      type: 'jahresbericht',
      markdown: 'This is some new *markdown*!'
    }
    chai.request(URL)
      .post('/api/preview')
      .send(file)
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          // err.should.be.null
          res.should.have.status(200)
          res.should.be.json
          res.body.message.should.equal('success')
          res.body.previewPath.should.equal('preview/jahresbericht/preview_someID.html')
          done()
        }
      })
  })

  it('should return 422 when parameters are missing', done => {
    chai.request(URL)
      .post('/api/preview')
      .send({})
      .end((err, res) => {
        res.should.have.status(422)
        res.body.should.have.property('error')
        res.body.error.should.eql('Missing parameters: type, userID or markdown')
        done()
      })
  })

  it('should convert file and return json with zipPath on POST /export', done => {
    const file = {
      userID: 'someID',
      type: 'jahresbericht',
      markdown: 'This is some new *markdown*!'
    }
    chai.request(URL)
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
