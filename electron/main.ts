import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'

// 禁用 GPU 加速（某些环境需要）
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

// 平台信息类型
interface PlatformInfo {
  name: string
  updateTime: string
  fileSize: number
  totalSize?: number  // 游戏总大小
  downloadUrl: string
}

// 聚合后的游戏资源类型
interface GameResource {
  name: string
  category: string
  platforms: {
    云更新?: PlatformInfo
    易乐游?: PlatformInfo
    顺网科技?: PlatformInfo
  }
}

// Helper to parse file size string to MB
function parseSizeToMB(sizeStr: string): number {
  if (!sizeStr) return 0
  sizeStr = sizeStr.trim().toUpperCase()
  
  const gbMatch = sizeStr.match(/([\d.]+)\s*GB/i)
  if (gbMatch) {
    return parseFloat(gbMatch[1]) * 1024
  }
  
  const mbMatch = sizeStr.match(/([\d.]+)\s*MB/i)
  if (mbMatch) {
    return parseFloat(mbMatch[1])
  }
  
  const kbMatch = sizeStr.match(/([\d.]+)\s*KB/i)
  if (kbMatch) {
    return parseFloat(kbMatch[1]) / 1024
  }
  
  const num = parseFloat(sizeStr)
  return isNaN(num) ? 0 : num
}

// Helper to normalize date
function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()
  
  if (dateStr.includes(':')) {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  }
  
  const date = new Date(dateStr + ' 00:00:00')
  if (!isNaN(date.getTime())) {
    return date.toISOString()
  }
  
  return new Date().toISOString()
}

// 临时存储抓取结果
let scrapeResults: {
  云更新: Map<string, PlatformInfo>,
  易乐游: Map<string, PlatformInfo>,
  顺网科技: Map<string, PlatformInfo>
} = {
  云更新: new Map(),
  易乐游: new Map(),
  顺网科技: new Map()
}

// Scrape yungengxin.com
async function scrapeYungengxin(maxPages: number = 10): Promise<void> {
  scrapeResults['云更新'].clear()
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = page === 1 
        ? 'https://yungengxin.com/game/update' 
        : `https://yungengxin.com/game/update?page=${page}`
      
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      let foundData = false
      let rowCount = 0
      
      $('.new-update-table tbody tr').each((_, elem) => {
        const cells = $(elem).find('td')
        if (cells.length >= 5) {
          const name = $(cells[0]).text().trim()
          const totalSize = $(cells[2]).text().trim()  // 游戏大小
          const updateSize = $(cells[3]).text().trim()  // 更新量
          const time = $(cells[4]).text().trim()
          
          if (name && name !== '游戏名称' && name.length > 0) {
            foundData = true
            rowCount++
            const link = $(cells[0]).find('a').attr('href') || ''
            
            scrapeResults['云更新'].set(name, {
              name: '云更新',
              updateTime: normalizeDate(time),
              fileSize: parseSizeToMB(updateSize),
              totalSize: parseSizeToMB(totalSize),
              downloadUrl: link.startsWith('http') ? link : `https://yungengxin.com${link}`
            })
          }
        }
      })
      
      console.log(`yungengxin page ${page}: found ${rowCount} items`)
      
      if (!foundData || rowCount === 0) break
    } catch (error) {
      console.error(`Error scraping yungengxin page ${page}:`, (error as Error).message)
      break
    }
  }
}

// Scrape yileyoo.com
async function scrapeYileyoo(maxPages: number = 10): Promise<void> {
  scrapeResults['易乐游'].clear()
  
  const today = new Date()
  const dtime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = page === 1 
        ? `https://www.yileyoo.com/game/list` 
        : `https://www.yileyoo.com/game/list?dtime=${dtime}&page=${page}`
      
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      let foundData = false
      let rowCount = 0
      
      $('.table-upDateList tbody tr').each((_, elem) => {
        const cells = $(elem).find('td')
        if (cells.length >= 4) {
          const name = $(cells[0]).text().trim()
          const time = $(cells[4])?.text()?.trim() || ''
          
          if (name && !name.includes('游戏名称') && name.length > 0) {
            foundData = true
            rowCount++
            const link = $(cells[0]).find('a').attr('href') || ''
            
            scrapeResults['易乐游'].set(name, {
              name: '易乐游',
              updateTime: normalizeDate(time),
              fileSize: 0,
              downloadUrl: link.startsWith('http') ? link : `https://www.yileyoo.com${link}`
            })
          }
        }
      })
      
      console.log(`yileyoo page ${page}: found ${rowCount} items`)
      
      if (!foundData || rowCount === 0) break
    } catch (error) {
      console.error(`Error scraping yileyoo page ${page}:`, (error as Error).message)
      break
    }
  }
}

