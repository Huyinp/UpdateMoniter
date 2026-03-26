import axios from 'axios'
import * as cheerio from 'cheerio'

export interface GameResource {
  name: string
  platform: string
  category: string
  version: string
  updateTime: string
  fileSize: number
  downloadUrl: string
  source: string
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
  
  // Try to parse as plain number (assume MB)
  const num = parseFloat(sizeStr)
  return isNaN(num) ? 0 : num
}

// Helper to normalize date
function normalizeDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()
  
  // Already has time
  if (dateStr.includes(':')) {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  }
  
  // Try parsing date-only strings like "2026-03-25"
  const date = new Date(dateStr + ' 00:00:00')
  if (!isNaN(date.getTime())) {
    return date.toISOString()
  }
  
  return new Date().toISOString()
}

// Scrape yungengxin.com
async function scrapeYungengxin(maxPages: number = 10): Promise<GameResource[]> {
  const resources: GameResource[] = []
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = page === 1 
        ? 'https://yungengxin.com/game/update' 
        : `https://yungengxin.com/game/update?page=${page}`
      
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      
      // Find the game table
      let foundData = false
      let rowCount = 0
      
      $('#container table tbody tr').each((_, elem) => {
        const cells = $(elem).find('td')
        if (cells.length >= 5) {
          const name = $(cells[0]).text().trim()
          const category = $(cells[1]).text().trim()
          const size = $(cells[2]).text().trim()
          const updateAmount = $(cells[3]).text().trim()
          const time = $(cells[4]).text().trim()
          
          if (name && name !== '游戏名称' && name.length > 0) {
            foundData = true
            rowCount++
            const link = $(cells[0]).find('a').attr('href') || ''
            
            resources.push({
              name,
              platform: 'Windows',
              category,
              version: updateAmount || '-',
              updateTime: normalizeDate(time),
              fileSize: parseSizeToMB(size),
              downloadUrl: link.startsWith('http') ? link : `https://yungengxin.com${link}`,
              source: '云更新'
            })
          }
        }
      })
      
      console.log(`yungengxin page ${page}: found ${rowCount} items`)
      
      if (!foundData || rowCount === 0) {
        console.log(`yungengxin page ${page} - no more data`)
        break
      }
    } catch (error) {
      console.error(`Error scraping yungengxin page ${page}:`, (error as Error).message)
      break
    }
  }
  
  return resources
}

// Scrape yileyoo.com
async function scrapeYileyoo(maxPages: number = 10): Promise<GameResource[]> {
  const resources: GameResource[] = []
  
  // Get today's date for the URL
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      
      let foundData = false
      let rowCount = 0
      
      // Find the game table - try multiple selectors
      $('table tbody tr').each((_, elem) => {
        const cells = $(elem).find('td')
        if (cells.length >= 4) {
          const name = $(cells[0]).text().trim()
          const category = $(cells[1]).text().trim()
          const updateType = $(cells[2]).text().trim()
          const antivirus = $(cells[3]).text().trim()
          const time = $(cells[4])?.text()?.trim() || ''
          
          if (name && !name.includes('游戏名称') && name.length > 0) {
            foundData = true
            rowCount++
            const link = $(cells[0]).find('a').attr('href') || ''
            
            resources.push({
              name,
              platform: 'Windows',
              category: `${category} / ${updateType}`,
              version: antivirus || '-',
              updateTime: normalizeDate(time),
              fileSize: 0,
              downloadUrl: link.startsWith('http') ? link : `https://www.yileyoo.com${link}`,
              source: '易乐游'
            })
          }
        }
      })
      
      console.log(`yileyoo page ${page}: found ${rowCount} items`)
      
      if (!foundData || rowCount === 0) {
        console.log(`yileyoo page ${page} - no more data`)
        break
      }
    } catch (error) {
      console.error(`Error scraping yileyoo page ${page}:`, (error as Error).message)
      break
    }
  }
  
  return resources
}

// Scrape icafe8.com
async function scrapeIcafe8(maxPages: number = 10): Promise<GameResource[]> {
  const resources: GameResource[] = []
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = page === 1 
        ? 'https://www.icafe8.com/resource/page' 
        : `https://www.icafe8.com/resource/page?page=${page}`
      
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      
      let foundData = false
      let rowCount = 0
      
      // Find game table - try multiple selectors
      $('.update-list tbody tr, .game-list tbody tr').each((_, elem) => {
        const cells = $(elem).find('td')
        if (cells.length >= 3) {
          const name = $(cells[0]).text().trim()
          const category = $(cells[1]).text().trim()
          const size = $(cells[2])?.text()?.trim() || ''
          
          if (name && !name.includes('游戏名称') && name.length > 0) {
            foundData = true
            rowCount++
            const link = $(cells[0]).find('a').attr('href') || ''
            
            resources.push({
              name,
              platform: 'Windows',
              category,
              version: '-',
              updateTime: new Date().toISOString(),
              fileSize: parseSizeToMB(size),
              downloadUrl: link.startsWith('http') ? link : `https://www.icafe8.com${link}`,
              source: '顺网科技'
            })
          }
        }
      })
      
      console.log(`icafe8 page ${page}: found ${rowCount} items`)
      
      if (!foundData || rowCount === 0) {
        console.log(`icafe8 page ${page} - no more data`)
        break
      }
    } catch (error) {
      console.error(`Error scraping icafe8 page ${page}:`, (error as Error).message)
      break
    }
  }
  
  return resources
}

// Main function to scrape all sources
export async function scrapeAllResources(maxPagesPerSource: number = 10): Promise<GameResource[]> {
  console.log('===========================================')
  console.log('Starting to scrape game resources...')
  console.log('===========================================')
  
  const allResources: GameResource[] = []
  
  try {
    console.log('\n--- Scraping 云更新 (yungengxin.com) ---')
    const yungengxinData = await scrapeYungengxin(maxPagesPerSource)
    allResources.push(...yungengxinData)
    console.log(`Total from 云更新: ${yungengxinData.length}`)
  } catch (e) {
    console.error('Failed to scrape yungengxin:', e)
  }
  
  try {
    console.log('\n--- Scraping 易乐游 (yileyoo.com) ---')
    const yileyooData = await scrapeYileyoo(maxPagesPerSource)
    allResources.push(...yileyooData)
    console.log(`Total from 易乐游: ${yileyooData.length}`)
  } catch (e) {
    console.error('Failed to scrape yileyoo:', e)
  }
  
  try {
    console.log('\n--- Scraping 顺网科技 (icafe8.com) ---')
    const icafe8Data = await scrapeIcafe8(maxPagesPerSource)
    allResources.push(...icafe8Data)
    console.log(`Total from 顺网科技: ${icafe8Data.length}`)
  } catch (e) {
    console.error('Failed to scrape icafe8:', e)
  }
  
  console.log('\n===========================================')
  console.log(`Total resources collected: ${allResources.length}`)
  console.log('===========================================')
  
  return allResources
}

export { scrapeYungengxin, scrapeYileyoo, scrapeIcafe8 }
