import puppeteer, { Browser, Page } from 'puppeteer'

export interface PuppeteerEngineOptions {
  width?: number
  height?: number
  format?: 'png' | 'jpeg' | 'webp'
  quality?: number
  fullPage?: boolean
  omitBackground?: boolean
}

export interface PuppeteerEngineResult {
  success: boolean
  data?: Buffer
  error?: string
  size?: number
  format?: string
}

export class PuppeteerEngine {
  private browser: Browser | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

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
          '--single-process'
        ]
      })
      this.isInitialized = true
      console.log('✅ Puppeteer引擎初始化成功')
    } catch (error) {
      console.error('❌ Puppeteer引擎初始化失败:', error)
      throw error
    }
  }

  async render(html: string, options: PuppeteerEngineOptions = {}): Promise<PuppeteerEngineResult> {
    if (!this.browser || !this.isInitialized) {
      await this.initialize()
    }

    const {
      width = 800,
      height = 600,
      format = 'png',
      quality = 90,
      fullPage = true,
      omitBackground = false
    } = options

    let page: Page | null = null

    try {
      page = await this.browser!.newPage()
      
      // 设置视口
      await page.setViewport({ width, height })

      // 设置HTML内容
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // 等待内容渲染
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 截图
      const screenshot = await page.screenshot({
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
        fullPage,
        omitBackground
      })

      return {
        success: true,
        data: screenshot as Buffer,
        size: screenshot.length,
        format
      }

    } catch (error) {
      console.error('Puppeteer渲染错误:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async renderWithCustomBackground(
    html: string, 
    backgroundImageUrl: string, 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    if (!this.browser || !this.isInitialized) {
      await this.initialize()
    }

    const {
      width = 800,
      height = 600,
      format = 'png',
      quality = 90,
      fullPage = true,
      omitBackground = false
    } = options

    let page: Page | null = null

    try {
      page = await this.browser!.newPage()
      
      // 设置视口
      await page.setViewport({ width, height })

      // 设置HTML内容
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // 等待背景图片加载
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img')
        return Array.from(images).every(img => img.complete)
      }, { timeout: 10000 })

      // 等待内容渲染
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 截图
      const screenshot = await page.screenshot({
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
        fullPage,
        omitBackground
      })

      return {
        success: true,
        data: screenshot as Buffer,
        size: screenshot.length,
        format
      }

    } catch (error) {
      console.error('Puppeteer自定义背景渲染错误:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async renderMarkdown(
    markdown: string, 
    theme: any, 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    const { marked } = await import('marked')
    
    // 处理Markdown内容
    const htmlContent = marked.parse(markdown, {
      breaks: true,
      gfm: true
    }) as string

    // 生成完整HTML
    const html = this.generateHTML(htmlContent, theme, options)
    
    return this.render(html, options)
  }

  async renderHTML(
    htmlContent: string, 
    theme: any, 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    // 生成完整HTML
    const html = this.generateHTML(htmlContent, theme, options)
    
    return this.render(html, options)
  }

  async renderText(
    text: string, 
    theme: any, 
    options: PuppeteerEngineOptions = {}
  ): Promise<PuppeteerEngineResult> {
    // 处理纯文本
    const processedText = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('')

    // 生成完整HTML
    const html = this.generateHTML(processedText, theme, options)
    
    return this.render(html, options)
  }

  private generateHTML(content: string, theme: any, options: PuppeteerEngineOptions): string {
    const { width = 800, height = 600 } = options
    
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
      width: ${width}px;
      min-height: ${height}px;
      background: linear-gradient(135deg, ${theme.background.start}, ${theme.background.end});
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      min-height: ${height - 80}px;
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
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.isInitialized = false
    }
  }

  async healthCheck(): Promise<{ status: string; version?: string; error?: string }> {
    try {
      if (!this.browser || !this.isInitialized) {
        await this.initialize()
      }

      const page = await this.browser!.newPage()
      const version = await page.evaluate(() => navigator.userAgent)
      await page.close()

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
export const puppeteerEngine = new PuppeteerEngine()
