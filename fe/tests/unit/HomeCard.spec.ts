import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import HomeCard from '@/components/HomeCard.vue'

// Basic unit test ensuring the home card renders the welcome text

describe('HomeCard', () => {
  it('renders welcome message', () => {
    const { getByText } = render(HomeCard)
    expect(getByText('Welcome to')).toBeTruthy()
  })
})
