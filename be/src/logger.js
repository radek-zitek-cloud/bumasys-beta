const pino = require('pino');

/**
 * Application logger instance using pino.
 */
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

module.exports = logger;
