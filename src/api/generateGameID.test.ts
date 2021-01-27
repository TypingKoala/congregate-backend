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
      .get('/api/getUniqueGameID')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('returns a gameID in the json', (done) => {
    request(app)
      .get('/api/getUniqueGameID')
      .then((response) => {
        expect(Object.keys(response.body)).toContain('gameID');
        done();
      })
      .catch((err) => done(err));
  });
});
