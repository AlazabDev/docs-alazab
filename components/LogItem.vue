<template>
  <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded">
    <div class="flex-shrink-0">
      <div 
        class="w-2 h-2 rounded-full mt-2"
        :class="{
          'bg-green-500': log.level === 'info',
          'bg-yellow-500': log.level === 'warning',
          'bg-red-500': log.level === 'error'
        }"
      />
    </div>
    <div class="flex-1">
      <p class="text-sm text-gray-900">{{ log.message }}</p>
      <p class="text-xs text-gray-500 mt-1">{{ formatTime(log.timestamp) }}</p>
    </div>
  </div>
</template>