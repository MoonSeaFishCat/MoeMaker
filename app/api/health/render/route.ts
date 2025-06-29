import { NextResponse } from "next/server"
import { renderEngine } from "@/lib/render-engine"

export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      engine: {
        initialized: false,
        puppeteerAvailable: false,
        environment: null,
        testRender: null,
      },
      issues: [] as string[],
    }

    // 获取引擎状态
    const status = renderEngine.getStatus()
    healthCheck.engine.initialized = status.initialized
    healthCheck.engine.puppeteerAvailable = status.puppeteerAvailable
    healthCheck.engine.environment = status.environment

    // 如果未初始化，尝试初始化
    if (!status.initialized) {
      try {
        await renderEngine.initialize()
        const newStatus = renderEngine.getStatus()
        healthCheck.engine.initialized = newStatus.initialized
        healthCheck.engine.puppeteerAvailable = newStatus.puppeteerAvailable
      } catch (error: any) {
        healthCheck.issues.push(`Engine initialization failed: ${error.message}`)
      }
    }

    // 测试渲染
    try {
      const testResult = await renderEngine.renderText("测试 Test 🌸", "text", "cute", {
        width: 400,
        height: 300,
      })

      if (testResult.buffer.length > 0) {
        healthCheck.engine.testRender = {
          success: true,
          renderer: testResult.renderer,
          contentType: testResult.contentType,
          size: testResult.buffer.length,
        }
        healthCheck.status = "healthy"
      } else {
        healthCheck.engine.testRender = { success: false, error: "Empty buffer" }
        healthCheck.issues.push("Test render returned empty buffer")
        healthCheck.status = "degraded"
      }
    } catch (error: any) {
      healthCheck.engine.testRender = { success: false, error: error.message }
      healthCheck.issues.push(`Test render failed: ${error.message}`)
      healthCheck.status = "degraded"
    }

    // 环境检查
    if (status.environment?.isV0) {
      healthCheck.issues.push("Running in v0 environment - using SVG rendering")
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
        engine: "unified-render-engine",
      },
      { status: 500 },
    )
  }
}
