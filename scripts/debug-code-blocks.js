// 调试代码块正则表达式
function testCodeBlockRegex() {
  console.log('🧪 测试代码块正则表达式...')
  
  const testContent = `# 测试

\`\`\`javascript
const message = 'Hello World!';
console.log(message);
\`\`\`

\`\`\`python
def hello():
    print("Hello World!")
\`\`\`

测试完成！`
  
  console.log('📝 测试内容:')
  console.log(testContent)
  console.log('\n🔍 查找代码块...')
  
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  let match
  let count = 0
  
  while ((match = regex.exec(testContent)) !== null) {
    count++
    console.log(`\n📦 代码块 ${count}:`)
    console.log('  完整匹配:', match[0])
    console.log('  语言:', match[1] || 'text')
    console.log('  代码内容:', match[2])
    console.log('  代码长度:', match[2].length)
  }
  
  console.log(`\n✅ 找到 ${count} 个代码块`)
  
  // 测试替换
  console.log('\n🔄 测试替换...')
  const processed = testContent
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text'
      console.log(`  处理代码块: ${language}`)
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`
    })
  
  console.log('\n📄 处理后的内容:')
  console.log(processed)
}

// 运行测试
testCodeBlockRegex() 