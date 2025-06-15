/**
 * @fileoverview Form Validation Composable
 * 
 * This composable provides reusable form validation logic that can be used
 * across all forms in the application. It includes common validation rules,
 * custom validation support, and reactive validation state management.
 * 
 * Features:
 * - Pre-defined validation rules for common fields
 * - Custom validation rule support
 * - Reactive validation state management
 * - Consistent error messaging
 * - Form-wide validation status
 * - Async validation support
 * 
 * Usage:
 * ```typescript
 * const { 
 *   validateRequired, 
 *   validateEmail, 
 *   validateMinLength,
 *   createValidator,
 *   useFormValidation 
 * } = useValidation()
 * 
 * // Use in component
 * const { errors, isValid, validate, clearErrors } = useFormValidation({
 *   email: [validateRequired, validateEmail],
 *   password: [validateRequired, validateMinLength(8)]
 * })
 * ```
 * 
 * TODO: Add debounced validation for real-time feedback
 * TODO: Implement field-level validation state
 * TODO: Add internationalization support for error messages
 * TODO: Create validation rule composer for complex rules
 * TODO: Add async validation for server-side checks
 */

import { ref, computed, reactive, readonly } from 'vue'

/**
 * Validation rule function type
 */
export type ValidationRule<T = any> = (value: T) => boolean | string

/**
 * Validation rules configuration
 */
export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

/**
 * Validation errors state
 */
export type ValidationErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string[]
}

/**
 * Common validation rule creators and form validation utilities
 */
export function useValidation() {
  /**
   * Required field validation
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validateRequired = (message = 'This field is required'): ValidationRule => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') {
        return message
      }
      if (typeof value === 'string' && value.trim() === '') {
        return message
      }
      if (Array.isArray(value) && value.length === 0) {
        return message
      }
      return true
    }
  }

  /**
   * Email format validation
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validateEmail = (message = 'Please enter a valid email address'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return true // Let required handle empty values
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) || message
    }
  }

  /**
   * Minimum length validation
   * @param minLength - Minimum required length
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validateMinLength = (minLength: number, message?: string): ValidationRule<string> => {
    const defaultMessage = `Must be at least ${minLength} characters long`
    return (value: string) => {
      if (!value) return true // Let required handle empty values
      return value.length >= minLength || (message || defaultMessage)
    }
  }

  /**
   * Maximum length validation
   * @param maxLength - Maximum allowed length
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validateMaxLength = (maxLength: number, message?: string): ValidationRule<string> => {
    const defaultMessage = `Must be no more than ${maxLength} characters long`
    return (value: string) => {
      if (!value) return true
      return value.length <= maxLength || (message || defaultMessage)
    }
  }

  /**
   * Pattern matching validation
   * @param pattern - Regular expression pattern
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validatePattern = (pattern: RegExp, message = 'Invalid format'): ValidationRule<string> => {
    return (value: string) => {
      if (!value) return true
      return pattern.test(value) || message
    }
  }

  /**
   * Numeric value validation
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validateNumeric = (message = 'Must be a valid number'): ValidationRule<string | number> => {
    return (value: string | number) => {
      if (!value && value !== 0) return true
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      return !isNaN(numValue) || message
    }
  }

  /**
   * Range validation for numbers
   * @param min - Minimum value
   * @param max - Maximum value
   * @param message - Custom error message
   * @returns Validation rule function
   */
  const validateRange = (min: number, max: number, message?: string): ValidationRule<number> => {
    const defaultMessage = `Must be between ${min} and ${max}`
    return (value: number) => {
      if (value === null || value === undefined) return true
      return (value >= min && value <= max) || (message || defaultMessage)
    }
  }

  /**
   * Custom validation rule creator
   * @param validatorFn - Custom validation function
   * @param message - Error message
   * @returns Validation rule function
   */
  const createValidator = <T>(
    validatorFn: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => {
    return (value: T) => validatorFn(value) || message
  }

  /**
   * Form validation composable
   * @param rules - Validation rules for form fields
   * @returns Validation state and methods
   */
  function useFormValidation<T extends Record<string, any>>(rules: ValidationRules<T>) {
    const errors = reactive<ValidationErrors<T>>({})
    const isValidating = ref(false)

    /**
     * Computed property indicating if the form is valid (no errors)
     */
    const isValid = computed(() => {
      return Object.values(errors).every(fieldErrors => 
        !fieldErrors || fieldErrors.length === 0
      )
    })

    /**
     * Validate a specific field
     * @param fieldName - Field to validate
     * @param value - Field value
     * @returns Array of error messages (empty if valid)
     */
    const validateField = (fieldName: keyof T, value: any): string[] => {
      const fieldRules = rules[fieldName] || []
      const fieldErrors: string[] = []

      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          fieldErrors.push(typeof result === 'string' ? result : 'Invalid value')
        }
      }

      return fieldErrors
    }

    /**
     * Validate the entire form
     * @param data - Form data to validate
     * @returns Promise resolving to validation success
     */
    const validate = async (data: T): Promise<boolean> => {
      isValidating.value = true
      
      try {
        // Clear previous errors
        Object.keys(errors).forEach(key => {
          delete errors[key as keyof T]
        })

        // Validate each field
        for (const [fieldName, value] of Object.entries(data)) {
          const fieldErrors = validateField(fieldName as keyof T, value)
          if (fieldErrors.length > 0) {
            errors[fieldName as keyof T] = fieldErrors
          }
        }

        return isValid.value
      } finally {
        isValidating.value = false
      }
    }

    /**
     * Validate a single field and update errors
     * @param fieldName - Field to validate
     * @param value - Field value
     * @returns Whether field is valid
     */
    const validateSingleField = (fieldName: keyof T, value: any): boolean => {
      const fieldErrors = validateField(fieldName, value)
      
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors
        return false
      } else {
        delete errors[fieldName]
        return true
      }
    }

    /**
     * Clear all validation errors
     */
    const clearErrors = () => {
      Object.keys(errors).forEach(key => {
        delete errors[key as keyof T]
      })
    }

    /**
     * Clear errors for a specific field
     * @param fieldName - Field to clear errors for
     */
    const clearFieldErrors = (fieldName: keyof T) => {
      delete errors[fieldName]
    }

    /**
     * Get error messages for a specific field
     * @param fieldName - Field name
     * @returns Array of error messages
     */
    const getFieldErrors = (fieldName: keyof T): string[] => {
      return errors[fieldName] || []
    }

    /**
     * Check if a specific field has errors
     * @param fieldName - Field name
     * @returns Whether field has errors
     */
    const hasFieldErrors = (fieldName: keyof T): boolean => {
      const fieldErrors = errors[fieldName]
      return fieldErrors ? fieldErrors.length > 0 : false
    }

    return {
      errors: readonly(errors),
      isValid,
      isValidating: readonly(isValidating),
      validate,
      validateField: validateSingleField,
      clearErrors,
      clearFieldErrors,
      getFieldErrors,
      hasFieldErrors,
    }
  }

  return {
    // Rule creators
    validateRequired,
    validateEmail,
    validateMinLength,
    validateMaxLength,
    validatePattern,
    validateNumeric,
    validateRange,
    createValidator,
    
    // Form validation composable
    useFormValidation,
  }
}

export default useValidation