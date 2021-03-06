import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../app';
import { generateAnonymousToken } from './getAnonymousToken';
import { IUserJWTPayload } from '../realtime-middlewares/authenticate';

describe('generateAnonymousToken()', () => {
  it('is a valid signed jwt', () => {
    const token = generateAnonymousToken();
    const payload = jwt.verify(token, process.env.JWT_SECRET!, {
      audience: process.env.JWT_AUD,
    });
    // will error here if incorrect
    expect(payload).toBeDefined();
  });
});

describe('GET /api/getAnonymousToken', () => {
  it('responds with json', (done) => {
    request(app)
      .get('/api/getAnonymousToken')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('returns a token in the json', (done) => {
    request(app)
      .get('/api/getAnonymousToken')
      .then((response) => {
        expect(Object.keys(response.body)).toContain('token');
        done();
      })
      .catch((err) => done(err));
  });
  it('sets the token role as anonymous', (done) => {
    request(app)
      .get('/api/getAnonymousToken')
      .then((response) => {
        const payload: IUserJWTPayload = <IUserJWTPayload>(
          jwt.decode(response.body.token)
        );
        expect(payload.role).toBe('anonymous');
        done();
      })
      .catch((err) => done(err));
  });
});
