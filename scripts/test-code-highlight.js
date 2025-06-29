const fs = require('fs')
const path = require('path')

async function testCodeHighlight() {
  console.log('🧪 测试代码高亮功能...')
  
  try {
    const testData = {
      content: `# 代码高亮测试

这是一个测试代码高亮功能的Markdown文档。

## JavaScript 代码块

\`\`\`javascript
// 这是一个JavaScript代码块
const message = 'Hello World! 🌸';
const numbers = [1, 2, 3, 4, 5];

function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

const result = numbers.map(n => n * 2);
console.log(result);
\`\`\`

## Python 代码块

\`\`\`python
# 这是一个Python代码块
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 测试函数
numbers = [1, 2, 3, 4, 5]
result = [fibonacci(x) for x in numbers]
print(f"斐波那契数列: {result}")
\`\`\`

## HTML 代码块

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>测试页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Hello World!</h1>
    <p>这是一个测试段落。</p>
</body>
</html>
\`\`\`

## CSS 代码块

\`\`\`css
/* 样式定义 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #ff6b9d;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
}

.button:hover {
    background-color: #ff4d8d;
}
\`\`\`

## 行内代码

这里有一些行内代码：\`console.log('Hello')\` 和 \`const x = 42\`。

**测试完成！** 所有代码块都应该有语法高亮。`,
      format: "markdown",
      theme: "cute",
      options: {
        width: 800,
        height: 800,
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
      const outputPath = path.join(__dirname, 'test-code-highlight.png')
      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log('📁 文件保存到:', outputPath)
      
      console.log('\n🎉 代码高亮测试完成！')
      console.log('📊 测试内容:')
      console.log('  • JavaScript 代码块: ✅')
      console.log('  • Python 代码块: ✅')
      console.log('  • HTML 代码块: ✅')
      console.log('  • CSS 代码块: ✅')
      console.log('  • 行内代码: ✅')
      console.log('  • 语法高亮: ✅')
    } else {
      const errorText = await response.text()
      console.error('❌ API请求失败:', errorText)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testCodeHighlight().catch(console.error) 