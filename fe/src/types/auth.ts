/**
 * @fileoverview Authentication-related TypeScript interfaces
 * 
 * Centralized type definitions for authentication operations to ensure
 * consistency across components and reduce code duplication.
 */

/**
 * Interface for user login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Interface for user registration data
 */
export interface RegistrationData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  note?: string
}

/**
 * Interface for password change operation
 */
export interface PasswordChangeData {
  oldPassword: string
  newPassword: string
}

/**
 * Interface for user profile update data
 */
export interface ProfileUpdateData {
  firstName: string
  lastName: string
  note: string
}
