import puppeteer from 'puppeteer'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

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
  }
}

interface RenderOptions {
  width?: number
  height?: number
  fontSize?: number
  theme?: string
}

export class RenderEngine {
  private browser: any = null

  constructor() {
    this.initBrowser()
  }

  private async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
    } catch (error) {
      console.error('Failed to initialize browser:', error)
    }
  }

  async render(content: string, format: string, theme: string = 'cute', options: RenderOptions = {}): Promise<Buffer> {
    const { width = 800, height = 600, fontSize = 18 } = options
    const themeConfig = THEMES[theme as keyof typeof THEMES] || THEMES.cute

    if (!this.browser) {
      await this.initBrowser()
      if (!this.browser) {
        throw new Error('Browser initialization failed')
      }
    }

    const page = await this.browser.newPage()
    
    try {
      // 设置视口
      await page.setViewport({ width, height })

      // 处理内容
      const processedContent = await this.processContent(content, format)
      
      // 生成HTML页面
      const html = this.generateHTML(processedContent, format, themeConfig, { width, height, fontSize })
      
      // 设置HTML内容
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      // 等待内容渲染
      await page.waitForTimeout(1000)
      
      // 截图
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
        omitBackground: false
      })

      return screenshot as Buffer
    } finally {
      await page.close()
    }
  }

  private async processContent(content: string, format: string): Promise<string> {
    try {
      if (format === 'markdown') {
        // 使用marked处理Markdown
        const html = marked(content, {
          breaks: true,
          gfm: true
        })
        return html
      } else if (format === 'html') {
        // 直接使用HTML内容
        return content
      } else {
        // 纯文本
        return `<p>${content}</p>`
      }
    } catch (error) {
      console.error('Content processing error:', error)
      return `<p>${content}</p>`
    }
  }

  private generateHTML(content: string, format: string, theme: any, options: any): string {
    const { width, height, fontSize } = options
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${format === 'markdown' ? 'Markdown' : format === 'html' ? 'HTML' : 'Text'} Content</title>
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
    }
    
    .title {
      font-size: 26px;
      font-weight: 700;
      color: ${theme.primary};
      text-align: center;
      margin-bottom: 30px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .content {
      font-size: ${fontSize}px;
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
    
    h1 { font-size: ${fontSize + 8}px; }
    h2 { font-size: ${fontSize + 6}px; }
    h3 { font-size: ${fontSize + 4}px; }
    h4 { font-size: ${fontSize + 2}px; }
    
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
      font-size: ${fontSize - 2}px;
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
      font-size: ${fontSize - 2}px;
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
      
      .title {
        font-size: 22px;
      }
      
      .content {
        font-size: ${fontSize - 2}px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">
      ${format === 'markdown' ? 'Markdown' : format === 'html' ? 'HTML' : 'Text'} 内容 ✨
    </div>
    
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

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
} 