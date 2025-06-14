import pino from 'pino';
import config from './config';

/** Application logger instance using pino */
const logger = pino({
  transport: config.logging.betterStack.enabled
    ? // Production: Multiple transports (console + BetterStack)
      {
        targets: [
          {
            target: 'pino-pretty',
            options: {
              colorize: false,
              hideObject: true,
              translateTime: 'SYS:isoDateTime',
            },
            level: 'debug',
          },
          ...(config.logging.betterStack.sourceToken
            ? [
                {
                  target: '@logtail/pino',
                  options: {
                    sourceToken: config.logging.betterStack.sourceToken,
                    options: {
                      endpoint: config.logging.betterStack.endpoint,
                    }
                  },
                  level: 'debug',
                },
              ]
            : []),
        ],
      }
    : // Development: Pretty output only
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
});

export default logger;
