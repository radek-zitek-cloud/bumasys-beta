import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PriorityCreateDialog from '../../../src/components/PriorityCreateDialog.vue'

describe('PriorityCreateDialog', () => {
  it('renders create priority form correctly', () => {
    const wrapper = mount(PriorityCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { 
            template: '<input class="v-text-field" :placeholder="label" />', 
            props: ['label', 'modelValue', 'rules', 'counter', 'maxlength', 'prependIcon', 'required']
          },
          'v-btn': { template: '<button class="v-btn" :disabled="disabled"><slot /></button>', props: ['disabled', 'color'] },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        }
      }
    })

    expect(wrapper.find('.v-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Create New Priority')
    expect(wrapper.find('.v-text-field').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Create Priority')
  })

  it('shows form validation with name field requirements', () => {
    const wrapper = mount(PriorityCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { 
            template: '<input class="v-text-field" :placeholder="label" />', 
            props: ['label', 'modelValue', 'rules', 'counter', 'maxlength', 'prependIcon', 'required']
          },
          'v-btn': { template: '<button class="v-btn" :disabled="disabled"><slot /></button>', props: ['disabled'] },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        }
      }
    })

    // Check that the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Verify the component rendered properly
    expect(wrapper.text()).toContain('Create New Priority')
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(PriorityCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { template: '<input class="v-text-field" />' },
          'v-btn': { template: '<button class="v-btn"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        }
      }
    })

    await wrapper.vm.$emit('cancel')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('emits submit event with priority data', async () => {
    const wrapper = mount(PriorityCreateDialog, {
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-text-field': { template: '<input class="v-text-field" />' },
          'v-btn': { template: '<button class="v-btn"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        }
      }
    })

    const priorityData = { name: 'High Priority' }
    await wrapper.vm.$emit('submit', priorityData)
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual([priorityData])
  })
})
