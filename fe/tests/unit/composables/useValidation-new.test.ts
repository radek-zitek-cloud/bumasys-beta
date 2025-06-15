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
      expect(rule('  ')).toBe('This field is required')
      expect(rule(null)).toBe('This field is required')
      expect(rule(undefined)).toBe('This field is required')
      expect(rule([])).toBe('This field is required')
    })

    it('should use custom error message', () => {
      const { validateRequired } = useValidation()
      const customMessage = 'Custom required message'
      const rule = validateRequired(customMessage)

      expect(rule('')).toBe(customMessage)
    })
  })

  describe('validateEmail', () => {
    it('should pass for valid email addresses', () => {
      const { validateEmail } = useValidation()
      const rule = validateEmail()

      expect(rule('test@example.com')).toBe(true)
      expect(rule('user.name+tag@domain.com')).toBe(true)
      expect(rule('valid@sub.domain.com')).toBe(true)
    })

    it('should fail for invalid email addresses', () => {
      const { validateEmail } = useValidation()
      const rule = validateEmail()

      expect(rule('invalid')).toBe('Please enter a valid email address')
      expect(rule('@example.com')).toBe('Please enter a valid email address')
      expect(rule('test@')).toBe('Please enter a valid email address')
      expect(rule('test@.com')).toBe('Please enter a valid email address')
    })

    it('should pass for empty values (let required handle them)', () => {
      const { validateEmail } = useValidation()
      const rule = validateEmail()

      expect(rule('')).toBe(true)
      expect(rule(null as any)).toBe(true)
      expect(rule(undefined as any)).toBe(true)
    })

    it('should use custom error message', () => {
      const { validateEmail } = useValidation()
      const customMessage = 'Custom email message'
      const rule = validateEmail(customMessage)

      expect(rule('invalid')).toBe(customMessage)
    })
  })

  describe('validateMinLength', () => {
    it('should pass for strings meeting minimum length', () => {
      const { validateMinLength } = useValidation()
      const rule = validateMinLength(3)

      expect(rule('abc')).toBe(true)
      expect(rule('abcd')).toBe(true)
      expect(rule('longer string')).toBe(true)
    })

    it('should fail for strings below minimum length', () => {
      const { validateMinLength } = useValidation()
      const rule = validateMinLength(3)

      expect(rule('ab')).toBe('Must be at least 3 characters long')
      expect(rule('a')).toBe('Must be at least 3 characters long')
      expect(rule('')).toBe(true) // Empty values pass (handled by required)
    })

    it('should use custom error message', () => {
      const { validateMinLength } = useValidation()
      const customMessage = 'Password too short'
      const rule = validateMinLength(8, customMessage)

      expect(rule('short')).toBe(customMessage)
    })
  })

  describe('validateMaxLength', () => {
    it('should pass for strings within maximum length', () => {
      const { validateMaxLength } = useValidation()
      const rule = validateMaxLength(10)

      expect(rule('short')).toBe(true)
      expect(rule('exactly10!')).toBe(true)
      expect(rule('')).toBe(true)
    })

    it('should fail for strings exceeding maximum length', () => {
      const { validateMaxLength } = useValidation()
      const rule = validateMaxLength(5)

      expect(rule('toolong')).toBe('Must be no more than 5 characters long')
      expect(rule('way too long')).toBe('Must be no more than 5 characters long')
    })
  })

  describe('validatePattern', () => {
    it('should pass for strings matching pattern', () => {
      const { validatePattern } = useValidation()
      const rule = validatePattern(/^\d+$/) // Only numbers

      expect(rule('123')).toBe(true)
      expect(rule('0')).toBe(true)
      expect(rule('')).toBe(true) // Empty values pass
    })

    it('should fail for strings not matching pattern', () => {
      const { validatePattern } = useValidation()
      const rule = validatePattern(/^\d+$/, 'Only numbers allowed')

      expect(rule('abc')).toBe('Only numbers allowed')
      expect(rule('123abc')).toBe('Only numbers allowed')
    })
  })

  describe('validateNumeric', () => {
    it('should pass for valid numbers', () => {
      const { validateNumeric } = useValidation()
      const rule = validateNumeric()

      expect(rule(123)).toBe(true)
      expect(rule('123')).toBe(true)
      expect(rule('123.45')).toBe(true)
      expect(rule(0)).toBe(true)
      expect(rule('0')).toBe(true)
    })

    it('should fail for non-numeric values', () => {
      const { validateNumeric } = useValidation()
      const rule = validateNumeric()

      expect(rule('abc')).toBe('Must be a valid number')
      expect(rule('123abc')).toBe('Must be a valid number')
    })

    it('should pass for empty values', () => {
      const { validateNumeric } = useValidation()
      const rule = validateNumeric()

      expect(rule('')).toBe(true)
      expect(rule(null as any)).toBe(true)
      expect(rule(undefined as any)).toBe(true)
    })
  })

  describe('validateRange', () => {
    it('should pass for values within range', () => {
      const { validateRange } = useValidation()
      const rule = validateRange(1, 10)

      expect(rule(1)).toBe(true)
      expect(rule(5)).toBe(true)
      expect(rule(10)).toBe(true)
    })

    it('should fail for values outside range', () => {
      const { validateRange } = useValidation()
      const rule = validateRange(1, 10)

      expect(rule(0)).toBe('Must be between 1 and 10')
      expect(rule(11)).toBe('Must be between 1 and 10')
      expect(rule(-5)).toBe('Must be between 1 and 10')
    })

    it('should pass for null/undefined values', () => {
      const { validateRange } = useValidation()
      const rule = validateRange(1, 10)

      expect(rule(null as any)).toBe(true)
      expect(rule(undefined as any)).toBe(true)
    })
  })

  describe('createValidator', () => {
    it('should create custom validation rules', () => {
      const { createValidator } = useValidation()
      const rule = createValidator(
        (value: string) => value.startsWith('prefix_'),
        'Must start with prefix_'
      )

      expect(rule('prefix_valid')).toBe(true)
      expect(rule('invalid')).toBe('Must start with prefix_')
    })
  })

  describe('useFormValidation', () => {
    it('should validate form data', async () => {
      const { validateRequired, validateEmail, useFormValidation } = useValidation()
      
      const { validate, errors, isValid } = useFormValidation({
        email: [validateRequired(), validateEmail()],
        name: [validateRequired()]
      })

      // Valid data
      const validData = { email: 'test@example.com', name: 'John Doe' }
      const isValidResult = await validate(validData)

      expect(isValidResult).toBe(true)
      expect(isValid.value).toBe(true)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('should handle validation errors', async () => {
      const { validateRequired, validateEmail, useFormValidation } = useValidation()
      
      const { validate, errors, isValid, getFieldErrors } = useFormValidation({
        email: [validateRequired(), validateEmail()],
        name: [validateRequired()]
      })

      // Invalid data
      const invalidData = { email: 'invalid-email', name: '' }
      const isValidResult = await validate(invalidData)

      expect(isValidResult).toBe(false)
      expect(isValid.value).toBe(false)
      expect(getFieldErrors('email')).toContain('Please enter a valid email address')
      expect(getFieldErrors('name')).toContain('This field is required')
    })

    it('should validate single fields', () => {
      const { validateRequired, useFormValidation } = useValidation()
      
      const { validateField, hasFieldErrors, getFieldErrors } = useFormValidation({
        name: [validateRequired()]
      })

      // Valid field
      expect(validateField('name', 'John')).toBe(true)
      expect(hasFieldErrors('name')).toBe(false)

      // Invalid field
      expect(validateField('name', '')).toBe(false)
      expect(hasFieldErrors('name')).toBe(true)
      expect(getFieldErrors('name')).toContain('This field is required')
    })

    it('should clear errors', () => {
      const { validateRequired, useFormValidation } = useValidation()
      
      const { validateField, clearErrors, clearFieldErrors, hasFieldErrors } = useFormValidation({
        name: [validateRequired()],
        email: [validateRequired()]
      })

      // Create some errors
      validateField('name', '')
      validateField('email', '')

      expect(hasFieldErrors('name')).toBe(true)
      expect(hasFieldErrors('email')).toBe(true)

      // Clear specific field
      clearFieldErrors('name')
      expect(hasFieldErrors('name')).toBe(false)
      expect(hasFieldErrors('email')).toBe(true)

      // Clear all errors
      clearErrors()
      expect(hasFieldErrors('name')).toBe(false)
      expect(hasFieldErrors('email')).toBe(false)
    })
  })
})
