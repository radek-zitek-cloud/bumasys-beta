const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const createDb = require('./db');
const config = require('./config');
const logger = require('./logger');
const { typeDefs, resolvers, setDb } = require('./schema');
const { verifyToken } = require('./auth');

/**
 * Create express app and Apollo server.
 */
async function createApp() {
  const app = express();
  const db = await createDb(config.dbFile);
  setDb(db);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const auth = req.headers.authorization || '';
      if (auth.startsWith('Bearer ')) {
        try {
          const payload = verifyToken(auth.slice(7));
          const user = db.data.users.find((u) => u.id === payload.id);
          return { user };
        } catch (err) {
          logger.warn('Invalid token');
        }
      }
      return {};
    },
  });
  await server.start();
  server.applyMiddleware({ app });
  return { app, server, db };
}

async function start() {
  const { app, server } = await createApp();
  app.listen(config.port, () => {
    logger.info(
      `Server running on http://localhost:${config.port}${server.graphqlPath}`,
    );
  });
}

if (require.main === module) {
  start().catch((err) => {
    logger.error(err);
    process.exit(1);
  });
}

module.exports = { createApp };
