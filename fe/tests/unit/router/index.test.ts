/**
 * @fileoverview Tests for Vue Router configuration
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

// Mock logger utils
const mockLogDebug = vi.fn()
const mockLogInfo = vi.fn()
const mockLogWarn = vi.fn()
const mockLogError = vi.fn()

vi.mock('@/utils/logger', () => ({
  logDebug: mockLogDebug,
  logInfo: mockLogInfo,
  logWarn: mockLogWarn,
  logError: mockLogError,
}))

describe('Router Configuration', () => {
  let testRouter: ReturnType<typeof createRouter>

  beforeEach(() => {
    vi.clearAllMocks()
    // Create a fresh router instance for each test
    testRouter = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: () => Promise.resolve({}) },
        { path: '/users', name: 'users', component: () => Promise.resolve({}) },
        { path: '/tasks', name: 'tasks', component: () => Promise.resolve({}) },
        { path: '/teams', name: 'teams', component: () => Promise.resolve({}) },
        { path: '/budget', name: 'budget', component: () => Promise.resolve({}) },
        { path: '/people', name: 'people', component: () => Promise.resolve({}) },
        { path: '/references', name: 'references', component: () => Promise.resolve({}) },
      ],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create router instance', () => {
    expect(testRouter).toBeDefined()
    expect(testRouter.options).toBeDefined()
  })

  it('should have correct route configuration', () => {
    const routes = testRouter.getRoutes()
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBe(7) // home + 6 pages
  })

  it('should handle navigation to home page', async () => {
    await testRouter.push('/')
    expect(testRouter.currentRoute.value.path).toBe('/')
    expect(testRouter.currentRoute.value.name).toBe('home')
  })

  it('should handle navigation to users page', async () => {
    await testRouter.push('/users')
    expect(testRouter.currentRoute.value.path).toBe('/users')
    expect(testRouter.currentRoute.value.name).toBe('users')
  })

  it('should handle navigation to tasks page', async () => {
    await testRouter.push('/tasks')
    expect(testRouter.currentRoute.value.path).toBe('/tasks')
    expect(testRouter.currentRoute.value.name).toBe('tasks')
  })

  it('should handle navigation to teams page', async () => {
    await testRouter.push('/teams')
    expect(testRouter.currentRoute.value.path).toBe('/teams')
    expect(testRouter.currentRoute.value.name).toBe('teams')
  })

  it('should handle navigation to budget page', async () => {
    await testRouter.push('/budget')
    expect(testRouter.currentRoute.value.path).toBe('/budget')
    expect(testRouter.currentRoute.value.name).toBe('budget')
  })

  it('should handle navigation to people page', async () => {
    await testRouter.push('/people')
    expect(testRouter.currentRoute.value.path).toBe('/people')
    expect(testRouter.currentRoute.value.name).toBe('people')
  })

  it('should handle navigation to references page', async () => {
    await testRouter.push('/references')
    expect(testRouter.currentRoute.value.path).toBe('/references')
    expect(testRouter.currentRoute.value.name).toBe('references')
  })

  it('should handle navigation between routes', async () => {
    await testRouter.push('/')
    expect(testRouter.currentRoute.value.path).toBe('/')
    
    await testRouter.push('/users')
    expect(testRouter.currentRoute.value.path).toBe('/users')
    
    await testRouter.push('/tasks')
    expect(testRouter.currentRoute.value.path).toBe('/tasks')
  })

  it('should have history mode enabled', () => {
    expect(testRouter.options.history).toBeDefined()
  })

  it('should handle programmatic navigation', async () => {
    await testRouter.push({ name: 'users' })
    expect(testRouter.currentRoute.value.name).toBe('users')
    
    await testRouter.push({ name: 'tasks' })
    expect(testRouter.currentRoute.value.name).toBe('tasks')
  })

  it('should handle route replacement', async () => {
    await testRouter.push('/')
    await testRouter.replace('/users')
    expect(testRouter.currentRoute.value.path).toBe('/users')
  })
})
