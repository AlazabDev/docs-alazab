<template>
  <header class="border-b bg-white">
    <div class="mx-auto max-w-7xl p-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="font-semibold">{{ appName }}</div>
        <UBadge color="black" variant="subtle">docs.alazab.com</UBadge>
      </div>

      <nav class="flex items-center gap-2">
        <UButton to="/documents" variant="ghost" icon="i-heroicons-document-text">المستندات</UButton>
        <UButton to="/upload" variant="solid" icon="i-heroicons-arrow-up-tray">رفع ملفات</UButton>
        <UButton v-if="me.hasKey && !me.authenticated" to="/login" variant="ghost" icon="i-heroicons-key">دخول</UButton>
        <UButton v-if="me.hasKey && me.authenticated" :loading="loggingOut" variant="ghost" icon="i-heroicons-arrow-left-on-rectangle" @click="logout">خروج</UButton>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { public: pub } = useRuntimeConfig()
const appName = computed(() => pub.appName || 'Docs')

const me = reactive({ hasKey: false, authenticated: true, publicRead: true })
const loggingOut = ref(false)

onMounted(async () => {
  try {
    const r = await $fetch('/api/auth/me') as any
    me.hasKey = Boolean(r?.hasKey)
    me.authenticated = Boolean(r?.authenticated)
    me.publicRead = Boolean(r?.publicRead)
  } catch {
    me.hasKey = true
    me.authenticated = false
    me.publicRead = false
  }
})

async function logout() {
  loggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  } finally {
    loggingOut.value = false
  }
}
</script>
