import _ from 'lodash';
import adjectives from './adjectives.json';
import { assert } from 'console';
import nouns from './nouns.json';

/**
 * Returns a random adjective from the adjective database.
 * @param capitalize If true, the result will have the first letter capitalized
 */
export function getRandomAdjective(capitalize?: boolean): string {
  const result = _.sample(adjectives);
  assert(result, 'Sample should return a result');

  if (capitalize) {
    return _.startCase(result);
  } else {
    return result!;
  }
}

/**
 * Returns a random noun from the noun database.
 * @param capitalize If true, the result will have the first letter capitalized
 */
export function getRandomNoun(capitalize?: boolean): string {
  const result = _.sample(nouns);
  assert(result, 'Sample should return a result');

  if (capitalize) {
    return _.startCase(result);
  } else {
    return result!;
  }
}
