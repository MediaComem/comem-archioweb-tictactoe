/**
 * A game-related error.
 */
class GameError extends Error {

  /**
   * Constructs a new game-related error.
   * @param {string} code - A code identifying the error.
   * @param {string} message - A description of the cause of the error.
   */
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = GameError;
