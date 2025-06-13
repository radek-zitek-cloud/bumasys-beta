import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createDb, Database } from './db';
import config from './config';
import logger from './logger';
import { typeDefs, resolvers, setDb } from './schema';
import { verifyToken } from './auth';

/**
 * Create express app and Apollo server.
 */
export async function createApp() {
  const app = express();
  const db = await createDb(config.dbFile);
  setDb(db);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization || '';
        if (auth.startsWith('Bearer ')) {
          try {
            const payload = verifyToken(auth.slice(7));
            const user = db.data.users.find((u) => u.id === payload.id);
            return { user };
          } catch {
            logger.warn('Invalid token');
          }
        }
        return {};
      },
    }),
  );

  return { app, server, db };
}

export async function start() {
  const { app } = await createApp();
  app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}/graphql`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    logger.error(err);
    process.exit(1);
  });
}
