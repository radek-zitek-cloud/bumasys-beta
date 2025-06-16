/**
 * @fileoverview Tests for useAuth composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../../../src/composables/useAuth'
import * as authApi from '../../../src/services/auth'
import { useAuthStore } from '../../../src/stores/auth'

// Mock dependencies
vi.mock('../../../src/services/auth')
vi.mock('../../../src/stores/auth')
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock auth store
const mockAuthStore = {
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  user: { id: '1', email: 'test@example.com' },
  refreshToken: 'refresh-token',
}

describe('useAuth composable', () => {
  let mockNotify: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockNotify = vi.fn()

    // Setup mock implementations
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any)
  })

  describe('login', () => {
    it('should handle successful login', async () => {
      const mockLoginResponse = {
        user: { id: '1', email: 'test@example.com' },
        token: 'access-token',
        refreshToken: 'refresh-token',
      }

      vi.mocked(authApi.login).mockResolvedValue({ login: mockLoginResponse })

      const { login, loginLoading } = useAuth(mockNotify)

      expect(loginLoading.value).toBe(false)

      const credentials = { email: 'test@example.com', password: 'password123' }
      const result = await login(credentials)

      expect(vi.mocked(authApi.login)).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      )
      expect(mockAuthStore.setAuth).toHaveBeenCalledWith(mockLoginResponse)
      expect(mockNotify).toHaveBeenCalledWith('Login successful')
      expect(result).toEqual(mockLoginResponse)
      expect(loginLoading.value).toBe(false)
    })

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(authApi.login).mockRejectedValue(mockError)

      const { login, loginLoading } = useAuth(mockNotify)

      const credentials = { email: 'test@example.com', password: 'wrong-password' }

      await expect(login(credentials)).rejects.toThrow('Invalid credentials')
      expect(mockNotify).toHaveBeenCalledWith('Invalid credentials', false)
      expect(mockAuthStore.setAuth).not.toHaveBeenCalled()
      expect(loginLoading.value).toBe(false)
    })
  })

  describe('register', () => {
    it('should handle successful registration', async () => {
      const mockRegisterResponse = {
        user: { id: '1', email: 'new@example.com' },
        token: 'access-token',
        refreshToken: 'refresh-token',
      }

      vi.mocked(authApi.register).mockResolvedValue({ register: mockRegisterResponse })

      const { register, registerLoading } = useAuth(mockNotify)

      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        note: 'Test user',
      }

      const result = await register(userData)

      expect(vi.mocked(authApi.register)).toHaveBeenCalledWith(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.note,
      )
      expect(mockAuthStore.setAuth).toHaveBeenCalledWith(mockRegisterResponse)
      expect(mockNotify).toHaveBeenCalledWith('Registration successful')
      expect(result).toEqual(mockRegisterResponse)
      expect(registerLoading.value).toBe(false)
    })
  })

  describe('logout', () => {
    it('should handle successful logout with refresh token', async () => {
      vi.mocked(authApi.logout).mockResolvedValue({ logout: true })

      const { logout, logoutLoading } = useAuth(mockNotify)

      await logout()

      expect(vi.mocked(authApi.logout)).toHaveBeenCalledWith('refresh-token')
      expect(mockNotify).toHaveBeenCalledWith('Logged out successfully')
      expect(mockAuthStore.clearAuth).toHaveBeenCalled()
      expect(logoutLoading.value).toBe(false)
    })
  })
})
