<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit User</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.email"
              hint="Email cannot be changed as it is used for login"
              label="Email *"
              persistent-hint
              prepend-icon="mdi-email"
              readonly
              type="email"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.firstName"
              label="First Name"
              prepend-icon="mdi-account"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.lastName"
              label="Last Name"
              prepend-icon="mdi-account"
            />
          </v-col>
          <v-col cols="12">
            <v-divider class="mb-3" />
            <div class="text-h6 mb-3">Password Change (Optional)</div>
            <v-text-field
              v-model="form.password"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              hint="Leave blank to keep current password"
              label="New Password"
              persistent-hint
              prepend-icon="mdi-lock"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="showPassword = !showPassword"
            />
          </v-col>
          <v-col v-if="form.password" cols="12">
            <v-text-field
              v-model="form.confirmPassword"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              label="Confirm New Password *"
              prepend-icon="mdi-lock-check"
              required
              :rules="confirmPasswordRules"
              :type="showConfirmPassword ? 'text' : 'password'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            />
            <v-progress-linear
              class="mt-2"
              :color="passwordStrengthColor"
              height="4"
              :model-value="passwordStrength"
            />
            <div class="text-caption mt-1" :class="`text-${passwordStrengthColor}`">
              Password strength: {{ passwordStrengthText }}
            </div>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.note"
              label="Note"
              prepend-icon="mdi-note-text"
              rows="3"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Update User</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { UpdateUserInput, User } from '../../services/users'
  import { computed, reactive, ref, watch } from 'vue'

  /** Form data interface */
  interface FormData {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    note: string
  }

  /** Component props */
  const props = defineProps<{
    /** User object to edit */
    user: User | null
  }>()

  /** Reactive form data */
  const form = reactive<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    note: '',
  })

  /** Password visibility toggles */
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  /** Watch for user prop changes and populate form */
  watch(
    () => props.user,
    user => {
      if (user) {
        form.email = user.email
        form.firstName = user.firstName || ''
        form.lastName = user.lastName || ''
        form.note = user.note || ''
        form.password = ''
        form.confirmPassword = ''
      }
    },
    { immediate: true },
  )

  /** Password validation rules (only when password is being changed) */
  const passwordRules = [
    (v: string) => !v || v.length >= 6 || 'Password must be at least 6 characters',
  ]

  /** Confirm password validation rules */
  const confirmPasswordRules = [
    (v: string) => !form.password || !!v || 'Please confirm your password',
    (v: string) => !form.password || v === form.password || 'Passwords do not match',
  ]

  /** Calculate password strength */
  const passwordStrength = computed(() => {
    const password = form.password
    if (!password) return 0

    let strength = 0
    if (password.length >= 6) strength += 20
    if (password.length >= 8) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 10
    if (/[^A-Za-z0-9]/.test(password)) strength += 10

    return Math.min(strength, 100)
  })

  /** Password strength color */
  const passwordStrengthColor = computed(() => {
    const strength = passwordStrength.value
    if (strength < 40) return 'error'
    if (strength < 70) return 'warning'
    return 'success'
  })

  /** Password strength text */
  const passwordStrengthText = computed(() => {
    const strength = passwordStrength.value
    if (strength < 40) return 'Weak'
    if (strength < 70) return 'Medium'
    return 'Strong'
  })

  /** Check if form is valid (email is readonly, so no validation needed for it) */
  const isFormValid = computed(() => {
    const passwordValid = !form.password || (
      form.password.length >= 6
      && form.confirmPassword
      && form.password === form.confirmPassword
    )
    return passwordValid
  })

  /** Define component events */
  const emit = defineEmits<{
    /** Emitted when form is submitted with valid data */
    (e: 'submit', data: UpdateUserInput): void
    /** Emitted when editing is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value || !props.user) return

    const updateData: UpdateUserInput = {
      id: props.user.id,
      // Email is intentionally excluded - it cannot be changed
    }

    // Only include fields that have values
    if (form.firstName?.trim()) updateData.firstName = form.firstName.trim()
    if (form.lastName?.trim()) updateData.lastName = form.lastName.trim()
    if (form.note?.trim()) updateData.note = form.note.trim()
    if (form.password?.trim()) updateData.password = form.password.trim()

    emit('submit', updateData)
  }
</script>
