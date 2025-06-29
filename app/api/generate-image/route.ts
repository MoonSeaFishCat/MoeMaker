import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

const THEMES = {
  cute: {
    primary: '#ff6b9d',
    secondary: '#ffb3d9',
    background: { start: '#ffeef8', end: '#fff5fa' },
    text: '#2d3748',
    textSecondary: '#718096'
  },
  elegant: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: { start: '#f7fafc', end: '#edf2f7' },
    text: '#2d3748',
    textSecondary: '#718096'
  },
  dark: {
    primary: '#805ad5',
    secondary: '#d53f8c',
    background: { start: '#1a202c', end: '#2d3748' },
    text: '#e2e8f0',
    textSecondary: '#a0aec0'
  },
  fresh: {
    primary: '#38b2ac',
    secondary: '#4fd1c7',
    background: { start: '#f0fff4', end: '#e6fffa' },
    text: '#2d3748',
    textSecondary: '#718096'
  },
  warm: {
    primary: '#ed8936',
    secondary: '#f6ad55',
    background: { start: '#fffaf0', end: '#fef5e7' },
    text: '#2d3748',
    textSecondary: '#718096'
  },
  ocean: {
    primary: '#3182ce',
    secondary: '#63b3ed',
    background: { start: '#ebf8ff', end: '#bee3f8' },
    text: '#2d3748',
    textSecondary: '#718096'
  }
}

