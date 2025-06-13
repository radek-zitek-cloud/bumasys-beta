<template>
  <v-container>
    <div>
      <div class="mb-8 text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
        <v-img :src="theme.global.current.value.dark ? fulcrumWhite : fulcrumBlack" height="38" class="mx-auto mt-4" />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

import fulcrumWhite from '@/assets/fulcrum-white.png'
import fulcrumBlack from '@/assets/fulcrum-black.png'

const theme = useTheme()
</script>
