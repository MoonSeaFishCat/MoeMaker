import { NextResponse } from "next/server"
import { canvasEngine } from "@/lib/canvas-engine"

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
    },
    canvas: {
      available: false,
      initialized: false,
      fontsLoaded: false,
      fontStack: "",
      error: null,
    },
    modules: {
      canvas: false,
      fs: false,
      path: false,
    },
  }

  // 检查模块可用性
  try {
    require("fs")
    debug.modules.fs = true
  } catch (error) {
    debug.modules.fs = false
  }

  try {
    require("path")
    debug.modules.path = true
  } catch (error) {
    debug.modules.path = false
  }

  try {
    require("canvas")
    debug.modules.canvas = true
  } catch (error) {
    debug.modules.canvas = false
  }

  // 检查Canvas引擎
  try {
    debug.canvas.available = canvasEngine.isCanvasAvailable()
    debug.canvas.initialized = canvasEngine.isInitialized()
    debug.canvas.fontsLoaded = canvasEngine.areFontsLoaded()
    debug.canvas.fontStack = canvasEngine.getFontStack()

    // 尝试初始化
    if (!debug.canvas.initialized) {
      await canvasEngine.initialize()
      debug.canvas.initialized = canvasEngine.isInitialized()
      debug.canvas.fontsLoaded = canvasEngine.areFontsLoaded()
    }
  } catch (error) {
    debug.canvas.error = error.message
  }

  return NextResponse.json(debug, {
    headers: {
      "Cache-Control": "no-cache",
    },
  })
}
