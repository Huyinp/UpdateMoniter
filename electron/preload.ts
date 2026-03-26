import { contextBridge, ipcRenderer } from 'electron'

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  fetchResourceData: (url: string) => ipcRenderer.invoke('fetch-resource-data', url),
  scrapeAllResources: (maxPages?: number) => ipcRenderer.invoke('scrape-all-resources', maxPages)
})
