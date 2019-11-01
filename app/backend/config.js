const { getLogger } = require('log4js');

const logLevels = [ 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL' ];

exports.logLevel = parseEnvEnum('TICTACTOE_LOG_LEVEL', logLevels, value => value.toUpperCase()) || 'DEBUG';
exports.port = parseEnvInt('TICTACTOE_PORT', 1, 65535) || parseEnvInt('PORT', 1, 65535) || 3000;

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
    throw new Error(`Environment variable ${name} must have one of the following values: ${allowedValues.join(', ')}`);
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
    throw new Error(`Environment variable ${name} must be an integer between ${min || '-Infinity'} and ${max || 'Infinity'}`);
  }

  return parsed;
}
