const { gql } = require('apollo-server-express');
const { signToken, hashPassword, comparePassword } = require('./auth');
let db; // will be set in init

/** GraphQL type definitions */
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    logout: Boolean!
    refreshToken: AuthPayload!
    resetPassword(email: String!): Boolean!
  }
`;

/** GraphQL resolvers */
const resolvers = {
  Query: {
    me: (_, __, { user }) => user || null,
  },
  Mutation: {
    async register(_, { email, password }) {
      const exists = db.data.users.find((u) => u.email === email);
      if (exists) throw new Error('Email in use');
      const hash = await hashPassword(password);
      const user = { id: Date.now().toString(), email, password: hash };
      db.data.users.push(user);
      await db.write();
      const token = signToken(user.id);
      return { token, user: { id: user.id, email: user.email } };
    },
    async login(_, { email, password }) {
      const user = db.data.users.find((u) => u.email === email);
      if (!user) throw new Error('Invalid credentials');
      const valid = await comparePassword(password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      const token = signToken(user.id);
      return { token, user: { id: user.id, email: user.email } };
    },
    async changePassword(_, { oldPassword, newPassword }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const stored = db.data.users.find((u) => u.id === user.id);
      const valid = await comparePassword(oldPassword, stored.password);
      if (!valid) throw new Error('Invalid credentials');
      stored.password = await hashPassword(newPassword);
      await db.write();
      return true;
    },
    logout: () => true,
    refreshToken: (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const token = signToken(user.id);
      return { token, user };
    },
    resetPassword: async (_, { email }) => {
      // placeholder for password reset logic
      return true;
    },
  },
};

module.exports = { typeDefs, resolvers, setDb: (database) => (db = database) };
