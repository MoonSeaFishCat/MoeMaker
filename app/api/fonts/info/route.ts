import { NextResponse } from "next/server"
import { canvasEngine } from "@/lib/canvas-engine"

export async function GET() {
  try {
    // 确保Canvas引擎已初始化
    if (!canvasEngine.isInitialized()) {
      await canvasEngine.initialize()
    }

    const fontInfo = canvasEngine.getFontInfo()
    const response = {
      timestamp: new Date().toISOString(),
      initialized: canvasEngine.isInitialized(),
      fontsLoaded: canvasEngine.areFontsLoaded(),
      fontStack: canvasEngine.getFontStack(),
      fontInfo: fontInfo,
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5分钟缓存
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: error.message,
        initialized: false,
        fontsLoaded: false,
      },
      { status: 500 },
    )
  }
}
