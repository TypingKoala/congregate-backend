import app from '../../app';
import request from 'supertest';

describe('GET /api/user/token', () => {
  it('responds with json', (done) => {
    request(app)
      .get('/api/user/token')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('returns error if invalid key and username', (done) => {
    request(app)
      .get('/api/user/token')
      .then((response) => {
        expect(Object.keys(response.body)).toContain('error');
        done();
      })
      .catch((err) => done(err));
  });
});
