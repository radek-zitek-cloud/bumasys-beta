<!--
  @fileoverview Create User from Staff Dialog Component

  This dialog allows creating a user account from an existing staff member.
  It pre-populates the form with staff member data and provides a streamlined
  interface for user account creation.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="success">mdi-account-plus</v-icon>
        Create User Account
      </v-card-title>

      <v-card-subtitle>
        Creating user account for: <strong>{{ staffMember?.firstName }} {{ staffMember?.lastName }}</strong>
      </v-card-subtitle>

      <v-card-text>
        <v-alert
          class="mb-4"
          color="info"
          icon="mdi-information"
          variant="tonal"
        >
          This will create a user account that allows the staff member to log into the system.
        </v-alert>

        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.email"
              hint="Email is pre-filled from staff record"
              label="Email *"
              persistent-hint
              prepend-icon="mdi-email"
              readonly
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
            <div class="mt-2">
              <v-progress-linear
                :color="passwordStrengthColor"
                height="4"
                :model-value="passwordStrength"
                rounded
              />
              <div class="text-caption mt-1 d-flex justify-space-between">
                <span>Password Strength: {{ passwordStrengthText }}</span>
                <span>{{ passwordStrength }}%</span>
              </div>
            </div>
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
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.note"
              hint="Additional information about this user account"
              label="Note (Optional)"
              persistent-hint
              prepend-icon="mdi-note-text"
              rows="3"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="onCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="success"
          :disabled="!isFormValid"
          prepend-icon="mdi-account-plus"
          type="submit"
        >
          Create User Account
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Staff } from '../../services/staff'
  import type { CreateUserInput } from '../../services/users'
  import { computed, reactive, ref, watch } from 'vue'

  /** Component props */
  interface Props {
    /** Initial user data pre-populated from staff */
    initialData: CreateUserInput
    /** Staff member this user account is being created for */
    staffMember: Staff | null
  }

  const props = defineProps<Props>()

  /** Component events */
  const emit = defineEmits<{
    /** Emitted when user creation is cancelled */
    (e: 'cancel'): void
    /** Emitted when user is successfully created */
    (e: 'created', data: CreateUserInput): void
  }>()

  /** Form data with confirmation password */
  const form = reactive({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    note: '',
  })

  /** Password visibility toggles */
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  /** Watch for initial data changes and populate form */
  watch(
    () => props.initialData,
    newData => {
      if (newData) {
        form.email = newData.email || ''
        form.firstName = newData.firstName || ''
        form.lastName = newData.lastName || ''
        form.password = ''
        form.confirmPassword = ''
        form.note = newData.note || ''
      }
    },
    { immediate: true },
  )

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

    emit('created', cleanData)
  }

  /** Handle cancellation */
  function onCancel () {
    emit('cancel')
  }
</script>
