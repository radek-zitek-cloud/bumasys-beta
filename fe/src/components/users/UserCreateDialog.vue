<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Create New User</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.email"
              label="Email *"
              prepend-icon="mdi-email"
              required
              :rules="emailRules"
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
            <v-text-field
              v-model="form.password"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              label="Password *"
              prepend-icon="mdi-lock"
              required
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="showPassword = !showPassword"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.confirmPassword"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              label="Confirm Password *"
              prepend-icon="mdi-lock-check"
              required
              :rules="confirmPasswordRules"
              :type="showConfirmPassword ? 'text' : 'password'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            />
            <v-progress-linear
              v-if="form.password"
              class="mt-2"
              :color="passwordStrengthColor"
              height="4"
              :model-value="passwordStrength"
            />
            <div v-if="form.password" class="text-caption mt-1" :class="`text-${passwordStrengthColor}`">
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
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Create User</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { CreateUserInput } from '../../services/users'
  import { computed, reactive, ref } from 'vue'

  /** Form data interface */
  interface FormData extends CreateUserInput {
    confirmPassword: string
  }

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

  /** Email validation rules */
  const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ]

  /** Password validation rules */
  const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  ]

  /** Confirm password validation rules */
  const confirmPasswordRules = [
    (v: string) => !!v || 'Please confirm your password',
    (v: string) => v === form.password || 'Passwords do not match',
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

  /** Check if form is valid */
  const isFormValid = computed(() => {
    return (
      form.email
      && /.+@.+\..+/.test(form.email)
      && form.password
      && form.password.length >= 6
      && form.confirmPassword
      && form.password === form.confirmPassword
    )
  })

  /** Define component events */
  const emit = defineEmits<{
    /** Emitted when form is submitted with valid data */
    (e: 'submit', data: CreateUserInput): void
    /** Emitted when creation is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value) return

    const { confirmPassword: _, ...userData } = form
    // Remove empty optional fields
    const cleanData: CreateUserInput = {
      email: userData.email,
      password: userData.password,
    }

    if (userData.firstName?.trim()) cleanData.firstName = userData.firstName.trim()
    if (userData.lastName?.trim()) cleanData.lastName = userData.lastName.trim()
    if (userData.note?.trim()) cleanData.note = userData.note.trim()

    emit('submit', cleanData)
  }
</script>
