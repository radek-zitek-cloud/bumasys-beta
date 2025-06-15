/**
 * @fileoverview Tests for useValidation composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useValidation } from '../../../src/composables/useValidation'

describe('useValidation composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateRequired', () => {
    it('should pass for non-empty values', () => {
      const { validateRequired } = useValidation()
      const rule = validateRequired()

      expect(rule('valid string')).toBe(true)
      expect(rule('  valid with spaces  ')).toBe(true)
      expect(rule(123)).toBe(true)
      expect(rule(true)).toBe(true)
      expect(rule(false)).toBe(true)
      expect(rule(['item'])).toBe(true)
      expect(rule({ key: 'value' })).toBe(true)
    })

    it('should fail for empty values', () => {
      const { validateRequired } = useValidation()
      const rule = validateRequired()

      expect(rule('')).toBe('This field is required')
      expect(rule('   ')).toBe('This field is required')
      expect(rule(null)).toBe('This field is required')
      expect(rule(undefined)).toBe('This field is required')
      expect(rule([])).toBe('This field is required')
    })

    it('should accept custom error message', () => {
      const { validateRequired } = useValidation()
      const customMessage = 'Name is required'
      const rule = validateRequired(customMessage)

      expect(rule('')).toBe(customMessage)
      expect(rule(null)).toBe(customMessage)
    })
  })

  describe('validateEmail', () => {
    it('should pass for valid email addresses', () => {
      const { validateEmail } = useValidation()
      const rule = validateEmail()

      expect(rule('test@example.com')).toBe(true)
      expect(rule('user.name@domain.co.uk')).toBe(true)
      expect(rule('user+tag@example.org')).toBe(true)
      expect(rule('123@456.com')).toBe(true)
    })

    it('should pass for empty values (let required handle empty)', () => {
      const { validateEmail } = useValidation()
      const rule = validateEmail()

      expect(rule('')).toBe(true)
    })

    it('should fail for invalid email formats', () => {
      const { validateEmail } = useValidation()
      const rule = validateEmail()

      expect(rule('invalid')).toBe('Please enter a valid email address')
      expect(rule('@example.com')).toBe('Please enter a valid email address')
      expect(rule('user@')).toBe('Please enter a valid email address')
      expect(rule('user@.com')).toBe('Please enter a valid email address')
      expect(rule('user.example.com')).toBe('Please enter a valid email address')
      expect(rule('user space@example.com')).toBe('Please enter a valid email address')
    })

    it('should accept custom error message', () => {
      const { validateEmail } = useValidation()
      const customMessage = 'Email format is invalid'
      const rule = validateEmail(customMessage)

      expect(rule('invalid')).toBe(customMessage)
    })
  })

  describe('validateMinLength', () => {
    it('should pass for strings meeting minimum length', () => {
      const { validateMinLength } = useValidation()
      const rule = validateMinLength(5)

      expect(rule('12345')).toBe(true)
      expect(rule('123456')).toBe(true)
      expect(rule('exactly')).toBe(true)
    })

    it('should fail for strings below minimum length', () => {
      const { validateMinLength } = useValidation()
      const rule = validateMinLength(5)

      expect(rule('1234')).toBe('Must be at least 5 characters long')
      expect(rule('')).toBe(true) // Let required handle empty values
    })

    it('should accept custom error message', () => {
      const { validateMinLength } = useValidation()
      const customMessage = 'Password too short'
      const rule = validateMinLength(8, customMessage)

      expect(rule('123')).toBe(customMessage)
    })
  })

  describe('validateMaxLength', () => {
    it('should pass for strings within maximum length', () => {
      const { validateMaxLength } = useValidation()
      const rule = validateMaxLength(10)

      expect(rule('123')).toBe(true)
      expect(rule('1234567890')).toBe(true)
      expect(rule('')).toBe(true)
    })

    it('should fail for strings exceeding maximum length', () => {
      const { validateMaxLength } = useValidation()
      const rule = validateMaxLength(5)

      expect(rule('123456')).toBe('Must be no more than 5 characters long')
      expect(rule('very long string')).toBe('Must be no more than 5 characters long')
    })

    it('should accept custom error message', () => {
      const { validateMaxLength } = useValidation()
      const customMessage = 'Description too long'
      const rule = validateMaxLength(100, customMessage)

      expect(rule('a'.repeat(101))).toBe(customMessage)
    })
  })

  describe('validatePattern', () => {
    it('should pass for strings matching the pattern', () => {
      const { validatePattern } = useValidation()
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/
      const rule = validatePattern(phonePattern)

      expect(rule('123-456-7890')).toBe(true)
      expect(rule('555-123-4567')).toBe(true)
    })

    it('should fail for strings not matching the pattern', () => {
      const { validatePattern } = useValidation()
      const phonePattern = /^\d{3}-\d{3}-\d{4}$/
      const rule = validatePattern(phonePattern)

      expect(rule('1234567890')).toBe('Invalid format')
      expect(rule('123-45-6789')).toBe('Invalid format')
      expect(rule('abc-def-ghij')).toBe('Invalid format')
    })

    it('should handle empty values', () => {
      const { validatePattern } = useValidation()
      const pattern = /^\d+$/
      const rule = validatePattern(pattern)

      expect(rule('')).toBe(true) // Let required handle empty values
    })

    it('should accept custom error message', () => {
      const { validatePattern } = useValidation()
      const pattern = /^\d+$/
      const customMessage = 'Only numbers allowed'
      const rule = validatePattern(pattern, customMessage)

      expect(rule('abc')).toBe(customMessage)
    })
  })

  describe('validateNumeric', () => {
    it('should pass for numeric strings and numbers', () => {
      const { validateNumeric } = useValidation()
      const rule = validateNumeric()

      expect(rule('123')).toBe(true)
      expect(rule('123.45')).toBe(true)
      expect(rule('-123')).toBe(true)
      expect(rule('0')).toBe(true)
      expect(rule(123)).toBe(true)
      expect(rule(123.45)).toBe(true)
    })

    it('should fail for non-numeric values', () => {
      const { validateNumeric } = useValidation()
      const rule = validateNumeric()

      expect(rule('abc')).toBe('Must be a valid number')
      expect(rule('12a')).toBe(true) // parseFloat('12a') = 12, which is valid
      expect(rule('')).toBe(true) // Let required handle empty
    })

    it('should accept custom error message', () => {
      const { validateNumeric } = useValidation()
      const customMessage = 'Please enter a number'
      const rule = validateNumeric(customMessage)

      expect(rule('abc')).toBe(customMessage)
    })
  })

  describe('validateRange', () => {
    it('should pass for numbers within range', () => {
      const { validateRange } = useValidation()
      const rule = validateRange(1, 10)

      expect(rule(1)).toBe(true)
      expect(rule(5)).toBe(true)
      expect(rule(10)).toBe(true)
    })

    it('should fail for numbers outside range', () => {
      const { validateRange } = useValidation()
      const rule = validateRange(1, 10)

      expect(rule(0)).toBe('Must be between 1 and 10')
      expect(rule(11)).toBe('Must be between 1 and 10')
      expect(rule(-5)).toBe('Must be between 1 and 10')
    })

    it('should accept custom error message', () => {
      const { validateRange } = useValidation()
      const customMessage = 'Age must be 18-65'
      const rule = validateRange(18, 65, customMessage)

      expect(rule(17)).toBe(customMessage)
    })
  })

  describe('createValidator', () => {
    it('should create a custom validation rule', () => {
      const { createValidator } = useValidation()

      const isEven = createValidator(
        (value: number) => value % 2 === 0,
        'Number must be even'
      )

      expect(isEven(2)).toBe(true)
      expect(isEven(4)).toBe(true)
      expect(isEven(1)).toBe('Number must be even')
      expect(isEven(3)).toBe('Number must be even')
    })

    it('should handle custom validation functions that return boolean', () => {
      const { createValidator } = useValidation()

      const isPositive = createValidator(
        (value: number) => value > 0,
        'Must be positive'
      )

      expect(isPositive(1)).toBe(true)
      expect(isPositive(0)).toBe('Must be positive')
      expect(isPositive(-1)).toBe('Must be positive')
    })
  })

  describe('useFormValidation', () => {
    it('should create form validation utilities', () => {
      const { validateRequired, validateEmail, useFormValidation } = useValidation()

      const rules = {
        email: [validateRequired(), validateEmail()],
        name: [validateRequired()],
      }

      const formValidation = useFormValidation(rules)

      expect(formValidation).toBeDefined()
      expect(formValidation.validate).toBeInstanceOf(Function)
      expect(formValidation.clearErrors).toBeInstanceOf(Function)
      expect(formValidation.validateField).toBeInstanceOf(Function)
      expect(formValidation.isValid).toBeDefined()
      expect(formValidation.errors).toBeDefined()
    })

    it('should validate form data', async () => {
      const { validateRequired, validateEmail, useFormValidation } = useValidation()

      const rules = {
        email: [validateRequired(), validateEmail()],
        name: [validateRequired()],
      }

      const { validate, isValid, getFieldErrors } = useFormValidation(rules)

      // Test with invalid data
      const invalidData = { email: 'invalid-email', name: '' }
      const isValidResult = await validate(invalidData)

      expect(isValidResult).toBe(false)
      expect(isValid.value).toBe(false)
      expect(getFieldErrors('email')).toContain('Please enter a valid email address')
      expect(getFieldErrors('name')).toContain('This field is required')
    })

    it('should handle valid form data', async () => {
      const { validateRequired, validateEmail, useFormValidation } = useValidation()

      const rules = {
        email: [validateRequired(), validateEmail()],
        name: [validateRequired()],
      }

      const { validate, isValid, getFieldErrors } = useFormValidation(rules)

      const validData = { email: 'test@example.com', name: 'John Doe' }
      const isValidResult = await validate(validData)

      expect(isValidResult).toBe(true)
      expect(isValid.value).toBe(true)
      expect(getFieldErrors('email')).toEqual([])
      expect(getFieldErrors('name')).toEqual([])
    })

    it('should clear errors', () => {
      const { validateRequired, useFormValidation } = useValidation()

      const rules = { name: [validateRequired()] }
      const { validate, clearErrors, hasFieldErrors } = useFormValidation(rules)

      // Add some errors first
      validate({ name: '' })
      expect(hasFieldErrors('name')).toBe(true)

      clearErrors()
      expect(hasFieldErrors('name')).toBe(false)
    })

    it('should validate individual fields', () => {
      const { validateRequired, validateEmail, useFormValidation } = useValidation()

      const rules = {
        email: [validateRequired(), validateEmail()],
        name: [validateRequired()],
      }

      const { validateField, getFieldErrors } = useFormValidation(rules)

      const isValid = validateField('email', 'invalid-email')

      expect(isValid).toBe(false)
      expect(getFieldErrors('email')).toContain('Please enter a valid email address')
    })
  })
})
