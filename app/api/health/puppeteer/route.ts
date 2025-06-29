import { NextResponse } from "next/server"

export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      puppeteer: {
        moduleLoaded: false,
        initialized: false,
        browserAvailable: false,
        version: null,
        testRender: null,
        error: null,
      },
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        isDocker: require("fs").existsSync("/.dockerenv"),
        isVercel: process.env.VERCEL === "1",
      },
      issues: [] as string[],
    }

    // 尝试加载 Puppeteer 模块
    try {
      const { puppeteerEngine } = await import("@/lib/puppeteer-engine")
      healthCheck.puppeteer.moduleLoaded = true

      // 获取状态
      const status = await puppeteerEngine.getStatus()
      healthCheck.puppeteer.initialized = status.initialized
      healthCheck.puppeteer.browserAvailable = status.browserConnected

      // 如果未初始化，尝试初始化
      if (!status.initialized) {
        try {
          await puppeteerEngine.initialize()
          const newStatus = await puppeteerEngine.getStatus()
          healthCheck.puppeteer.initialized = newStatus.initialized
          healthCheck.puppeteer.browserAvailable = newStatus.browserConnected
        } catch (error: any) {
          healthCheck.issues.push(`Puppeteer initialization failed: ${error.message}`)
          healthCheck.puppeteer.error = error.message
        }
      }

      // 测试渲染
      if (healthCheck.puppeteer.browserAvailable) {
        try {
          const testBuffer = await puppeteerEngine.renderText("测试 Test 🌸", "text", "cute", {
            width: 400,
            height: 300,
          })

          if (testBuffer.length > 0) {
            healthCheck.puppeteer.testRender = "success"
            healthCheck.status = "healthy"
          } else {
            healthCheck.puppeteer.testRender = "failed"
            healthCheck.issues.push("Test render returned empty buffer")
            healthCheck.status = "degraded"
          }
        } catch (error: any) {
          healthCheck.puppeteer.testRender = "error"
          healthCheck.issues.push(`Test render failed: ${error.message}`)
          healthCheck.status = "degraded"
        }
      } else {
        healthCheck.issues.push("Browser not available")
        healthCheck.status = "degraded"
      }
    } catch (moduleError: any) {
      healthCheck.puppeteer.moduleLoaded = false
      healthCheck.puppeteer.error = moduleError.message
      healthCheck.issues.push(`Module loading failed: ${moduleError.message}`)
      healthCheck.status = "degraded"
    }

    // 获取 Puppeteer 版本信息
    try {
      const puppeteer = await import("puppeteer")
      healthCheck.puppeteer.version = (puppeteer as any).default?.version || "unknown"
    } catch {
      healthCheck.puppeteer.version = "not-available"
    }

    // 环境检查
    if (healthCheck.environment.isVercel) {
      healthCheck.issues.push("Vercel environment detected - Puppeteer may not work")
      healthCheck.status = "degraded"
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-cache",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error.message,
        engine: "puppeteer",
      },
      { status: 500 },
    )
  }
}
