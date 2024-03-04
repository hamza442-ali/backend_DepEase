// Import necessary modules
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index.js';

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('Index.js', function () {
  // Test the root route
  describe('GET /', function () {
    it('should return status 200', function (done) {
      chai.request(app)
        .get('/')
        .end(function (err, res) {
          res.should.have.status(200);
          done();
        });
    });
  });

  // Add more test cases as needed
});
