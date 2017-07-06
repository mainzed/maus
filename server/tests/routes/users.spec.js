import chai from 'chai'
import chaiHttp from 'chai-http'
import User from '../../src/models/user'

let should = chai.should()

chai.use(chaiHttp)

const URL = 'http://localhost:3002'

describe('Routes: Users', () => {
  let userID = ''

  after(done => {
    User.collection.drop() // clear database
    done()
  })

  beforeEach(done => {
    // create dummy users
    User.create({ username: 'John Doe', password: 'secret-password' }, (err, user) => {
      if (err) throw err
      userID = user._id
      done()
    })
  })

  it('should GET all the users', (done) => {
    chai.request(URL)
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
    chai.request(URL)
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
    chai.request(URL)
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
    chai.request(URL)
      .delete('/api/users/' + userID)
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        done()
      })
  })
})
