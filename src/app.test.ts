import request from 'supertest';
import app from './app';

/**
 * Supertest assertion function to check for connected and version fields
 */
function hasExpectedFields(res: request.Response) {
  if (!('version' in res.body)) throw new Error('missing version key')
}

describe('GET /', () => {
  it('responds with correctly formed json', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200, done)
      .expect(hasExpectedFields)
  })
})