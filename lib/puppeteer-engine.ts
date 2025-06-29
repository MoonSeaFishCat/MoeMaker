import puppeteer, { Browser, Page } from 'puppeteer'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// 主题配置
const THEMES = {
  cute: {
    primary: '#ff6b9d',
    secondary: '#ffb3d9',
    background: { start: '#ffeef8', end: '#fff5fa' },
    text: '#2d3748',
    textSecondary: '#718096',
    shadow: '#ff6b9d'
  },
  elegant: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: { start: '#f7fafc', end: '#edf2f7' },
    text: '#2d3748',
    textSecondary: '#718096',
    shadow: '#667eea'
  },
  dark: {
    primary: '#805ad5',
    secondary: '#d53f8c',
    background: { start: '#1a202c', end: '#2d3748' },
    text: '#e2e8f0',
    textSecondary: '#a0aec0',
    shadow: '#805ad5'
  },
  kawaii: {
    primary: '#ff9ecd',
    secondary: '#ffb7dd',
    background: { start: '#fff0f5', end: '#ffeef8' },
    text: '#4a5568',
    textSecondary: '#718096',
    shadow: '#ff9ecd'
  },
  pastel: {
    primary: '#a8e6cf',
    secondary: '#dcedc1',
    background: { start: '#f0fff4', end: '#e6fffa' },
    text: '#2d3748',
    textSecondary: '#718096',
    shadow: '#a8e6cf'
  }
}

export interface PuppeteerEngineOptions {
  width?: number
  height?: number
  format?: 'png' | 'jpeg' | 'webp'
  quality?: number
  fullPage?: boolean
  omitBackground?: boolean
  backgroundImage?: string
}

export interface PuppeteerEngineResult {
  success: boolean
  data?: Buffer
  error?: string
  size?: number
  format?: string
  renderTime?: number
}

interface EngineStatus {
  initialized: boolean
  browserConnected: boolean
  activePages: number
  totalRenders: number
  averageRenderTime: number
  lastError: string | null
}

