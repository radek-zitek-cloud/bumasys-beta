<template>
  <v-container>
    <div>
      <div class="mb-8 text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
        <v-img
          class="mx-auto mt-4"
          height="38"
          :src="theme.global.current.value.dark ? fulcrumWhite : fulcrumBlack"
        />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { useTheme } from 'vuetify'

  import fulcrumBlack from '@/assets/fulcrum-black.png'
  import fulcrumWhite from '@/assets/fulcrum-white.png'

  const theme = useTheme()
</script>
