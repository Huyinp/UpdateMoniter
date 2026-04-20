<template>
  <div class="table-wrapper">
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchKeyword" 
        placeholder="搜索游戏名称..." 
        class="search-input"
      />
    </div>
    <div class="table-container">
      <table class="resource-table">
        <thead>
          <tr>
            <th class="game-col">游戏名称</th>
            <th colspan="3" class="platform-header">云更新 ({{ platformCounts['云更新'] }})</th>
            <th colspan="1" class="platform-header">易乐游 ({{ platformCounts['易乐游'] }})</th>
            <th colspan="3" class="platform-header">顺网科技 ({{ platformCounts['顺网科技'] }})</th>
          </tr>
          <tr class="sub-header">
            <th></th>
            <th>更新时间</th>
            <th>小更新量</th>
            <th>总大小</th>
            <th>更新时间</th>
            <th>更新时间</th>
            <th>小更新量</th>
            <th>总大小</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(game, index) in filteredResources" :key="index">
            <!-- 游戏名称 -->
            <td class="name-cell">
              {{ game.name }}
            </td>
            
            <!-- 云更新 -->
            <td class="time-cell platform-yun">{{ formatTime(game.platforms['云更新']?.updateTime) }}</td>
            <td class="size-cell platform-yun">{{ formatSize(game.platforms['云更新']?.fileSize) }}</td>
            <td class="size-cell platform-yun">{{ formatSize(game.platforms['云更新']?.totalSize) }}</td>
            
            <!-- 易乐游 -->
            <td class="time-cell platform-yile">{{ formatTime(game.platforms['易乐游']?.updateTime) }}</td>
            
            <!-- 顺网科技 -->
            <td class="time-cell platform-shun">{{ formatTime(game.platforms['顺网科技']?.updateTime) }}</td>
            <td class="size-cell platform-shun">{{ formatSize(game.platforms['顺网科技']?.fileSize) }}</td>
            <td class="size-cell platform-shun">{{ formatSize(game.platforms['顺网科技']?.totalSize) }}</td>
          </tr>
          <tr v-if="filteredResources.length === 0">
            <td colspan="8" class="empty-row">
              <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <span>{{ searchKeyword ? '未找到匹配的游戏' : '暂无数据' }}</span>
                <span class="empty-hint">{{ searchKeyword ? '请尝试其他关键词' : '点击右上角刷新按钮获取最新数据' }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ResourceItem } from '../types'

const props = defineProps<{
  resources: ResourceItem[]
  platformCounts: Record<string, number>
}>()

const searchKeyword = ref('')

// 按顺网更新时间倒序排序，并支持搜索过滤
const filteredResources = computed(() => {
  let result = [...props.resources]
  
  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(game => 
      game.name.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  return result.sort((a, b) => {
    const timeA = a.platforms['顺网科技']?.updateTime || ''
    const timeB = b.platforms['顺网科技']?.updateTime || ''
    if (!timeA && !timeB) return a.name.localeCompare(b.name, 'zh-CN')
    if (!timeA) return 1
    if (!timeB) return -1
    return new Date(timeB).getTime() - new Date(timeA).getTime()
  })
})

function formatTime(isoString: string | undefined): string {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatSize(sizeMB: number | undefined): string {
  if (!sizeMB || sizeMB === 0) return '-'
  if (sizeMB >= 1024) {
    return `${(sizeMB / 1024).toFixed(1)} GB`
  }
  return `${sizeMB.toFixed(1)} MB`
}
</script>

<style scoped>
.table-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-bar {
  padding: 12px 16px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 150ms ease;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-input::placeholder {
  color: #94a3b8;
}

.table-container {
  flex: 1;
  overflow: auto;
  background-color: var(--card-bg);
  border-radius: 0 0 8px 8px;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.resource-table th,
.resource-table td {
  padding: 8px 10px;
  text-align: center;
  font-size: 12px;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

.resource-table th:last-child,
.resource-table td:last-child {
  border-right: none;
}

.resource-table thead th {
  background-color: #f1f5f9;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.platform-header {
  background-color: #e0e7ff !important;
  color: #3730a3 !important;
}

.sub-header th {
  background-color: #f8fafc !important;
  font-size: 11px;
  font-weight: 500;
}

.sub-header th:nth-child(2),
.sub-header th:nth-child(3),
.sub-header th:nth-child(4) {
  background-color: #dbeafe !important;
}

.sub-header th:nth-child(5) {
  background-color: #fef3c7 !important;
}

.sub-header th:nth-child(6),
.sub-header th:nth-child(7),
.sub-header th:nth-child(8) {
  background-color: #dcfce7 !important;
}

.game-col {
  text-align: left !important;
  width: 150px;
}

.resource-table tbody tr:hover {
  background-color: #f8fafc;
}

.name-cell {
  text-align: left !important;
  font-weight: 500;
  color: var(--text-primary);
  padding-left: 12px !important;
}

.time-cell {
  color: var(--text-secondary);
  white-space: nowrap;
}

.platform-yun {
  background-color: #eff6ff;
}

.platform-yile {
  background-color: #fffbeb;
}

.platform-shun {
  background-color: #f0fdf4;
}

.size-cell {
  font-family: var(--font-mono);
  color: var(--text-secondary);
  white-space: nowrap;
}

.empty-row {
  text-align: center;
  padding: 48px 16px !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.empty-icon {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
