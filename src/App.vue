<template>
  <div class="app">
    <Header 
      :is-refreshing="isRefreshing" 
      @refresh="handleRefresh" 
    />
    <main class="main-content">
      <ResourceTable :resources="resources" :platform-counts="platformCounts" />
    </main>
    <StatusBar 
      :last-update-time="lastUpdateTime" 
      :countdown="countdown" 
      :source-count="sources.length"
    />
    <Loading v-if="isRefreshing" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import ResourceTable from './components/ResourceTable.vue'
import StatusBar from './components/StatusBar.vue'
import Loading from './components/Loading.vue'
import type { ResourceItem } from './types'

// 数据源列表
const sources = [
  { name: '云更新', url: 'https://yungengxin.com/game/update' },
  { name: '易乐游', url: 'https://www.yileyoo.com/game/list' },
  { name: '顺网科技', url: 'https://www.icafe8.com/resource/page' }
]

const resources = ref<ResourceItem[]>([])
const isRefreshing = ref(false)
const lastUpdateTime = ref<Date | null>(null)
const countdown = ref(300) // 5分钟 = 300秒

// 计算每个平台的游戏数量
const platformCounts = computed(() => {
  const counts: Record<string, number> = {
    '云更新': 0,
    '易乐游': 0,
    '顺网科技': 0
  }
  for (const game of resources.value) {
    if (game.platforms['云更新']) counts['云更新']++
    if (game.platforms['易乐游']) counts['易乐游']++
    if (game.platforms['顺网科技']) counts['顺网科技']++
  }
  return counts
})

let countdownTimer: ReturnType<typeof setInterval> | null = null
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

// 刷新数据 - 调用 Electron 主进程进行抓取
async function refreshData() {
  isRefreshing.value = true
  countdown.value = 300 // 重置倒计时
  
  try {
    // 调用 Electron API 抓取数据
    const result = await window.electronAPI.scrapeAllResources(10)
    
    if (result.success && result.data) {
      resources.value = result.data
    } else {
      console.error('Failed to scrape resources:', result.error)
    }
    
    lastUpdateTime.value = new Date()
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 手动刷新
function handleRefresh() {
  if (isRefreshing.value) return
  refreshData()
}

// 倒计时更新
function updateCountdown() {
  if (countdown.value > 0) {
    countdown.value--
  } else {
    countdown.value = 300
  }
}

onMounted(() => {
  refreshData()
  
  // 启动倒计时
  countdownTimer = setInterval(updateCountdown, 1000)
  
  // 自动刷新
  autoRefreshTimer = setInterval(() => {
    refreshData()
  }, 5 * 60 * 1000) // 5分钟
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (autoRefreshTimer) clearInterval(autoRefreshTimer)
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color);
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
