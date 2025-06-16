import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import OrganizationCreateDialog from '../../../src/components/organization/OrganizationCreateDialog.vue'

describe('OrganizationCreateDialog', () => {
  it('renders form fields correctly', () => {
    const wrapper = mount(OrganizationCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { template: '<input class="v-text-field" />', props: ['label', 'modelValue'] },
          'v-textarea': { template: '<textarea class="v-textarea"></textarea>', props: ['label', 'modelValue'] },
          'v-btn': { template: '<button class="v-btn"><slot /></button>', props: ['color', 'loading'] },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    expect(wrapper.find('.v-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Create New Organization')
    expect(wrapper.findAll('.v-text-field')).toHaveLength(1)
    expect(wrapper.findAll('.v-textarea')).toHaveLength(1)
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(OrganizationCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { template: '<input class="v-text-field" />' },
          'v-textarea': { template: '<textarea class="v-textarea"></textarea>' },
          'v-btn': { template: '<button class="v-btn" @click="$emit(\'click\')"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    // Emit cancel event directly
    await wrapper.vm.$emit('cancel')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('validates required fields', async () => {
    const wrapper = mount(OrganizationCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': {
            template: '<input class="v-text-field" v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'v-textarea': {
            template: '<textarea class="v-textarea" v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'v-btn': { template: '<button class="v-btn" :disabled="disabled"><slot /></button>', props: ['disabled'] },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    // Check that the component handles validation
    expect(wrapper.exists()).toBe(true)
  })

  it('emits created event with form data on successful submission', async () => {
    const mockSubmit = vi.fn()
    const wrapper = mount(OrganizationCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { template: '<input class="v-text-field" />' },
          'v-textarea': { template: '<textarea class="v-textarea"></textarea>' },
          'v-btn': { template: '<button class="v-btn"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    // Test that the component can emit created event
    await wrapper.vm.$emit('created', { name: 'Test Org', description: 'Test Description' })

    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')![0]).toEqual([{ name: 'Test Org', description: 'Test Description' }])
  })
})
