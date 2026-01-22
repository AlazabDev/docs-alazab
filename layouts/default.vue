<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="mx-auto max-w-7xl p-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>
