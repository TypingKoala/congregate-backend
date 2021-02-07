import app from '../app';
import { getRandomGameID } from './generateGameID';
import request from 'supertest';

describe('getRandomGameID()', () => {
  it('returns a string', () => {
    var result = getRandomGameID();
    expect(typeof result).toBe('string');
  });
});

describe('GET /api/getUniqueGameID', () => {
  it('responds with json', (done) => {
    request(app)
      .get('/api/getUniqueGameID?city=Boston')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('returns a gameID in the json', (done) => {
    request(app)
      .get('/api/getUniqueGameID?city=Boston')
      .then((response) => {
        expect(Object.keys(response.body)).toContain('gameID');
        done();
      })
      .catch((err) => done(err));
  });

  it('fails with invalid city', (done) => {
    request(app)
      .get('/api/getUniqueGameID?city=invalid')
      .then((response) => {
        expect(Object.keys(response.body)).toContain('error');
        done();
      })
      .catch((err) => done(err));
  });
});
