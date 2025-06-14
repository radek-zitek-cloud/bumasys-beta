/**
 * @fileoverview User service module
 *
 * This module contains all business logic related to user management,
 * including user creation, updates, deletion, and retrieval operations.
 * It provides a service layer between GraphQL resolvers and the database.
 */

import type {
  Database,
  User,
  SafeUser,
  RegisterInput,
  UpdateUserInput,
} from '../types';
import { hashPassword } from './auth.service';

/**
 * Service class for user management operations
 */
export class UserService {
  private db: Database;

  /**
   * Initialize the user service with a database instance
   * @param database - The database instance to use for operations
   */
  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Remove password from user object for safe API responses
   * @param user - User object with password
   * @returns User object without password field
   */
  private toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Find a user by email address
   * @param email - Email address to search for
   * @returns User object if found, undefined otherwise
   */
  public findByEmail(email: string): User | undefined {
    return this.db.data.users.find((u) => u.email === email);
  }

  /**
   * Find a user by ID
   * @param id - User ID to search for
   * @returns User object if found, undefined otherwise
   */
  public findById(id: string): User | undefined {
    return this.db.data.users.find((u) => u.id === id);
  }

  /**
   * Get all users without password information
   * @returns Array of safe user objects
   */
  public getAllUsers(): SafeUser[] {
    return this.db.data.users.map(this.toSafeUser);
  }

  /**
   * Get a safe user object by ID
   * @param id - User ID to retrieve
   * @returns Safe user object if found, null otherwise
   */
  public getSafeUserById(id: string): SafeUser | null {
    const user = this.findById(id);
    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Create a new user with the provided information
   * @param userData - User registration data
   * @returns Promise resolving to the created safe user object
   * @throws Error if email is already in use
   */
  public async createUser(userData: RegisterInput): Promise<SafeUser> {
    // Check if email is already in use
    const existingUser = this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email in use');
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create new user object
    const newUser: User = {
      id: Date.now().toString(), // Simple ID generation - consider UUID in production
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      note: userData.note,
    };

    // Add to database
    this.db.data.users.push(newUser);
    await this.db.write();

    return this.toSafeUser(newUser);
  }

  /**
   * Update an existing user's information
   * @param updateData - User update data including ID
   * @returns Promise resolving to the updated safe user object
   * @throws Error if user is not found
   */
  public async updateUser(updateData: UpdateUserInput): Promise<SafeUser> {
    const user = this.findById(updateData.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update fields if provided
    if (updateData.email !== undefined) {
      user.email = updateData.email;
    }
    if (updateData.password !== undefined) {
      user.password = await hashPassword(updateData.password);
    }
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName;
    }
    if (updateData.note !== undefined) {
      user.note = updateData.note;
    }

    // Save changes
    await this.db.write();

    return this.toSafeUser(user);
  }

  /**
   * Delete a user by ID
   * @param id - ID of the user to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  public async deleteUser(id: string): Promise<boolean> {
    const index = this.db.data.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return false;
    }

    // Remove user from array
    this.db.data.users.splice(index, 1);
    await this.db.write();

    return true;
  }

  /**
   * Change a user's password
   * @param userId - ID of the user changing password
   * @param oldPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns Promise resolving to true if successful
   * @throws Error if user not found or old password is invalid
   */
  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password - import comparePassword here to avoid circular deps
    const { comparePassword } = await import('./auth.service');
    const isValidOldPassword = await comparePassword(
      oldPassword,
      user.password,
    );
    if (!isValidOldPassword) {
      throw new Error('Invalid credentials');
    }

    // Set new password
    user.password = await hashPassword(newPassword);
    await this.db.write();

    return true;
  }
}