// Scrape icafe8.com - 使用 JSON API
async function scrapeIcafe8(maxPages: number = 10): Promise<void> {
  scrapeResults['顺网科技'].clear()
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = `https://home.icafe8.com/resource/queryResourcePage?pageSize=20&pageNum=${page}&resourceName=`
      
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      })
      
      const result = response.data
      
      // 检查返回的数据格式
      let rowCount = 0
      
      // 数据在 result.data.list 中
      if (result && result.success && result.data && result.data.list && Array.isArray(result.data.list)) {
        for (const item of result.data.list) {
          const name = item.resourceName || ''
          const updateSize = item.updateSize || 0  // 更新大小
          const pkgSize = item.pkgSize || 0  // 游戏总大小（字节）
          let updateTime = item.updateTime || ''  // 时间格式：HH:MM:SS
          
          if (name && name.length > 0) {
            rowCount++
            
            // 转换文件大小（原始值*1024转MB）
            const fileSizeMB = (updateSize * 1024) / 1024 / 1024
            const totalSizeMB = (pkgSize * 1024) / 1024 / 1024
            
            // 处理时间：只有 HH:MM:SS 格式，需要加上今天的日期
            if (updateTime && updateTime.includes(':')) {
              const today = new Date()
              const [hours, minutes, seconds] = updateTime.split(':')
              updateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${hours}:${minutes}:${seconds}`
            }
            
            scrapeResults['顺网科技'].set(name, {
              name: '顺网科技',
              updateTime: normalizeDate(updateTime),
              fileSize: Math.round(fileSizeMB * 100) / 100,
              totalSize: Math.round(totalSizeMB * 100) / 100,
              downloadUrl: ''
            })
          }
        }
      }
      
      console.log(`顺网科技 page ${page}: found ${rowCount} items`)
      
      // 如果没有数据了，停止
      if (rowCount === 0) break
        
      // 如果返回数据少于一页，也停止
      if (result && result.data && result.data.list && result.data.list.length < 20) break
    } catch (error) {
      console.error(`Error scraping 顺网科技 page ${page}:`, (error as Error).message)
      break
    }
  }
}

// IPC 处理器 - 抓取所有资源数据
ipcMain.handle('scrape-all-resources', async (_event, maxPages: number = 10) => {
  console.log('===========================================')
  console.log('Starting to scrape game resources...')
  console.log('===========================================')
  
  try {
    console.log('\n--- Scraping 云更新 (yungengxin.com) ---')
    await scrapeYungengxin(maxPages)
    console.log(`Total from 云更新: ${scrapeResults['云更新'].size}`)
  } catch (e) {
    console.error('Failed to scrape yungengxin:', e)
  }
  
  try {
    console.log('\n--- Scraping 易乐游 (yileyoo.com) ---')
    await scrapeYileyoo(maxPages)
    console.log(`Total from 易乐游: ${scrapeResults['易乐游'].size}`)
  } catch (e) {
    console.error('Failed to scrape yileyoo:', e)
  }
  
  try {
    console.log('\n--- Scraping 顺网科技 (icafe8.com) ---')
    await scrapeIcafe8(maxPages)
    console.log(`Total from 顺网科技: ${scrapeResults['顺网科技'].size}`)
  } catch (e) {
    console.error('Failed to scrape icafe8:', e)
  }
  
  // 按游戏名称聚合
  const gameMap = new Map<string, GameResource>()
  
  // 合并云更新
  for (const [name, info] of scrapeResults['云更新']) {
    if (!gameMap.has(name)) {
      gameMap.set(name, { name, category: '', platforms: {} })
    }
    gameMap.get(name)!.platforms['云更新'] = info
  }
  
  // 合并易乐游
  for (const [name, info] of scrapeResults['易乐游']) {
    if (!gameMap.has(name)) {
      gameMap.set(name, { name, category: '', platforms: {} })
    }
    gameMap.get(name)!.platforms['易乐游'] = info
  }
  
  // 合并顺网科技
  for (const [name, info] of scrapeResults['顺网科技']) {
    if (!gameMap.has(name)) {
      gameMap.set(name, { name, category: '', platforms: {} })
    }
    gameMap.get(name)!.platforms['顺网科技'] = info
  }
  
  const allResources = Array.from(gameMap.values())
  
  console.log('\n===========================================')
  console.log(`Total unique games: ${allResources.length}`)
  console.log('===========================================')
  
  return { success: true, data: allResources }
})

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: 'UpdateMoniter - 资源更新监控',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 开发环境加载本地服务
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 应用就绪
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 窗口全部关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
