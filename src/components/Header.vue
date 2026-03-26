<template>
  <header class="header">
    <h1 class="title">UpdateMoniter</h1>
    <div class="header-right">
      <span class="subtitle">资源更新监控</span>
      <button 
        class="refresh-btn" 
        :class="{ 'is-loading': isRefreshing }"
        :disabled="isRefreshing"
        @click="$emit('refresh')"
      >
        <svg v-if="!isRefreshing" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <svg v-else class="icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
        <span>{{ isRefreshing ? '刷新中...' : '刷新' }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  isRefreshing: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 150ms ease-out;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-btn.is-loading {
  background-color: #1d4ed8;
}

.icon {
  width: 16px;
  height: 16px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
