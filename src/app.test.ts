import app from './app';
import request from 'supertest';

/**
 * Supertest assertion function to check for connected and version fields
 */
function hasExpectedFields(res: request.Response) {
  if (!('version' in res.body)) throw new Error('missing version key');
}

describe('GET /', () => {
  it('responds with correctly formed json', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200, done)
      .expect(hasExpectedFields);
  });
});

describe('Express app', () => {
  it('returns a json 404 on invalid route', (done) => {
    request(app)
      .get('/invalid')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((response) => {
        expect(Object.keys(response.body)).toContain('error');
        done();
      })
      .catch((err) => done(err));
  });
});
