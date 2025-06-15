<!--
  @fileoverview Error Boundary Component

  This component provides error boundary functionality for Vue 3 applications.
  It catches JavaScript errors anywhere in the child component tree and
  displays a fallback UI instead of crashing the entire application.

  Features:
  - Catches and displays unhandled errors in child components
  - Provides user-friendly error messages
  - Offers retry functionality for transient errors
  - Logs errors for debugging and monitoring
  - Customizable fallback UI
  - Error reporting to external services (optional)

  Usage:
  ```vue
  <ErrorBoundary @error="handleError">
    <SomeComponent />
  </ErrorBoundary>
  ```

  Advanced Usage:
  ```vue
  <ErrorBoundary
    :show-details="isDevelopment"
    :allow-retry="true"
    fallback-title="Something went wrong"
    @error="reportError"
    @retry="handleRetry"
  >
    <ComplexComponent />
  </ErrorBoundary>
  ```

  TODO: Add integration with error monitoring services (Sentry, Bugsnag)
  TODO: Implement error boundary context for nested boundaries
  TODO: Add error categorization and custom handling per error type
  TODO: Create error recovery strategies for specific error patterns
  TODO: Add user feedback collection for error reports
-->

<template>
  <div>
    <!-- Error state -->
    <v-card v-if="hasError" class="error-boundary" color="error" variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-alert-circle</v-icon>
        {{ fallbackTitle }}
      </v-card-title>

      <v-card-text>
        <p class="mb-3">{{ fallbackMessage }}</p>

        <!-- Error details (development mode) -->
        <v-expansion-panels v-if="showDetails && error" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-bug</v-icon>
              Error Details
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-code class="error-details">
                <pre>{{ errorDetails }}</pre>
              </v-code>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="allowRetry"
          color="primary"
          variant="text"
          @click="retry"
        >
          <v-icon class="mr-2">mdi-refresh</v-icon>
          Try Again
        </v-btn>
        <v-btn
          color="error"
          variant="text"
          @click="reportIssue"
        >
          <v-icon class="mr-2">mdi-bug-outline</v-icon>
          Report Issue
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Normal content -->
    <div v-else ref="contentRef">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview Error Boundary Script
 *
 * Implements error boundary functionality for Vue 3 using error handling
 * and component lifecycle management. Provides graceful error recovery
 * and user-friendly error reporting.
 */

  import { computed, nextTick, onErrorCaptured, onMounted, onUnmounted, readonly, ref } from 'vue'

  /**
   * Component props interface
   */
  interface Props {
    /** Title to display in error state */
    fallbackTitle?: string
    /** Message to display in error state */
    fallbackMessage?: string
    /** Whether to show detailed error information */
    showDetails?: boolean
    /** Whether to allow retry functionality */
    allowRetry?: boolean
    /** Maximum number of retry attempts */
    maxRetries?: number
  }

  /**
   * Component events interface
   */
  interface Emits {
    /** Emitted when an error is caught */
    (e: 'error', error: Error, errorInfo: any): void
    /** Emitted when user clicks retry */
    (e: 'retry', attempt: number): void
    /** Emitted when user reports an issue */
    (e: 'report', error: Error): void
  }

  const props = withDefaults(defineProps<Props>(), {
    fallbackTitle: 'Something went wrong',
    fallbackMessage: 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.',
    showDetails: false,
    allowRetry: true,
    maxRetries: 3,
  })

  const emit = defineEmits<Emits>()

  /** Error state management */
  const hasError = ref(false)
  const error = ref<Error | null>(null)
  const errorInfo = ref<any>(null)
  const retryCount = ref(0)

  /** Content container reference */
  const contentRef = ref<HTMLElement>()

  /**
   * Computed error details for display
   */
  const errorDetails = computed(() => {
    if (!error.value) return ''

    return {
      message: error.value.message,
      stack: error.value.stack,
      name: error.value.name,
      retryCount: retryCount.value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
  })

  /**
   * Capture errors from child components
   */
  onErrorCaptured((err: Error, info: any) => {
    console.error('Error boundary caught error:', err, info)

    // Set error state
    hasError.value = true
    error.value = err
    errorInfo.value = info

    // Emit error event
    emit('error', err, info)

    // Prevent error from propagating further
    return false
  })

  /**
   * Handle global unhandled errors within this boundary
   */
  const handleGlobalError = (event: ErrorEvent) => {
    if (contentRef.value?.contains(event.target as Node)) {
      const errorObj = new Error(event.message)
      errorObj.stack = `${event.filename}:${event.lineno}:${event.colno}`

      hasError.value = true
      error.value = errorObj
      emit('error', errorObj, { type: 'global', event })
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const errorObj = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    hasError.value = true
    error.value = errorObj
    emit('error', errorObj, { type: 'promise', event })
  }

  /**
   * Retry functionality
   */
  const retry = async () => {
    if (retryCount.value >= props.maxRetries) {
      console.warn('Maximum retry attempts reached')
      return
    }

    retryCount.value++
    emit('retry', retryCount.value)

    // Reset error state
    hasError.value = false
    error.value = null
    errorInfo.value = null

    // Wait for next tick to allow component to re-render
    await nextTick()
  }

  /**
   * Report issue functionality
   */
  const reportIssue = () => {
    if (error.value) {
      emit('report', error.value)

      // Optional: Open email client with error details
      const subject = encodeURIComponent('Error Report: ' + error.value.message)
      const body = encodeURIComponent(`
Error Details:
${JSON.stringify(errorDetails.value, null, 2)}

Please describe what you were doing when this error occurred:

`)
      const mailtoLink = `mailto:support@example.com?subject=${subject}&body=${body}`
      window.open(mailtoLink)
    }
  }

  /**
   * Setup global error handlers
   */
  onMounted(() => {
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
  })

  /**
   * Cleanup global error handlers
   */
  onUnmounted(() => {
    window.removeEventListener('error', handleGlobalError)
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  })

  /**
   * Reset error state (for parent components)
   */
  const reset = () => {
    hasError.value = false
    error.value = null
    errorInfo.value = null
    retryCount.value = 0
  }

  /**
   * Expose methods for parent components
   */
  defineExpose({
    reset,
    hasError: readonly(hasError),
    error: readonly(error),
  })
</script>

<style scoped>
.error-boundary {
  margin: 16px 0;
}

.error-details {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.error-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
