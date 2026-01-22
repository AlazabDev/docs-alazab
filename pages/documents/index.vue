<template>
  <div class="space-y-6">
    <div class="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-semibold">المستندات</h1>
        <p class="text-gray-600 mt-1">بحث وعرض وتحميل المستندات المخزنة.</p>
      </div>

      <div class="flex gap-2">
        <UButton to="/upload" icon="i-heroicons-arrow-up-tray">رفع</UButton>
      </div>
    </div>

    <UCard>
      <div class="grid md:grid-cols-4 gap-3">
        <UFormGroup label="المصدر">
          <USelect v-model="source" :options="sourceOptions" />
        </UFormGroup>
        <UFormGroup label="Reference">
          <UInput v-model="reference" placeholder="PROJECT-001" />
        </UFormGroup>
        <UFormGroup label="بحث">
          <UInput v-model="q" placeholder="اسم الملف..." icon="i-heroicons-magnifying-glass" />
        </UFormGroup>
        <div class="flex items-end gap-2">
          <UButton :loading="loading" icon="i-heroicons-arrow-path" @click="load">تحديث</UButton>
          <UButton variant="ghost" @click="reset">مسح</UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <UTable :rows="items" :columns="columns" :loading="loading">
        <template #name-data="{ row }">
          <NuxtLink class="text-blue-600 underline" :to="`/documents/${row.id}`">{{ row.original_name }}</NuxtLink>
        </template>
        <template #actions-data="{ row }">
          <UButton size="xs" icon="i-heroicons-arrow-down-tray" :to="`/api/download/${row.id}`" target="_blank">تحميل</UButton>
        </template>
      </UTable>

      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-500">{{ items.length }} نتيجة (من {{ total }})</div>
        <div class="flex gap-2">
          <UButton size="xs" variant="ghost" :disabled="offset===0" @click="prev">السابق</UButton>
          <UButton size="xs" variant="ghost" :disabled="!hasMore" @click="next">التالي</UButton>
        </div>
      </div>

      <div v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const sourceOptions = [
  { label: 'كل المصادر', value: '' },
  { label: 'Manual', value: 'manual' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Daftra', value: 'daftra' },
  { label: 'MagicPlan', value: 'magicplan' }
]

const source = ref('')
const reference = ref('')
const q = ref('')

const items = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const limit = 50
const offset = ref(0)
const hasMore = ref(false)
const total = ref(0)

const columns = [
  { key: 'created_at', label: 'التاريخ' },
  { key: 'source', label: 'المصدر' },
  { key: 'name', label: 'الملف' },
  { key: 'mime_type', label: 'النوع' },
  { key: 'size_bytes', label: 'الحجم' },
  { key: 'actions', label: '' }
]

function reset() {
  source.value = ''
  reference.value = ''
  q.value = ''
  offset.value = 0
  load()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const r = await $fetch('/api/documents', {
      query: {
        source: source.value || undefined,
        reference: reference.value || undefined,
        q: q.value || undefined,
        limit,
        offset: offset.value
      }
    }) as any

    items.value = r.items || []
    hasMore.value = Boolean(r.hasMore)
    total.value = Number(r.total || 0)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed'
  } finally {
    loading.value = false
  }
}

function next() {
  offset.value += limit
  load()
}

function prev() {
  offset.value = Math.max(0, offset.value - limit)
  load()
}

await load()
</script>
