import app from '../../app';
import request from 'supertest';

describe('POST /api/user/sendLoginEmail', () => {
  it('responds with json', (done) => {
    request(app)
      .post('/api/user/sendLoginEmail')
      .send({ email: 'test@example.com' })
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('returns success if valid email and callback url', (done) => {
    request(app)
      .post('/api/user/sendLoginEmail')
      .send({
        email: 'test@example.com',
        callbackUrl: 'http://n.jbui.me/verify',
      })
      .then((response) => {
        expect(Object.keys(response.body)).toContain('success');
        done();
      })
      .catch((err) => done(err));
  });

  it('returns error if invalid email', (done) => {
    request(app)
      .post('/api/user/sendLoginEmail')
      .send({ email: 'test', callbackUrl: 'http://n.jbui.me/verify' })
      .then((response) => {
        expect(Object.keys(response.body)).toContain('errors');
        done();
      })
      .catch((err) => done(err));
  });

  it('returns error if no email', (done) => {
    request(app)
      .post('/api/user/sendLoginEmail')
      .send({ callbackUrl: 'http://n.jbui.me/verify' })
      .then((response) => {
        expect(Object.keys(response.body)).toContain('errors');
        done();
      })
      .catch((err) => done(err));
  });

  it('returns error if disallowed callback url', (done) => {
    request(app)
      .post('/api/user/sendLoginEmail')
      .send({
        email: 'test@example.com',
        callbackUrl: 'http://example.com/verify',
      })
      .then((response) => {
        expect(Object.keys(response.body)).toContain('errors');
        done();
      })
      .catch((err) => done(err));
  });
});
