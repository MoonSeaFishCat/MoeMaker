import { NextResponse } from "next/server"
import { canvasEngine } from "@/lib/canvas-engine"

export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      canvas: {
        available: false,
        initialized: false,
        fonts: {
          loaded: false,
          count: 0,
          info: null,
        },
        engine: "unknown",
      },
      issues: [] as string[],
    }

    // 检查Canvas是否可用
    try {
      require("canvas")
      healthCheck.canvas.available = true
      healthCheck.canvas.engine = "node-canvas"
    } catch {
      healthCheck.canvas.available = false
      healthCheck.canvas.engine = "svg-fallback"
      healthCheck.issues.push("Canvas module not available")
    }

    if (healthCheck.canvas.available) {
      // 检查Canvas引擎状态
      healthCheck.canvas.initialized = canvasEngine.isInitialized()
      healthCheck.canvas.fonts.loaded = canvasEngine.areFontsLoaded()

      // 如果未初始化，尝试初始化
      if (!healthCheck.canvas.initialized) {
        try {
          await canvasEngine.initialize()
          healthCheck.canvas.initialized = true
          healthCheck.canvas.fonts.loaded = canvasEngine.areFontsLoaded()
        } catch (error) {
          healthCheck.issues.push(`Canvas initialization failed: ${error.message}`)
        }
      }

      // 获取字体信息
      const fontInfo = canvasEngine.getFontInfo()
      if (fontInfo) {
        healthCheck.canvas.fonts.info = fontInfo
        healthCheck.canvas.fonts.count = fontInfo.fonts?.filter((f: any) => f.exists).length || 0
      }

      // 测试渲染
      try {
        const testBuffer = await canvasEngine.renderText("测试 Test", "text", "cute", {
          width: 200,
          height: 100,
        })

        if (testBuffer.length > 0) {
          healthCheck.status = "healthy"
        } else {
          healthCheck.issues.push("Canvas rendering test failed - empty buffer")
          healthCheck.status = "degraded"
        }
      } catch (error) {
        healthCheck.issues.push(`Canvas rendering test failed: ${error.message}`)
        healthCheck.status = "degraded"
      }
    } else {
      healthCheck.status = "degraded"
    }

    // 确定最终状态
    if (healthCheck.issues.length === 0) {
      healthCheck.status = "healthy"
    } else if (healthCheck.canvas.available && healthCheck.canvas.initialized) {
      healthCheck.status = "degraded"
    } else {
      healthCheck.status = "limited"
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === "limited" ? 503 : 200,
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
