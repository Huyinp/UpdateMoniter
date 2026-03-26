// 平台信息
export interface PlatformInfo {
  name: string
  updateTime: string
  fileSize: number  // 小更新量
  totalSize?: number  // 游戏总大小
  downloadUrl: string
}

// 聚合后的游戏资源
export interface ResourceItem {
  name: string
  category?: string
  platforms: {
    云更新?: PlatformInfo
    易乐游?: PlatformInfo
    顺网科技?: PlatformInfo
  }
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 抓取响应类型
export interface ScrapeResponse {
  success: boolean
  data?: ResourceItem[]
  error?: string
}

// Electron API 类型
export interface ElectronAPI {
  fetchResourceData: (url: string) => Promise<ApiResponse<unknown>>
  scrapeAllResources: (maxPages?: number) => Promise<ScrapeResponse>
}

// 扩展 Window 类型
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
