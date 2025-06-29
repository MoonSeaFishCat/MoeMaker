const fs = require('fs')
const path = require('path')

async function testSimpleAPI() {
  console.log('🧪 测试简化API...')
  
  try {
    const testData = {
      content: "Hello World! ✨\n\n你好世界！这是一个简单的测试。\n\n🌸 萌系风格\n💖 二次元设计",
      format: "text",
      theme: "cute",
      options: {
        width: 800,
        height: 600,
        fontSize: 18
      }
    }
    
    console.log('📤 发送请求...')
    const response = await fetch('http://localhost:3000/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    console.log('📊 响应状态:', response.status)
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const buffer = await response.arrayBuffer()
      console.log('✅ 图片生成成功，大小:', buffer.byteLength, 'bytes')
      
      // 保存文件
      const outputPath = path.join(__dirname, 'test-simple-api.png')
      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log('📁 文件保存到:', outputPath)
      
      console.log('\n🎉 简化API测试完成！')
    } else {
      const errorText = await response.text()
      console.error('❌ API请求失败:', errorText)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testSimpleAPI().catch(console.error) 