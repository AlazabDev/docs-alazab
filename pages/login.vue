<template>
  <div class="max-w-md mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">تسجيل الدخول</h1>
      <p class="text-gray-600 mt-1">أدخل مفتاح الوصول للوصول للنظام.</p>
    </div>

    <UCard>
      <div class="space-y-3">
        <UFormGroup label="API Key">
          <UInput v-model="key" type="password" placeholder="DOCS_API_KEY" />
        </UFormGroup>
        <div class="flex gap-2">
          <UButton :loading="loading" @click="login">دخول</UButton>
          <UButton variant="ghost" to="/documents">تخطي</UButton>
        </div>
        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const key = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { key: key.value } })
    await navigateTo('/documents')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
