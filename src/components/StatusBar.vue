<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="status-item">
        <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>最后更新: {{ formattedLastUpdate }}</span>
      </span>
      <span class="status-divider">|</span>
      <span class="status-item">
        <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>数据源: {{ sourceCount }} 个</span>
      </span>
    </div>
    <div class="status-right">
      <span class="countdown" :class="{ 'countdown-warning': countdown <= 30 }">
        <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <span>自动刷新: {{ formattedCountdown }}</span>
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  lastUpdateTime: Date | null
  countdown: number
  sourceCount: number
}>()

const formattedLastUpdate = computed(() => {
  if (!props.lastUpdateTime) return '从未更新'
  return props.lastUpdateTime.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const formattedCountdown = computed(() => {
  const minutes = Math.floor(props.countdown / 60)
  const seconds = props.countdown % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-divider {
  color: var(--border-color);
}

.status-icon {
  width: 14px;
  height: 14px;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: #f1f5f9;
  border-radius: 4px;
}

.countdown-warning {
  background-color: #fef3c7;
  color: #92400e;
}
</style>
