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
              translateTime: 'SYS:isoDateTime',
            },
            level: 'info',
          },
          ...(config.logging.betterStack.sourceToken
            ? [
                {
                  target: '@logtail/pino',
                  options: {
                    sourceToken: config.logging.betterStack.sourceToken,
                  },
                  level: 'info',
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
