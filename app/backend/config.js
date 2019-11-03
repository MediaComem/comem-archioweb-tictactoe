/**
 * The backend application's configuration properties, loaded from the
 * environment if available.
 * @exports app/backend/config
 */
const { getLogger } = require('log4js');

const logLevels = [ 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL' ];

try {
  require('dotenv').config();
} catch (err) {
  // Ignore .env file if dotenv is not available
}

/**
 * The current log level of the application. The higher (closer to
 * <code>TRACE</code>) the log level is, the more log messages will be
 * displayed.
 *
 * <p>Customize it with the <code>$TICTACTOE_LOG_LEVEL</code> environment variable.</p>
 *
 * <p>Possible values are <code>TRACE</code>, <code>DEBUG</code>,
 * <code>INFO</code>, <code>WARN</code>, <code>ERROR</code> and
 * <code>FATAL</code>. Defaults to <code>DEBUG</code>.</p>
 * @type {string}
 */
exports.logLevel = parseEnvEnum('TICTACTOE_LOG_LEVEL', logLevels, value => value.toUpperCase()) || 'DEBUG';

/**
 * Namespace to be used to avoid name collisions.
 *
 * <p>Customize it with the <code>$TICTACTOE_NAMESPACE</code> environment variable.</p>
 *
 * @type {string}
 */
exports.namespace = process.env.TICTACTOE_NAMESPACE || 'ch.comem.archioweb.tictactoe';

/**
 * The port on which the application's server will listen to. Defaults to
 * <code>3000</code>.
 *
 * <p>Customize it with the <code>$TICTACTOE_PORT</code> or <code>$PORT</code>
 * environment variables.</p>
 *
 * @type {number}
 */
exports.port = parseEnvInt('TICTACTOE_PORT', 1, 65535) || parseEnvInt('PORT', 1, 65535) || 3000;

/**
 * Secret to be used for authentication.
 *
 * <p>Customize it with the <code>$TICTACTOE_SECRET</code> environment variable.</p>
 *
 * @type {string}
 */
exports.secret = process.env.TICTACTOE_SECRET;

/**
 * Creates a named logger for the application.
 * @param {string} name - The logger's name (will be part of each log line).
 * @returns {Logger} A configured logger.
 */
exports.createLogger = function(name) {

  const logger = getLogger(name);
  logger.level = exports.logLevel;

  return logger;
};

function parseEnvEnum(name, allowedValues, transform = value => value) {

  const value = process.env[name];
  if (value === undefined) {
    return;
  } else if (!allowedValues.includes(transform(value))) {
    throw new Error(`Environment variable $${name} must have one of the following values: ${allowedValues.join(', ')}`);
  }

  return value;
}

function parseEnvInt(name, min, max) {

  const value = process.env[name];
  if (value === undefined) {
    return;
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable $${name} must be an integer between ${min || '-Infinity'} and ${max || 'Infinity'}`);
  }

  return parsed;
}
