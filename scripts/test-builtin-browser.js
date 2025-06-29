const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function testBuiltinBrowser() {
  console.log('🧪 测试内置浏览器功能...')
  
  let browser = null
  
  try {
    // 启动内置Chromium浏览器
    console.log('🌐 启动Puppeteer浏览器...')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio'
      ]
    })
    console.log('✅ 浏览器启动成功')

    const page = await browser.newPage()
    console.log('📄 创建新页面')
    
    // 设置视口
    await page.setViewport({ width: 800, height: 600 })
    console.log('🖥️ 设置视口: 800x600')

    // 测试简单HTML
    const testHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>测试页面</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      background: linear-gradient(135deg, #ffeef8, #fff5fa);
      margin: 0;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 3px solid #ff6b9d;
    }
    h1 {
      color: #ff6b9d;
      text-align: center;
    }
    p {
      color: #2d3748;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 内置浏览器测试成功！</h1>
    <p>这是一个测试页面，用于验证内置Chromium浏览器是否正常工作。</p>
    <p>✅ Puppeteer启动成功</p>
    <p>✅ 页面渲染正常</p>
    <p>✅ 样式加载完成</p>
    <p>✅ 截图功能正常</p>
  </div>
</body>
</html>`

    // 设置HTML内容
    console.log('🌐 设置页面内容...')
    await page.setContent(testHTML, { waitUntil: 'networkidle0' })
    console.log('✅ 页面内容设置完成')
    
    // 等待内容渲染
    console.log('⏳ 等待内容渲染...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 截图
    console.log('📸 开始截图...')
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false
    })
    console.log('✅ 截图完成，大小:', screenshot.length, 'bytes')

    // 保存文件
    const outputPath = path.join(__dirname, 'test-builtin-browser.png')
    fs.writeFileSync(outputPath, screenshot)
    console.log('📁 文件保存到:', outputPath)
    
    // 测试浏览器版本
    const version = await page.evaluate(() => navigator.userAgent)
    console.log('🌐 浏览器版本:', version)
    
    console.log('\n🎉 内置浏览器测试完成！')
    console.log('📊 测试结果:')
    console.log('  • 浏览器启动: ✅')
    console.log('  • 页面创建: ✅')
    console.log('  • HTML渲染: ✅')
    console.log('  • 截图功能: ✅')
    console.log('  • 文件保存: ✅')
    
  } catch (error) {
    console.error('❌ 内置浏览器测试失败:', error.message)
    console.error('错误堆栈:', error.stack)
  } finally {
    if (browser) {
      await browser.close()
      console.log('🌐 浏览器已关闭')
    }
  }
}

// 运行测试
testBuiltinBrowser().catch(console.error) 