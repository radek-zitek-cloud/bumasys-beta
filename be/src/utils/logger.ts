import pino from 'pino';
import config from './config';

/** Application logger instance using pino */
const loggerOptions = {
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: config.logging.level || 'info',
        options: {
          colorize: true,
          hideObject: true,
          translateTime: 'SYS:isoDateTime',
        },
      },
      ...(config.logging.betterStack.sourceToken
        ? [
          {
            target: '@logtail/pino',
            level: config.logging.level || 'info',
            options: {
              sourceToken: config.logging.betterStack.sourceToken,
              options: {
                endpoint: config.logging.betterStack.endpoint,
              },
            },
          },
        ]
        : []),
    ],
  },
};


const logger = pino(loggerOptions);

console.log('Pino logger config:', JSON.stringify(loggerOptions, null, 2));

export default logger;
