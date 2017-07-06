import chai from 'chai'
import chaiHttp from 'chai-http'
import User from '../../src/models/user'

const URL = 'http://localhost:3002'

let should = chai.should()
chai.use(chaiHttp)

describe('Routes: Authentication', () => {

  after(done => {
    User.collection.drop()
    done()
  })

  it('should signup user on POST /auth/signup', done => {
    chai.request(URL)
      .post('/auth/signup')
      .send({ username: 'Max', password: 'test123' })
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.have.property('state')
        res.body.should.have.property('user')
        res.body.state.should.equal('success')
        // res.body.user.should.have.property('username')
        done()
      })
  })

  it('should not login user with invalid password on POST /auth/login', done => {
    chai.request(URL)
      .post('/auth/login')
      .send({ username: 'Max', password: 'some-password' })
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.have.property('state')
        res.body.should.have.property('message')

        res.body.state.should.equal('failure')
        res.body.message.should.equal('Invalid username or password')
        done()
      })
  })

  it('should login user on POST /auth/login', done => {
    chai.request(URL)
      .post('/auth/login')
      .send({ username: 'Max', password: 'test123' })
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json

        res.body.should.have.property('state')
        res.body.state.should.equal('success')
        done()
      })
  })

  it('should logout user on GET /auth/signout', done => {
    chai.request(URL)
      .get('/auth/signout')
      .end((err, res) => {
        res.should.have.status(200)
        res.should.redirect
        done()
      })
  })
})
