import fs from "fs"
import path from "path"

// 类型定义
interface FontConfig {
  name: string
  url: string
  filename: string
  weight: "normal" | "bold"
}

interface ThemeConfig {
  background: { start: string; end: string }
  primary: string
  secondary: string
  accent: string
  text: string
  textSecondary: string
  border: string
  shadow: string
}

interface RenderOptions {
  width?: number
  height?: number
  padding?: number
  fontSize?: number
  lineHeight?: number
}

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// 字体配置
const FONT_CONFIG: FontConfig[] = [
  {
    name: "Noto Sans CJK SC",
    url: "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf",
    filename: "NotoSansCJKsc-Regular.otf",
    weight: "normal",
  },
  {
    name: "Source Han Sans SC",
    url: "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Regular.otf",
    filename: "SourceHanSansSC-Regular.otf",
    weight: "normal",
  },
]

const FALLBACK_STACK = [
  "Noto Sans CJK SC",
  "Source Han Sans SC",
  "PingFang SC",
  "Microsoft YaHei",
  "SimHei",
  "Arial Unicode MS",
  "DejaVu Sans",
  "Liberation Sans",
  "Arial",
  "sans-serif",
]

// 主题配置
const THEMES: Record<string, ThemeConfig> = {
  cute: {
    background: { start: "#ffeef8", end: "#f0e6ff" },
    primary: "#e91e63",
    secondary: "#9c27b0",
    accent: "#ff69b4",
    text: "#2d3748",
    textSecondary: "#4a5568",
    border: "#e2e8f0",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  elegant: {
    background: { start: "#f3e8ff", end: "#e0e7ff" },
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent: "#a855f7",
    text: "#374151",
    textSecondary: "#6b7280",
    border: "#d1d5db",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  fresh: {
    background: { start: "#e0f2fe", end: "#e0f7fa" },
    primary: "#0891b2",
    secondary: "#06b6d4",
    accent: "#22d3ee",
    text: "#1f2937",
    textSecondary: "#374151",
    border: "#d1d5db",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  warm: {
    background: { start: "#fff7ed", end: "#fef3c7" },
    primary: "#ea580c",
    secondary: "#f59e0b",
    accent: "#fb923c",
    text: "#374151",
    textSecondary: "#6b7280",
    border: "#d1d5db",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
}

class CanvasEngine {
  private static instance: CanvasEngine
  private initialized = false
  private fontsLoaded = false
  private fontStack = ""
  private fontsDir: string
  private canvas: any = null
  private initializationPromise: Promise<void> | null = null

  constructor() {
    this.fontsDir = path.join(process.cwd(), "public", "fonts")
    this.fontStack = FALLBACK_STACK.join(", ")
  }

  static getInstance(): CanvasEngine {
    if (!CanvasEngine.instance) {
      CanvasEngine.instance = new CanvasEngine()
    }
    return CanvasEngine.instance
  }

  private async checkCanvasAvailability(): Promise<boolean> {
    try {
      const canvas = await import("canvas")
      this.canvas = canvas

      const testCanvas = canvas.createCanvas(1, 1)
      const ctx = testCanvas.getContext("2d")
      ctx.fillRect(0, 0, 1, 1)

      console.log("✅ Canvas module is available and working")
      return true
    } catch (error: any) {
      console.warn("❌ Canvas module not available:", error.message)
      return false
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._doInitialize()
    return this.initializationPromise
  }

  private async _doInitialize(): Promise<void> {
    console.log("🎨 Initializing Canvas Engine...")

    try {
      const canvasAvailable = await this.checkCanvasAvailability()
      if (!canvasAvailable) {
        throw new Error("Canvas module is not available")
      }

      await this.ensureFontsDirectory()
      this.setupFontsAsync()

      this.initialized = true
      console.log("✅ Canvas Engine initialized successfully")
    } catch (error: any) {
      console.error("❌ Canvas Engine initialization failed:", error)
      throw error
    }
  }

  private async ensureFontsDirectory(): Promise<void> {
    try {
      if (!fs.existsSync(this.fontsDir)) {
        fs.mkdirSync(this.fontsDir, { recursive: true })
        console.log("📁 Created fonts directory:", this.fontsDir)
      }
    } catch (error: any) {
      console.warn("⚠️ Failed to create fonts directory:", error.message)
    }
  }

  private setupFontsAsync(): void {
    this.setupFonts().catch((error: any) => {
      console.warn("⚠️ Font setup failed:", error.message)
    })
  }

  private async downloadFont(url: string, filepath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filepath)) {
        console.log("✅ Font already exists:", path.basename(filepath))
        return true
      }

      console.log("📥 Downloading font:", path.basename(filepath))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TextToImageService/1.0)",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      fs.writeFileSync(filepath, Buffer.from(buffer))

      console.log("✅ Downloaded font:", path.basename(filepath), `(${buffer.byteLength} bytes)`)
      return true
    } catch (error: any) {
      console.warn(`❌ Failed to download font ${path.basename(filepath)}:`, error.message)
      return false
    }
  }

  private async setupFonts(): Promise<void> {
    console.log("🔤 Setting up fonts...")

    const downloadPromises = FONT_CONFIG.map(async (font) => {
      const filepath = path.join(this.fontsDir, font.filename)
      const downloaded = await this.downloadFont(font.url, filepath)

      if (downloaded && this.canvas) {
        try {
          this.canvas.registerFont(filepath, {
            family: font.name,
            weight: font.weight,
          })
          console.log(`✅ Registered font: ${font.name} (${font.weight})`)
          return true
        } catch (error: any) {
          console.warn(`❌ Failed to register font ${font.name}:`, error.message)
          return false
        }
      }
      return false
    })

    const results = await Promise.all(downloadPromises)
    const successCount = results.filter(Boolean).length

    if (successCount > 0) {
      this.fontsLoaded = true
      console.log(`✅ Successfully loaded ${successCount}/${FONT_CONFIG.length} fonts`)
    } else {
      console.warn("⚠️ No fonts were loaded, using system fonts")
    }

    await this.createFontInfo()
  }

  private async createFontInfo(): Promise<void> {
    try {
      const fontInfo = {
        loaded: this.fontsLoaded,
        fonts: FONT_CONFIG.map((font) => ({
          name: font.name,
          filename: font.filename,
          weight: font.weight,
          exists: fs.existsSync(path.join(this.fontsDir, font.filename)),
        })),
        fallbackStack: FALLBACK_STACK,
        timestamp: new Date().toISOString(),
      }

      const infoPath = path.join(this.fontsDir, "font-info.json")
      fs.writeFileSync(infoPath, JSON.stringify(fontInfo, null, 2))
    } catch (error: any) {
      console.warn("⚠️ Failed to create font info:", error.message)
    }
  }

  getFontStack(): string {
    return this.fontStack
  }

  isInitialized(): boolean {
    return this.initialized
  }

  areFontsLoaded(): boolean {
    return this.fontsLoaded
  }

  isCanvasAvailable(): boolean {
    return this.canvas !== null
  }

  // 简化的渲染方法，避免复杂的类定义
  async renderText(content: string, format: string, theme: string, options: RenderOptions = {}): Promise<Buffer> {
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.canvas) {
      throw new Error("Canvas is not available for PNG rendering")
    }

    const { width = 800, height = 600, padding = 60, fontSize = 18, lineHeight = 28 } = options

    try {
      console.log(`🖼️ Starting PNG rendering: ${format} (${content.length} chars)`)

      const canvas = this.canvas.createCanvas(width, height)
      const ctx = canvas.getContext("2d")
      const themeConfig = THEMES[theme] || THEMES.cute

      // 计算安全布局
      const safePadding = Math.max(padding, 80)
      const containerX = safePadding / 2
      const containerY = safePadding / 2
      const containerWidth = width - safePadding
      const containerHeight = height - safePadding

      const borderWidth = 15
      const contentX = containerX + borderWidth
      const contentY = containerY + borderWidth
      const contentWidth = containerWidth - borderWidth * 2
      const contentHeight = containerHeight - borderWidth * 2

      const titleHeight = 70
      const footerHeight = 50
      const textPadding = 30

      const textX = contentX + textPadding
      const textY = contentY + titleHeight + 15
      const textWidth = contentWidth - textPadding * 2
      const textHeight = contentHeight - titleHeight - footerHeight - 30

      console.log(`📐 Layout: text area ${textWidth}x${textHeight} at (${textX}, ${textY})`)

      // 设置背景渐变
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, themeConfig.background.start)
      gradient.addColorStop(1, themeConfig.background.end)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // 绘制容器背景
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(containerX, containerY, containerWidth, containerHeight)

      // 绘制容器边框
      ctx.strokeStyle = themeConfig.primary
      ctx.lineWidth = 2
      ctx.strokeRect(contentX, contentY, contentWidth, contentHeight)

      // 处理内容
      let processedContent = content
      if (format === "html") {
        processedContent = this.stripHtmlTags(content)
      } else if (format === "markdown") {
        processedContent = this.stripMarkdown(content)
      }

      // 限制长度
      if (processedContent.length > 3000) {
        processedContent = processedContent.slice(0, 3000) + "\n\n[内容过长，已截断...]"
      }

      // 绘制标题
      const formatTitle = format === "markdown" ? "Markdown" : format === "html" ? "HTML" : "文本"
      ctx.font = `bold 22px ${this.fontStack}`
      ctx.fillStyle = themeConfig.primary
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${formatTitle} 内容`, width / 2, contentY + titleHeight / 2)

      // 渲染文本内容
      this.renderTextContent(
        ctx,
        processedContent,
        textX,
        textY,
        textWidth,
        textHeight,
        fontSize,
        lineHeight,
        themeConfig.text,
      )

      // 绘制底部信息
      ctx.font = `11px ${this.fontStack}`
      ctx.fillStyle = themeConfig.textSecondary
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const infoText = this.fontsLoaded ? `中文字体已加载 | 严格边界控制` : `系统字体 | 严格边界控制`
      ctx.fillText(infoText, width / 2, contentY + contentHeight - footerHeight / 2)

      // 绘制装饰emoji
      ctx.font = `12px ${this.fontStack}`
      ctx.fillStyle = themeConfig.primary
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      const emojiX = contentX + contentWidth - 40
      const emojiY = contentY + 10
      ctx.fillText("✨", emojiX, emojiY)
      ctx.fillText("💖", emojiX, emojiY + 15)
      ctx.fillText("🌸", emojiX, emojiY + 30)

      const buffer = canvas.toBuffer("image/png")
      console.log(`✅ Generated PNG: ${buffer.length} bytes`)

      return buffer
    } catch (error: any) {
      console.error("❌ PNG rendering failed:", error)
      throw new Error(`PNG rendering failed: ${error.message}`)
    }
  }

  private stripHtmlTags(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim()
  }

  private stripMarkdown(markdown: string): string {
    return markdown
      .replace(/^#{1,6}\s+(.+)$/gm, "$1\n")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "[代码块]\n")
      .replace(/^\s*[-*+]\s+(.+)$/gm, "• $1")
      .replace(/^\s*\d+\.\s+(.+)$/gm, "• $1")
      .replace(/^\s*>\s+(.+)$/gm, "» $1")
      .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim()
  }

  private renderTextContent(
    ctx: any,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
    fontSize: number,
    lineHeight: number,
    color: string,
  ): void {
    ctx.font = `${fontSize}px ${this.fontStack}`
    ctx.fillStyle = color
    ctx.textAlign = "left"
    ctx.textBaseline = "top"

    const lines = this.wrapText(ctx, text, maxWidth)
    const maxLines = Math.floor(maxHeight / lineHeight)
    const linesToRender = lines.slice(0, maxLines)

    let currentY = y
    for (let i = 0; i < linesToRender.length; i++) {
      const line = linesToRender[i]
      if (currentY + lineHeight > y + maxHeight) break

      ctx.fillText(line, x, currentY)
      currentY += lineHeight
    }

    console.log(`📝 Rendered ${linesToRender.length}/${lines.length} lines`)
  }

  private wrapText(ctx: any, text: string, maxWidth: number): string[] {
    const lines: string[] = []
    const paragraphs = text.split("\n")

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push("")
        continue
      }

      const words = paragraph.split(" ")
      let currentLine = ""

      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth - 10 && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }

      if (currentLine) {
        lines.push(currentLine)
      }
    }

    return lines
  }

  getFontInfo(): any {
    const infoPath = path.join(this.fontsDir, "font-info.json")
    if (fs.existsSync(infoPath)) {
      try {
        return JSON.parse(fs.readFileSync(infoPath, "utf8"))
      } catch {
        return null
      }
    }
    return null
  }
}

export const canvasEngine = CanvasEngine.getInstance()
