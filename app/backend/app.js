const express = require('express');
const createError = require('http-errors');
const { connectLogger } = require('log4js');
const path = require('path');

const { createLogger } = require('./config');

const app = express();
const logger = createLogger('express');

app.use(connectLogger(logger, { level: 'TRACE' }));
app.use('/docs', express.static(path.join(__dirname, '..', '..', 'docs')));
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  next(createError(404));
});

// Handle errors.
app.use(function(err, req, res, next) {

  // Log error to the console.
  logger.error(err.stack);

  // Respond with the error message.
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
