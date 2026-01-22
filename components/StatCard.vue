<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ value }}</p>
      </div>
      <div :class="`p-3 rounded-lg bg-${color}-50`">
        <UIcon :name="icon" :class="`w-6 h-6 text-${color}-600`" />
      </div>
    </div>
    <div v-if="trend" class="mt-4 flex items-center">
      <UIcon 
        :name="trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
        :class="`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`"
      />
      <span :class="`text-sm ml-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`">
        {{ trend === 'up' ? '+5.2%' : '-2.1%' }}
      </span>
    </div>
  </div>
</template>