import { gql } from 'graphql-tag';
import { signToken, hashPassword, comparePassword } from './auth';
import { Database } from './db';

let db: Database; // assigned during initialization

/** GraphQL type definitions */
export const typeDefs = gql`
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
export const resolvers = {
  Query: {
    me: (
      _: unknown,
      __: unknown,
      { user }: { user?: { id: string; email: string } },
    ) => user || null,
  },
  Mutation: {
    async register(
      _: unknown,
      { email, password }: { email: string; password: string },
    ) {
      const exists = db.data.users.find((u) => u.email === email);
      if (exists) throw new Error('Email in use');
      const hash = await hashPassword(password);
      const user = { id: Date.now().toString(), email, password: hash };
      db.data.users.push(user);
      await db.write();
      const token = signToken(user.id);
      return { token, user: { id: user.id, email: user.email } };
    },
    async login(
      _: unknown,
      { email, password }: { email: string; password: string },
    ) {
      const user = db.data.users.find((u) => u.email === email);
      if (!user) throw new Error('Invalid credentials');
      const valid = await comparePassword(password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      const token = signToken(user.id);
      return { token, user: { id: user.id, email: user.email } };
    },
    async changePassword(
      _: unknown,
      {
        oldPassword,
        newPassword,
      }: { oldPassword: string; newPassword: string },
      { user }: { user?: { id: string } },
    ) {
      if (!user) throw new Error('Not authenticated');
      const stored = db.data.users.find((u) => u.id === user.id)!;
      const valid = await comparePassword(oldPassword, stored.password);
      if (!valid) throw new Error('Invalid credentials');
      stored.password = await hashPassword(newPassword);
      await db.write();
      return true;
    },
    logout: () => true,
    refreshToken: (
      _: unknown,
      __: unknown,
      { user }: { user?: { id: string; email: string } },
    ) => {
      if (!user) throw new Error('Not authenticated');
      const token = signToken(user.id);
      return { token, user };
    },
    resetPassword: async (_: unknown, { email }: { email: string }) => {
      // placeholder for password reset logic
      return true;
    },
  },
};

/** Assign database instance to resolvers */
export function setDb(database: Database) {
  db = database;
}
