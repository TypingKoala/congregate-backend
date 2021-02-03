export default {
  ROUND_START_COUNTDOWN: 3, // number of seconds after ready before starting game
  ROUND_TIMER: 300, // number of seconds per round
  DISTANCE_THRESHOLD: 50, // distance before declaring victory, in meters
  DEBUG_MESSAGES: true, // print debug messages to server log
  INIITAL_DISTANCE_LOWER: 60, // lower bound initial distance to put between two players, in meters
  INITIAL_DISTANCE_UPPER: 80, // upper bound initial distance to put between two players, in meters,
  TEST_MODE: false, // if true, location generation will return the same location (resulting in an auto-win)
};
