import { NextResponse } from "next/server"
import { createCanvas, registerFont } from "canvas"
import fs from "fs"
import path from "path"

// 字体健康检查API
export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      fonts: {
        system: [],
        application: [],
        registered: [],
        test: null,
      },
      issues: [],
    }

    // 检查应用字体目录
    const fontsDir = path.join(process.cwd(), "public", "fonts")
    if (fs.existsSync(fontsDir)) {
      const fontFiles = fs.readdirSync(fontsDir).filter((file) => /\.(ttf|otf|ttc)$/i.test(file))
      healthCheck.fonts.application = fontFiles

      // 尝试注册字体
      const testFonts = [
        { file: "NotoSansCJKsc-Regular.otf", family: "Noto Sans CJK SC" },
        { file: "SourceHanSansSC-Regular.otf", family: "Source Han Sans SC" },
        { file: "NotoSansCJK-Regular.otf", family: "Noto Sans CJK" },
      ]

      for (const font of testFonts) {
        const fontPath = path.join(fontsDir, font.file)
        if (fs.existsSync(fontPath)) {
          try {
            registerFont(fontPath, { family: font.family })
            healthCheck.fonts.registered.push(font.family)
          } catch (error) {
            healthCheck.issues.push(`Failed to register ${font.family}: ${error.message}`)
          }
        }
      }
    } else {
      healthCheck.issues.push("Fonts directory not found")
    }

    // 测试中文字符渲染
    try {
      const canvas = createCanvas(200, 100)
      const ctx = canvas.getContext("2d")

      // 设置字体栈
      const fontStack = [
        "Noto Sans CJK SC",
        "Source Han Sans SC",
        "Noto Sans CJK",
        "Source Han Sans",
        "PingFang SC",
        "Microsoft YaHei",
        "SimHei",
        "Arial Unicode MS",
        "sans-serif",
      ].join(", ")

      ctx.font = `24px ${fontStack}`
      ctx.fillStyle = "#000000"
      ctx.fillText("你好世界", 10, 50)

      // 检查渲染结果
      const imageData = ctx.getImageData(0, 0, 200, 100)
      const hasContent = Array.from(imageData.data).some((pixel, index) => index % 4 === 3 && pixel > 0)

      if (hasContent) {
        healthCheck.fonts.test = "success"
      } else {
        healthCheck.fonts.test = "failed"
        healthCheck.issues.push("Chinese character rendering test failed")
        healthCheck.status = "degraded"
      }
    } catch (error) {
      healthCheck.fonts.test = "error"
      healthCheck.issues.push(`Rendering test error: ${error.message}`)
      healthCheck.status = "degraded"
    }

    // 检查系统字体（如果可用）
    try {
      const { execSync } = require("child_process")
      const systemFonts = execSync("fc-list | grep -i 'noto\\|source\\|han' | head -5", { encoding: "utf8" })
      healthCheck.fonts.system = systemFonts.split("\n").filter((line) => line.trim())
    } catch (error) {
      // 系统字体检查失败不影响整体状态
    }

    // 确定最终状态
    if (healthCheck.issues.length === 0) {
      healthCheck.status = "healthy"
    } else if (healthCheck.fonts.registered.length > 0) {
      healthCheck.status = "degraded"
    } else {
      healthCheck.status = "unhealthy"
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
