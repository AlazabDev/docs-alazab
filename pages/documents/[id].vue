<template>
  <div class="space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold">تفاصيل المستند</h1>
        <p class="text-gray-600 mt-1">{{ doc?.original_name }}</p>
      </div>
      <UButton v-if="doc" icon="i-heroicons-arrow-down-tray" :to="`/api/download/${doc.id}`" target="_blank">تحميل</UButton>
    </div>

    <UCard v-if="doc">
      <div class="grid md:grid-cols-2 gap-4">
        <div><span class="font-medium">ID:</span> {{ doc.id }}</div>
        <div><span class="font-medium">Source:</span> {{ doc.source }}</div>
        <div><span class="font-medium">Reference:</span> {{ doc.reference || '-' }}</div>
        <div><span class="font-medium">MIME:</span> {{ doc.mime_type }}</div>
        <div><span class="font-medium">Size:</span> {{ doc.size_bytes }} bytes</div>
        <div><span class="font-medium">Created:</span> {{ doc.created_at }}</div>
        <div class="md:col-span-2"><span class="font-medium">Path:</span> <code class="text-xs">{{ doc.stored_path }}</code></div>
      </div>
    </UCard>

    <div v-else class="text-gray-600">Loading...</div>

    <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const error = ref('')
const doc = ref<any>(null)

try {
  doc.value = await $fetch(`/api/documents/${route.params.id}`)
} catch (e: any) {
  error.value = e?.data?.message || e?.message || 'Not found'
}
</script>
