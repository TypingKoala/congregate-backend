import * as RandomWords from './randomWords';

import adjectives from './adjectives.json';
import nouns from './nouns.json';

describe('getRandomAdjective', () => {
  it('returns a string', () => {
    var result = RandomWords.getRandomAdjective();
    expect(typeof result).toBe('string');

    result = RandomWords.getRandomAdjective(true);
    expect(typeof result).toBe('string');

    result = RandomWords.getRandomAdjective(false);
    expect(typeof result).toBe('string');
  });
  it('capitalizes the first letter if specified', () => {
    const result = RandomWords.getRandomAdjective(true);
    expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
  });
  it('is an adjective in the database', () => {
    const result = RandomWords.getRandomAdjective();
    expect(adjectives.includes(result)).toBe(true);
  });
});

describe('getRandomNoun', () => {
  it('returns a string', () => {
    var result = RandomWords.getRandomNoun();
    expect(typeof result).toBe('string');

    result = RandomWords.getRandomNoun(true);
    expect(typeof result).toBe('string');

    result = RandomWords.getRandomNoun(false);
    expect(typeof result).toBe('string');
  });
  it('capitalizes the first letter if specified', () => {
    const result = RandomWords.getRandomNoun(true);
    expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
  });
  it('is a noun in the database', () => {
    const result = RandomWords.getRandomNoun();
    expect(nouns.includes(result)).toBe(true);
  });
});
