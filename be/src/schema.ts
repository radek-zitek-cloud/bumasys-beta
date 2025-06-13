import { gql } from 'graphql-tag';
import {
  signToken,
  signRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  hashPassword,
  comparePassword,
} from './auth';
import { Database } from './db';

let db: Database; // assigned during initialization

/** GraphQL type definitions */
export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    note: String
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  type Query {
    me: User
    health: Boolean!
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    register(
      email: String!
      password: String!
      firstName: String
      lastName: String
      note: String
    ): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    createUser(
      email: String!
      password: String!
      firstName: String
      lastName: String
      note: String
    ): User!
    updateUser(
      id: ID!
      email: String
      password: String
      firstName: String
      lastName: String
      note: String
    ): User!
    deleteUser(id: ID!): Boolean!
    logout(refreshToken: String!): Boolean!
    refreshToken(refreshToken: String!): AuthPayload!
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
    health: () => Boolean(db),
    users: (_: unknown, __: unknown, { user }: { user?: { id: string } }) => {
      if (!user) throw new Error('Unauthenticated');
      return db.data.users.map(({ password, ...rest }) => rest);
    },
    user: (
      _: unknown,
      { id }: { id: string },
      { user }: { user?: { id: string } },
    ) => {
      if (!user) throw new Error('Unauthenticated');
      const found = db.data.users.find((u) => u.id === id);
      if (!found) return null;
      const { password, ...rest } = found;
      return rest;
    },
  },
  Mutation: {
    async register(
      _: unknown,
      {
        email,
        password,
        firstName,
        lastName,
        note,
      }: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        note?: string;
      },
    ) {
      const exists = db.data.users.find((u) => u.email === email);
      if (exists) throw new Error('Email in use');
      const hash = await hashPassword(password);
      const user = {
        id: Date.now().toString(),
        email,
        password: hash,
        firstName,
        lastName,
        note,
      };
      db.data.users.push(user);
      await db.write();
      const token = signToken(user.id);
      const refreshToken = signRefreshToken(user.id);
      const { password: _p, ...rest } = user;
      return { token, refreshToken, user: rest };
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
      const refreshToken = signRefreshToken(user.id);
      const { password: _p, ...rest } = user;
      return { token, refreshToken, user: rest };
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
    async createUser(
      _: unknown,
      {
        email,
        password,
        firstName,
        lastName,
        note,
      }: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        note?: string;
      },
      { user }: { user?: { id: string } },
    ) {
      if (!user) throw new Error('Unauthenticated');
      const exists = db.data.users.find((u) => u.email === email);
      if (exists) throw new Error('Email in use');
      const hash = await hashPassword(password);
      const newUser = {
        id: Date.now().toString(),
        email,
        password: hash,
        firstName,
        lastName,
        note,
      };
      db.data.users.push(newUser);
      await db.write();
      const { password: _p, ...rest } = newUser;
      return rest;
    },
    async updateUser(
      _: unknown,
      {
        id,
        email,
        password,
        firstName,
        lastName,
        note,
      }: {
        id: string;
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        note?: string;
      },
      { user }: { user?: { id: string } },
    ) {
      if (!user) throw new Error('Unauthenticated');
      const existing = db.data.users.find((u) => u.id === id);
      if (!existing) throw new Error('User not found');
      if (email !== undefined) existing.email = email;
      if (password !== undefined)
        existing.password = await hashPassword(password);
      if (firstName !== undefined) existing.firstName = firstName;
      if (lastName !== undefined) existing.lastName = lastName;
      if (note !== undefined) existing.note = note;
      await db.write();
      const { password: _pw, ...rest } = existing;
      return rest;
    },
    deleteUser(
      _: unknown,
      { id }: { id: string },
      { user }: { user?: { id: string } },
    ) {
      if (!user) throw new Error('Unauthenticated');
      const index = db.data.users.findIndex((u) => u.id === id);
      if (index === -1) return false;
      db.data.users.splice(index, 1);
      return db.write().then(() => true);
    },
    logout: (_: unknown, { refreshToken }: { refreshToken: string }) => {
      invalidateRefreshToken(refreshToken);
      return true;
    },
    refreshToken: (_: unknown, { refreshToken }: { refreshToken: string }) => {
      const payload = verifyRefreshToken(refreshToken);
      invalidateRefreshToken(refreshToken);
      const user = db.data.users.find((u) => u.id === payload.id);
      if (!user) throw new Error('Invalid refresh token');
      const token = signToken(user.id);
      const newRefresh = signRefreshToken(user.id);
      const { password: _pw, ...rest } = user;
      return {
        token,
        refreshToken: newRefresh,
        user: rest,
      };
    },
    resetPassword: async (_: unknown, { email }: { email: string }) => {
      // placeholder for password reset logic
      return true;
    },
  },
};

/**
 * Assign the active database instance used by resolvers.
 * The health query relies on this value to determine readiness.
 */
export function setDb(database: Database) {
  db = database;
}