// 简单的代码高亮函数
function highlightCode(code: string, language: string): string {
  // 转义HTML字符
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  
  const escapedCode = escapeHtml(code)
  
  // 根据语言添加基本的高亮
  if (language === 'javascript' || language === 'js') {
    return escapedCode
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|try|catch|finally|switch|case|break|continue|throw|new|delete|typeof|instanceof|in|of|this|super|extends|static|get|set)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(console|log|error|warn|info|Math|Date|Array|Object|String|Number|Boolean|Promise|JSON|parse|stringify)\b/g, '<span class="function">$1</span>')
      .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="literal">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
      .replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>')
      .replace(/`([^`]*)`/g, '<span class="string">`$1`</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>')
      .replace(/\/\/(.*)$/gm, '<span class="comment">//$1</span>')
      .replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">/*$1*/</span>')
  } else if (language === 'python' || language === 'py') {
    return escapedCode
      .replace(/\b(def|class|import|from|as|return|if|else|elif|for|while|try|except|finally|with|in|is|not|and|or|pass|break|continue|raise|yield|lambda|global|nonlocal|del)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(print|len|str|int|float|list|dict|set|tuple|range|enumerate|zip|map|filter|reduce|sorted|reversed|min|max|sum|abs|round|type|isinstance|hasattr|getattr|setattr|dir|help|id|hash|open|input|eval|exec)\b/g, '<span class="function">$1</span>')
      .replace(/\b(True|False|None|Ellipsis|NotImplemented)\b/g, '<span class="literal">$1</span>')
      .replace(/("""[\s\S]*?""")/g, '<span class="string">$1</span>')
      .replace(/("([^"]*)")/g, '<span class="string">$1</span>')
      .replace(/('([^']*)')/g, '<span class="string">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>')
      .replace(/#(.*)$/gm, '<span class="comment">#$1</span>')
  } else if (language === 'html') {
    return escapedCode
      .replace(/(&lt;[^&]*&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(&lt;\/[^&]*&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(\w+)=/g, '<span class="attribute">$1</span>=')
      .replace(/("([^"]*)")/g, '<span class="string">$1</span>')
      .replace(/('([^']*)')/g, '<span class="string">$1</span>')
  } else if (language === 'css') {
    return escapedCode
      .replace(/([.#]?\w+)\s*{/g, '<span class="selector">$1</span> {')
      .replace(/(\w+):/g, '<span class="property">$1</span>:')
      .replace(/("([^"]*)")/g, '<span class="string">$1</span>')
      .replace(/('([^']*)')/g, '<span class="string">$1</span>')
      .replace(/\b(\d+px|\d+%|\d+em|\d+rem|\d+vw|\d+vh|\d+deg|\d+ms|\d+s)\b/g, '<span class="value">$1</span>')
      .replace(/\b(red|blue|green|yellow|black|white|transparent|inherit|initial|unset)\b/g, '<span class="value">$1</span>')
      .replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">/*$1*/</span>')
  } else if (language === 'json') {
    return escapedCode
      .replace(/"([^"]*)":/g, '<span class="property">"$1"</span>:')
      .replace(/("([^"]*)")/g, '<span class="string">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="literal">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>')
  } else {
    // 默认处理
    return escapedCode
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|def|class|import|from|as|elif|try|except|finally|with|in|is|not|and|or|True|False|None|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>')
      .replace(/("([^"]*)")/g, '<span class="string">$1</span>')
      .replace(/('([^']*)')/g, '<span class="string">\'$1\'</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>')
  }
}

export async function POST(request: NextRequest) {
  let browser = null
  
  try {
    const { content, format = 'text', theme = 'cute', options = {} } = await request.json()

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const { width = 800, height = 600, fontSize = 18 } = options
    const themeConfig = THEMES[theme as keyof typeof THEMES] || THEMES.cute

    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'C:\\Users\\Administrator\\.cache\\puppeteer\\chrome\\win64-138.0.7204.49\\chrome-win64\\chrome.exe'
    })

    const page = await browser.newPage()
    
    // 设置视口
    await page.setViewport({ width, height })

    // 处理内容
    let processedContent = content
    if (format === 'markdown') {
      // 简单的Markdown处理
      processedContent = content
        // 先处理代码块（必须在换行处理之前）
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match: string, lang: string, code: string) => {
          const language = lang || 'text'
          const highlightedCode = highlightCode(code.trim(), language)
          return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`
        })
        // 然后处理其他Markdown元素
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // 最后处理换行
        .replace(/\n/g, '<br>')
    } else if (format === 'html') {
      processedContent = content
    } else {
      // 纯文本
      processedContent = content
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => `<p>${line}</p>`)
        .join('')
    }
    
    // 生成HTML
    const html = generateHTML(processedContent, format, themeConfig, { 
      width, 
      height, 
      fontSize,
      backgroundImage: options.backgroundImage 
    })
    
    // 设置HTML内容
    await page.setContent(html)
    
    // 等待渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 截图
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
    })

    // 返回PNG图片
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': screenshot.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('图片生成错误:', error)
    return NextResponse.json(
      { error: '图片生成失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

function generateHTML(content: string, format: string, theme: any, options: any): string {
  const { width, height, fontSize, backgroundImage } = options
  
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
      width: ${width}px;
      min-height: ${height}px;
      background: ${backgroundStyle};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
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
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }
    
    .container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
      border-radius: 24px 24px 0 0;
    }
    
    .content {
      font-size: ${fontSize}px;
      line-height: 1.6;
      color: ${theme.text};
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    
    h1, h2, h3 {
      color: ${theme.primary};
      margin-bottom: 16px;
      font-weight: 700;
      line-height: 1.3;
    }
    
    h1 {
      font-size: ${fontSize * 2}px;
      text-align: center;
      margin-bottom: 24px;
    }
    
    h2 {
      font-size: ${fontSize * 1.5}px;
    }
    
    h3 {
      font-size: ${fontSize * 1.25}px;
    }
    
    p {
      margin-bottom: 16px;
      text-align: justify;
    }
    
    strong {
      color: ${theme.primary};
      font-weight: 700;
    }
    
    em {
      color: ${theme.secondary};
      font-style: italic;
    }
    
    code {
      background: #2d3748;
      color: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: ${fontSize - 2}px;
      border: 1px solid #4a5568;
    }
    
    ul, ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
    
    blockquote {
      border-left: 4px solid ${theme.primary};
      padding-left: 16px;
      margin: 16px 0;
      font-style: italic;
      color: ${theme.textSecondary};
      background: rgba(255, 255, 255, 0.5);
      padding: 16px;
      border-radius: 8px;
    }
    
    pre {
      background: #1a1a1a;
      color: #e6e6e6;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid #333;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: ${fontSize - 2}px;
      line-height: 1.4;
    }
    
    pre code {
      background: none;
      padding: 0;
      color: inherit;
      border: none;
    }
    
    /* 代码高亮样式 - 深色主题 */
    .keyword {
      color: #ff6b9d;
      font-weight: bold;
    }
    
    .function {
      color: #667eea;
      font-weight: bold;
    }
    
    .string {
      color: #68d391;
    }
    
    .number {
      color: #f6ad55;
    }
    
    .comment {
      color: #a0aec0;
      font-style: italic;
    }
    
    .literal {
      color: #805ad5;
      font-weight: bold;
    }
    
    .tag {
      color: #e53e3e;
      font-weight: bold;
    }
    
    .attribute {
      color: #d69e2e;
    }
    
    .selector {
      color: #63b3ed;
      font-weight: bold;
    }
    
    .property {
      color: #38a169;
    }
    
    .value {
      color: #dd6b20;
    }
    
    .watermark {
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 12px;
      color: ${theme.textSecondary};
      opacity: 0.6;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      ${content}
    </div>
  </div>
</body>
</html>`
} 