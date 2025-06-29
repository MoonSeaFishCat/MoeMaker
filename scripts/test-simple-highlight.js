const fs = require('fs')
const path = require('path')

async function testSimpleHighlight() {
  console.log('🧪 测试简单代码高亮...')
  
  try {
    const testData = {
      content: `# 简单代码高亮测试

## JavaScript 代码

\`\`\`javascript
const message = 'Hello World!';
console.log(message);
\`\`\`

## Python 代码

\`\`\`python
def hello():
    print("Hello World!")
\`\`\`

测试完成！`,
      format: "markdown",
      theme: "cute",
      options: {
        width: 600,
        height: 400,
        fontSize: 16
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
    
    if (response.ok) {
      const buffer = await response.arrayBuffer()
      console.log('✅ 图片生成成功，大小:', buffer.byteLength, 'bytes')
      
      // 保存文件
      const outputPath = path.join(__dirname, 'test-simple-highlight.png')
      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log('📁 文件保存到:', outputPath)
      
      console.log('\n🎉 简单代码高亮测试完成！')
    } else {
      const errorText = await response.text()
      console.error('❌ API请求失败:', errorText)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testSimpleHighlight().catch(console.error) 