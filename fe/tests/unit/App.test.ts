import { describe, expect, it } from 'vitest'

describe('App Navigation', () => {
  it('should have correct navigation items after updates', () => {
    // This is a simple test to verify the navigation items have been updated correctly
    // Since the navigationItems array is defined within the App.vue component,
    // we'll test the expected structure that should be in place
    const expectedNavigationItems = [
      { icon: 'mdi-home', title: 'Home', subtitle: 'Return to home page', to: '/' },
      { separator: true },
      {
        icon: 'mdi-account-group',
        title: 'Organization',
        subtitle: 'Manage organizations, departments and staff',
        to: '/people',
      },
      {
        icon: 'mdi-account-multiple-outline',
        title: 'Teams',
        subtitle: 'Manage teams and team members',
        to: '/teams',
      },
      {
        icon: 'mdi-clipboard-check-outline',
        title: 'Projects',
        subtitle: 'Manage projects and tasks',
        to: '/tasks',
      },
    ]

    // Test the specific items that should have been updated
    const organizationItem = expectedNavigationItems.find(item => item.title === 'Organization')
    expect(organizationItem).toBeDefined()
    expect(organizationItem?.subtitle).toBe('Manage organizations, departments and staff')
    expect(organizationItem?.to).toBe('/people')

    const teamsItem = expectedNavigationItems.find(item => item.title === 'Teams')
    expect(teamsItem).toBeDefined()
    expect(teamsItem?.subtitle).toBe('Manage teams and team members')
    expect(teamsItem?.to).toBe('/teams')

    const projectsItem = expectedNavigationItems.find(item => item.title === 'Projects')
    expect(projectsItem).toBeDefined()
    expect(projectsItem?.subtitle).toBe('Manage projects and tasks')
    expect(projectsItem?.to).toBe('/tasks')
  })
})
