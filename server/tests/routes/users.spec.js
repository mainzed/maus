process.env.NODE_ENV = 'test'

import chai from 'chai'
import chaiHttp from 'chai-http'
import server from '../../src/app'
import User from '../../src/models/user'

let should = chai.should()
chai.use(chaiHttp)

describe('Routes: Users', () => {
  let userID = ''

  before(() => {
    process.env.NODE_ENV = 'test'
  })

  after(done => {
    server.close() // close express server
    done()
  })

  beforeEach(done => {
    // clear database
    User.collection.drop()

    // create dummy users
    User.create({ username: 'John Doe', password: 'secret-password' }, (err, user) => {
      if (err) throw err
      userID = user._id
      done()
    })
  })

  it('should GET all the users', (done) => {
    chai.request(server)
      .get('/api/users')
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)

        res.body[0].should.have.property('username')
        res.body[0].should.have.property('group')
        res.body[0].should.have.property('createdAt')
        res.body[0].should.have.property('updatedAt')
        res.body[0].should.not.have.property('password')
        done()
      })
  })

  it('should get a single user on GET /users/:id', done => {
    chai.request(server)
      .get('/api/users/' + userID)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('username')
        res.body.should.have.property('group')
        res.body.should.have.property('createdAt')
        res.body.should.have.property('updatedAt')
        res.body.should.not.have.property('password')
        done()
      })
  })

  it('should update user on PUT /users/:id', done => {
    const user = {
      username: 'John Doe',
      group: 'admin'
    }
    chai.request(server)
      .put('/api/users/' + userID)
      .send(user)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.have.property('group')
        res.body.group.should.equal('admin')
        done()
      })
  })

  it('should delete user on DELETE /users/:id', done => {
    chai.request(server)
      .delete('/api/users/' + userID)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        done()
      })
  })
})
