<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">رفع ملفات (Manual)</h1>
      <p class="text-gray-600 mt-1">ترفع ملفات من الكمبيوتر/الهاتف إلى المخزن المركزي.</p>
    </div>

    <UCard>
      <div class="grid gap-4">
        <UFormGroup label="Reference (اختياري)">
          <UInput v-model="reference" placeholder="مثال: PROJECT-001 أو INV-2026-0001" />
        </UFormGroup>

        <UFormGroup label="Files">
          <input ref="fileInput" type="file" multiple class="block w-full" @change="onPick" />
          <p class="text-sm text-gray-500 mt-2">يمكن رفع أكثر من ملف دفعة واحدة.</p>
        </UFormGroup>

        <div class="flex items-center gap-2">
          <UButton :loading="uploading" icon="i-heroicons-cloud-arrow-up" @click="upload">رفع</UButton>
          <UButton variant="ghost" @click="clear">مسح</UButton>
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <div v-if="results.length" class="space-y-2">
          <div class="font-medium">تم رفع:</div>
          <ul class="list-disc pl-6">
            <li v-for="r in results" :key="r.id">
              <NuxtLink class="text-blue-600 underline" :to="`/documents/${r.id}`">{{ r.original_name }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const reference = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const uploading = ref(false)
const error = ref('')
const results = ref<any[]>([])

function onPick() {
  error.value = ''
  results.value = []
  files.value = fileInput.value?.files ? Array.from(fileInput.value.files) : []
}

function clear() {
  error.value = ''
  results.value = []
  files.value = []
  if (fileInput.value) fileInput.value.value = ''
}

async function upload() {
  if (!files.value.length) {
    error.value = 'اختر ملف/ملفات أولًا.'
    return
  }

  uploading.value = true
  error.value = ''
  results.value = []

  try {
    const form = new FormData()
    for (const f of files.value) form.append('files', f)
    if (reference.value) form.append('reference', reference.value)

    const r = await $fetch('/api/ingest/manual', {
      method: 'POST',
      body: form
    }) as any

    results.value = r.items || []
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}
</script>