export class PuppeteerEngine {
  private static instance: PuppeteerEngine
  private browser: Browser | null = null
  private isInitialized = false
  private pagePool: Page[] = []
  private activePages = 0
  private maxPages = 5 // 最大页面池大小
  private totalRenders = 0
  private totalRenderTime = 0
  private lastError: string | null = null
  private initializationPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): PuppeteerEngine {
    if (!PuppeteerEngine.instance) {
      PuppeteerEngine.instance = new PuppeteerEngine()
    }
    return PuppeteerEngine.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // 防止重复初始化
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._initialize()
    return this.initializationPromise
  }

  private async _initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-zygote',
          '--single-process',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list'
        ]
      })

      // 预创建页面池
      for (let i = 0; i < this.maxPages; i++) {
        const page = await this.browser.newPage()
        await page.setViewport({ width: 800, height: 600 })
        this.pagePool.push(page)
      }

      this.isInitialized = true
      console.log('✅ Puppeteer引擎初始化成功，页面池大小:', this.maxPages)
    } catch (error) {
      console.error('❌ Puppeteer引擎初始化失败:', error)
      this.lastError = error instanceof Error ? error.message : '未知错误'
      throw error
    }
  }

  private async getPage(): Promise<Page> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // 从页面池获取页面
    if (this.pagePool.length > 0) {
      const page = this.pagePool.pop()!
      this.activePages++
      return page
    }

    // 如果页面池为空，创建新页面
    if (this.browser) {
      const page = await this.browser.newPage()
      this.activePages++
      return page
    }

    throw new Error('浏览器未初始化')
  }

  private async releasePage(page: Page): Promise<void> {
    try {
      // 清理页面内容
      await page.evaluate(() => {
        document.body.innerHTML = ''
      })

      // 如果页面池未满，放回池中
      if (this.pagePool.length < this.maxPages) {
        this.pagePool.push(page)
      } else {
        await page.close()
      }
    } catch (error) {
      console.error('释放页面失败:', error)
      try {
        await page.close()
      } catch (closeError) {
        console.error('关闭页面失败:', closeError)
      }
    } finally {
      this.activePages--
    }
  }

  private processContent(content: string, format: string): string {
    if (format === 'markdown') {
      // 配置 marked 选项
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
      })
      
      // 解析 Markdown
      const htmlContent = marked.parse(content) as string
      
      // 清理 HTML
      return this.sanitizeHTML(htmlContent)
    } else if (format === 'html') {
      return this.sanitizeHTML(content)
    } else {
      // 纯文本处理
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${this.escapeHtml(line)}</p>`)
        .join('')
    }
  }

  private sanitizeHTML(html: string): string {
    try {
      // 在 Node.js 环境中使用 jsdom
      if (typeof window === 'undefined') {
        const { window } = new JSDOM('<!DOCTYPE html>')
        const purify = DOMPurify(window as any)
        return purify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'mark', 'small', 'del', 'ins',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'blockquote', 'pre', 'code', 'kbd', 'samp', 'var',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
            'a', 'img', 'figure', 'figcaption',
            'div', 'span', 'section', 'article', 'header', 'footer',
            'main', 'aside', 'nav', 'address', 'time'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'width', 'height', 'class', 'id',
            'target', 'rel', 'download', 'type', 'cite', 'datetime'
          ],
          ALLOW_DATA_ATTR: false,
          KEEP_CONTENT: true,
          RETURN_DOM: false,
          RETURN_DOM_FRAGMENT: false,
          RETURN_DOM_IMPORT: false,
          RETURN_TRUSTED_TYPE: false,
          FORCE_BODY: false,
          SANITIZE_DOM: true,
          KEEP_CONTENT: true,
          IN_PLACE: false,
          USE_PROFILES: { html: true }
        })
      } else {
        // 在浏览器环境中直接使用 DOMPurify
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'mark', 'small', 'del', 'ins',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'blockquote', 'pre', 'code', 'kbd', 'samp', 'var',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
            'a', 'img', 'figure', 'figcaption',
            'div', 'span', 'section', 'article', 'header', 'footer',
            'main', 'aside', 'nav', 'address', 'time'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'width', 'height', 'class', 'id',
            'target', 'rel', 'download', 'type', 'cite', 'datetime'
          ]
        })
      }
    } catch (error) {
      console.error('HTML清理失败:', error)
      return this.escapeHtml(html)
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  private generateHTML(content: string, theme: any, options: PuppeteerEngineOptions): string {
    const { width = 800, height = 600, backgroundImage } = options
    
    // 根据内容长度自动调整尺寸
    const contentLength = content.length
    let adjustedWidth = width
    let adjustedHeight = height
    
    if (contentLength > 1000) {
      adjustedHeight = Math.min(1500, height + Math.floor(contentLength / 50))
    }
    if (contentLength > 2000) {
      adjustedWidth = Math.min(1600, width + Math.floor(contentLength / 100))
    }
    
    // 生成背景样式
    let backgroundStyle = `linear-gradient(135deg, ${theme.background.start}, ${theme.background.end})`
    if (backgroundImage) {
      backgroundStyle = `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7)), url('${backgroundImage}')`
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: ${adjustedWidth}px;
            min-height: ${adjustedHeight}px;
            background: ${backgroundStyle};
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 3px solid ${theme.primary};
            position: relative;
            min-height: ${adjustedHeight - 80}px;
            backdrop-filter: blur(10px);
        }

        .content {
            font-size: 18px;
            line-height: 1.6;
            color: ${theme.text};
        }
        
        /* 装饰元素 */
        .decoration {
            position: absolute;
            font-size: 20px;
            color: ${theme.primary};
            opacity: 0.8;
        }
        
        .decoration.top-right { top: 20px; right: 20px; }
        .decoration.bottom-left { bottom: 20px; left: 20px; }
        .decoration.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        
        /* Markdown样式 */
        h1, h2, h3, h4, h5, h6 {
            color: ${theme.primary};
            margin: 20px 0 10px 0;
            font-weight: 700;
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            border-bottom: 2px solid ${theme.primary};
            padding-bottom: 5px;
            border-radius: 0 0 8px 8px;
        }

        h1 { font-size: 26px; }
        h2 { font-size: 24px; }
        h3 { font-size: 22px; }
        h4 { font-size: 20px; }
        
        p {
            margin: 10px 0;
            line-height: 1.6;
        }
        
        blockquote {
            border-left: 4px solid ${theme.primary};
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: ${theme.textSecondary};
            background: rgba(255, 255, 255, 0.5);
            padding: 15px 20px;
            border-radius: 8px;
        }
        
        code {
            background: #f7fafc;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 16px;
            color: ${theme.primary};
            border: 1px solid #e2e8f0;
        }
        
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            border: 1px solid #4a5568;
            position: relative;
        }
        
        pre::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff6b9d, #667eea, #68d391, #f6ad55, #805ad5);
            border-radius: 8px 8px 0 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            border: none;
            color: inherit;
            font-size: 16px;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 5px 0;
        }
        
        strong {
            font-weight: 700;
            color: ${theme.text};
        }

        em {
            font-style: italic;
            color: ${theme.textSecondary};
        }
        
        /* 列表样式 */
        ul li::marker {
            color: ${theme.primary};
        }
        
        ol li::marker {
            color: ${theme.primary};
            font-weight: 600;
        }
        
        /* 表格样式 */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        th {
            background: ${theme.primary};
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background: #f7fafc;
        }
        
        /* 链接样式 */
        a {
            color: ${theme.primary};
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s;
        }
        
        a:hover {
            border-bottom-color: ${theme.primary};
        }
        
        /* 水平线 */
        hr {
            border: none;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${theme.primary}, transparent);
            margin: 30px 0;
        }
        
        /* 图片样式 */
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: block;
            margin: 10px 0;
        }
        
        /* 代码高亮 */
        .hljs {
            background: #2d3748;
            color: #e2e8f0;
        }
        
        .hljs-keyword { color: #ff6b9d; }
        .hljs-string { color: #68d391; }
        .hljs-number { color: #f6ad55; }
        .hljs-comment { color: #a0aec0; }
        .hljs-function { color: #63b3ed; }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            body {
                padding: 20px;
            }
            
            .container {
                padding: 20px;
            }
            
            .content {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            ${content}
        </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decoration top-right">💖</div>
    <div class="decoration bottom-left">🌸</div>
    <div class="decoration center" style="font-size: 40px; opacity: 0.1;">🌟</div>
</body>
</html>`
  }

  async render(html: string, options: PuppeteerEngineOptions = {}): Promise<PuppeteerEngineResult> {
    const startTime = Date.now()
    let page: Page | null = null

    try {
      const {
        width = 800,
        height = 600,
        format = 'png',
        quality = 90,
        fullPage = true,
        omitBackground = false
      } = options

      page = await this.getPage()
      
      // 设置视口
      await page.setViewport({ width, height })

      // 设置HTML内容
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // 等待图片加载
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img')
        return Array.from(images).every(img => img.complete)
      }, { timeout: 10000 }).catch(() => {
        // 如果超时，继续执行
        console.log('图片加载超时，继续渲染')
      })

      // 等待内容渲染（减少等待时间）
      await new Promise(resolve => setTimeout(resolve, 500))

      // 截图
      const screenshot = await page.screenshot({
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
        fullPage,
        omitBackground
      })

      const renderTime = Date.now() - startTime
      this.totalRenders++
      this.totalRenderTime += renderTime

      return {
        success: true,
        data: screenshot as Buffer,
        size: screenshot.length,
        format,
        renderTime
      }

    } catch (error) {
      console.error('Puppeteer渲染错误:', error)
      this.lastError = error instanceof Error ? error.message : '未知错误'
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    } finally {
      if (page) {
        await this.releasePage(page)
      }
    }
  }

  async renderText(
    text: string, 
    theme: string = 'cute', 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    const themeConfig = THEMES[theme as keyof typeof THEMES] || THEMES.cute
    const processedContent = this.processContent(text, 'text')
    const html = this.generateHTML(processedContent, themeConfig, options)
    return this.render(html, options)
  }

  async renderMarkdown(
    markdown: string, 
    theme: string = 'cute', 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    const themeConfig = THEMES[theme as keyof typeof THEMES] || THEMES.cute
    const processedContent = this.processContent(markdown, 'markdown')
    const html = this.generateHTML(processedContent, themeConfig, options)
    return this.render(html, options)
  }

  async renderHTML(
    htmlContent: string, 
    theme: string = 'cute', 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    const themeConfig = THEMES[theme as keyof typeof THEMES] || THEMES.cute
    const processedContent = this.processContent(htmlContent, 'html')
    const html = this.generateHTML(processedContent, themeConfig, options)
    return this.render(html, options)
  }

  async close(): Promise<void> {
    // 关闭所有页面
    for (const page of this.pagePool) {
      try {
        await page.close()
      } catch (error) {
        console.error('关闭页面失败:', error)
      }
    }
    this.pagePool = []

    // 关闭浏览器
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.isInitialized = false
    }
  }

  async getStatus(): Promise<EngineStatus> {
    return {
      initialized: this.isInitialized,
      browserConnected: this.browser !== null && this.browser.isConnected(),
      activePages: this.activePages,
      totalRenders: this.totalRenders,
      averageRenderTime: this.totalRenders > 0 ? this.totalRenderTime / this.totalRenders : 0,
      lastError: this.lastError
    }
  }

  async healthCheck(): Promise<{ status: string; version?: string; error?: string }> {
    try {
      if (!this.browser || !this.isInitialized) {
        await this.initialize()
      }

      const page = await this.getPage()
      const version = await page.evaluate(() => navigator.userAgent)
      await this.releasePage(page)

      return {
        status: 'healthy',
        version: version
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
}

// 导出单例实例
export const puppeteerEngine = PuppeteerEngine.getInstance()
