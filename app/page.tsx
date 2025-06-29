"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Heart,
  Star,
  FileText,
  ExternalLink,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Globe,
} from "lucide-react"
import Link from "next/link"

// 防抖Hook
function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const timer = setTimeout(() => {
        callback(...args)
      }, delay)

      setDebounceTimer(timer)
    },
    [callback, delay, debounceTimer],
  )

  return debouncedCallback
}

export default function TextToImageService() {
  const [text, setText] = useState("")
  const [format, setFormat] = useState("text")
  const [theme, setTheme] = useState("cute")
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [progress, setProgress] = useState(0)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState<number | null>(null)
  const [imageDimensions, setImageDimensions] = useState<string | null>(null)
  const [renderer, setRenderer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 计算文本统计信息和风险评估
  const textAnalysis = useMemo(() => {
    const chars = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.split("\n").length
    const estimatedTime = Math.max(1000, chars * 1.2) // Puppeteer需要更多时间

    // 检测中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const hasEmoji = /[\u{1f300}-\u{1f9ff}]|[\u{2600}-\u{26ff}]|[\u{2700}-\u{27bf}]/u.test(text)

    // 检测长行和长单词
    const textLines = text.split("\n")
    const longLines = textLines.filter((line) => line.length > 100).length
    const veryLongLines = textLines.filter((line) => line.length > 200).length
    const longWords = text.split(/\s+/).filter((word) => word.length > 30).length

    // 风险评估
    let riskLevel = "low"
    let riskMessage = "文本长度适中，渲染效果良好"

    if (chars > 8000) {
      riskLevel = "high"
      riskMessage = "文本过长，可能会被截断"
    } else if (chars > 4000 || veryLongLines > 0 || longWords > 5) {
      riskLevel = "medium"
      riskMessage = "文本较长或包含长行，建议分段处理"
    } else if (longLines > 3 || longWords > 0) {
      riskLevel = "low-medium"
      riskMessage = "包含较长行，换行效果可能受影响"
    }

    return {
      chars,
      words,
      lines,
      chineseChars,
      hasEmoji,
      estimatedTime,
      longLines,
      veryLongLines,
      longWords,
      riskLevel,
      riskMessage,
    }
  }, [text])

  // 防抖的文本变化处理
  const debouncedTextChange = useDebounce((value: string) => {
    console.log("Text analysis:", {
      length: value.length,
      lines: value.split("\n").length,
      words: value.trim() ? value.trim().split(/\s+/).length : 0,
      chinese: (value.match(/[\u4e00-\u9fff]/g) || []).length,
    })
  }, 300)

  const handleGenerate = async () => {
    if (!text.trim()) return

    setLoading(true)
    setProgress(0)
    setError(null)
    setProcessingTime(null)
    setImageSize(null)
    setImageDimensions(null)
    setRenderer(null)

    const startTime = Date.now()

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const elapsed = Date.now() - startTime
          const estimated = textAnalysis.estimatedTime
          const newProgress = Math.min(90, (elapsed / estimated) * 100)
          return newProgress
        })
      }, 100)

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          format: format,
          theme: theme,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setImageUrl(url)

        // 获取响应头信息
        const timeHeader = response.headers.get("X-Processing-Time")
        const dimensionsHeader = response.headers.get("X-Image-Dimensions")
        const rendererHeader = response.headers.get("X-Renderer")
        const engineHeader = response.headers.get("X-Engine")

        if (timeHeader) {
          setProcessingTime(Number.parseInt(timeHeader))
        }
        if (dimensionsHeader) {
          setImageDimensions(dimensionsHeader)
        }
        if (rendererHeader) {
          setRenderer(rendererHeader)
        }

        setImageSize(blob.size)
      } else {
        // 改进的错误处理
        let errorMessage = `请求失败，状态码: ${response.status}`
        const contentType = response.headers.get("Content-Type") || ""

        try {
          if (contentType.includes("application/json")) {
            const errJson = await response.json()
            errorMessage = errJson?.error || JSON.stringify(errJson)
          } else {
            errorMessage = await response.text()
          }
        } catch {
          // 解析失败时使用默认错误信息
        }

        setError(errorMessage)
        console.error("Failed to generate image:", errorMessage)
      }
    } catch (error) {
      console.error("Error:", error)
      setError("网络连接失败，请检查网络连接后重试")
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement("a")
      a.href = imageUrl
      a.download = `puppeteer-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleTextChange = (value: string) => {
    setText(value)
    debouncedTextChange(value)
  }

  const handleRetry = () => {
    setError(null)
    handleGenerate()
  }

  const exampleTexts = {
    text: "Hello World! ✨\n\n你好世界！这是一个中英文混合的测试文本。\n\n支持多行文本，包括很长很长很长很长很长很长很长很长很长很长的单行文本。\n\n🌸 萌系风格\n💖 二次元设计\n🎀 可爱字体\n\n这里有一个超级超级超级超级超级超级超级超级超级超级超级超级超级超级超级长的单词：supercalifragilisticexpialidocious\n\n中文字体测试：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。\n\n换行测试完成！",
    html: "<h1>HTML 中文字体测试</h1>\n<p>这是一个<strong>HTML</strong>格式的示例，包含中文字符：你好世界！很长很长很长很长很长很长很长很长很长很长很长很长很长很长的段落文本。</p>\n<ul>\n<li>支持标题和自动换行 🎯</li>\n<li>支持<em>强调</em>文本，即使文本很长很长很长很长很长很长很长很长很长很长</li>\n<li>支持列表项目的智能换行处理 ✨</li>\n<li>中文测试：春眠不觉晓，处处闻啼鸟</li>\n</ul>\n<blockquote>这是一个引用块，包含中文内容：夜来风雨声，花落知多少。很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的引用内容。</blockquote>\n<code>console.log('你好世界！Hello World! 🌸');</code>",
    markdown:
      "# Markdown 中文字体测试\n\n这是一个**Markdown**格式的示例，展示中文字体渲染和智能换行功能。\n\n## 长文本处理特性 🚀\n\n- 支持标题的自动换行，即使标题很长很长很长很长很长很长很长很长很长很长\n- 支持**粗体**和*斜体*中文文本的换行处理\n- 支持`代码片段`的智能断行：`console.log('你好世界！🌸')`\n- 支持列表项目的完美换行\n- 中文诗词测试：床前明月光，疑是地上霜。举头望明月，低头思故乡。\n\n> 这是一个中文引用块：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。包含很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的引用内容，测试引用块的换行效果。\n\n### 代码块测试 💻\n\n```javascript\n// 这是一个包含中文注释的代码块\nconst message = '你好世界！Hello World! 🌸✨💖';\nconsole.log(message);\n// 很长很长很长很长很长很长很长很长很长很长很长很长很长很长的注释\nconst veryLongVariableName = 'this is a very long string that should be wrapped properly';\n```\n\n**中文字体测试完成！** 所有内容都应该正确显示，包括中文字符、emoji 和英文混合内容。🎉",
  }

  const loadExample = () => {
    const exampleText = exampleTexts[format as keyof typeof exampleTexts]
    setText(exampleText)
    debouncedTextChange(exampleText)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low-medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <AlertTriangle className="w-4 h-4" />
      case "low-medium":
        return <Clock className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Puppeteer 文字转图片
            </h1>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-gray-600 text-lg mb-4">完全内置 + 中文字体 + 智能渲染 🎨</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/api/docs">
              <Button variant="outline" className="gap-2 bg-transparent">
                <FileText className="w-4 h-4" />
                API 文档
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
            {processingTime && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                {processingTime}ms
              </Badge>
            )}
            {imageDimensions && (
              <Badge variant="outline" className="gap-1">
                📐 {imageDimensions}
              </Badge>
            )}
            {renderer && (
              <Badge variant="outline" className="gap-1 max-w-xs truncate">
                <Globe className="w-3 h-3" />
                {renderer}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border-2 border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Star className="w-5 h-5" />
                输入内容
              </CardTitle>
              <CardDescription>
                Puppeteer 渲染引擎 + Google Fonts 中文字体
                {textAnalysis.chars > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {textAnalysis.chars} 字符
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {textAnalysis.words} 单词
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {textAnalysis.lines} 行
                    </Badge>
                    {textAnalysis.chineseChars > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {textAnalysis.chineseChars} 中文
                      </Badge>
                    )}
                    {textAnalysis.hasEmoji && (
                      <Badge variant="outline" className="text-xs">
                        😊 Emoji
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs gap-1">
                      <Clock className="w-3 h-3" />~{Math.round(textAnalysis.estimatedTime)}ms
                    </Badge>
                    <Badge variant={getRiskColor(textAnalysis.riskLevel)} className="text-xs gap-1">
                      {getRiskIcon(textAnalysis.riskLevel)}
                      {textAnalysis.riskLevel}
                    </Badge>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 bg-transparent">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      重试
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* 风险提示 */}
              {textAnalysis.riskLevel !== "low" && textAnalysis.chars > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {textAnalysis.riskMessage}
                    {textAnalysis.longWords > 0 && (
                      <span className="block mt-1 text-sm">
                        检测到 {textAnalysis.longWords} 个超长单词，Puppeteer 将自动处理
                      </span>
                    )}
                    {textAnalysis.veryLongLines > 0 && (
                      <span className="block mt-1 text-sm">
                        检测到 {textAnalysis.veryLongLines} 行超长文本，将智能换行
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容格式</label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">纯文本</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">主题风格</label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cute">萌系粉色</SelectItem>
                      <SelectItem value="kawaii">可爱红色</SelectItem>
                      <SelectItem value="pastel">柔和绿色</SelectItem>
                      <SelectItem value="elegant">优雅紫色</SelectItem>
                      <SelectItem value="fresh">清新蓝色</SelectItem>
                      <SelectItem value="warm">温暖橙色</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">内容</label>
                  <Button variant="outline" size="sm" onClick={loadExample}>
                    加载测试示例
                  </Button>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={
                    format === "text"
                      ? "输入你想要转换的文字...\n支持中文、英文、emoji混合\nPuppeteer 完美渲染"
                      : format === "html"
                        ? "<h1>你好世界 Hello World</h1>\n<p>支持HTML格式和中文字体</p>"
                        : "# 标题 Title\n\n支持**Markdown**格式\n\n- 中文字体\n- 自动换行\n- 完美渲染"
                  }
                  className="min-h-[200px] border-pink-200 focus:border-pink-400 resize-none font-mono text-sm"
                />
              </div>

              {loading && progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Puppeteer 渲染进度</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || !text.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Puppeteer 渲染中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    生成 PNG 图片
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Heart className="w-5 h-5" />
                生成结果
              </CardTitle>
              <CardDescription>
                Puppeteer 引擎，完美中文字体渲染
                {imageSize && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {formatBytes(imageSize)}
                    </Badge>
                    {processingTime && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Zap className="w-3 h-3" />
                        {processingTime}ms
                      </Badge>
                    )}
                    {imageDimensions && (
                      <Badge variant="outline" className="text-xs">
                        📐 {imageDimensions}
                      </Badge>
                    )}
                    {renderer && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Globe className="w-3 h-3" />
                        Puppeteer PNG
                      </Badge>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {imageUrl ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 bg-purple-50">
                    <img src={imageUrl || "/placeholder.svg"} alt="Generated" className="w-full rounded-lg shadow-md" />
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载 PNG 图片
                  </Button>
                  {renderer && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      <strong>渲染引擎:</strong> {renderer} | HTML/Markdown 完美渲染 | 萌系风格优化
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                      <Globe className="w-8 h-8 text-purple-500" />
                    </div>
                    <p>在左侧输入内容并点击生成按钮</p>
                    <p className="text-sm">Puppeteer 引擎，完美中文渲染</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mt-8 border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Puppeteer 引擎特性
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">🌐 完全内置</h4>
                <p className="text-sm text-green-600">内置 Chromium 浏览器，无需外部依赖</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">🔤 完美字体</h4>
                <p className="text-sm text-blue-600">友好的中文字体支持，萌系风格优化</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">🎨 智能渲染</h4>
                <p className="text-sm text-purple-600">HTML/Markdown 完美解析，保留样式结构</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-medium text-pink-800 mb-2">💖 萌系风格</h4>
                <p className="text-sm text-pink-600">二次元萌系主题，可爱装饰元素</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
