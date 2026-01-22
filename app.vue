<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// إعدادات عالمية
useHead({
  titleTemplate: '%s - Alazab Docs Repository',
  htmlAttrs: {
    lang: 'ar',
    dir: 'rtl'
  },
  bodyAttrs: {
    class: 'min-h-screen bg-gray-50'
  }
})
</script>