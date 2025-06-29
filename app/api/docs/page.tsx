import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function APIDocsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              API 文档
            </h1>
          <p className="text-lg text-muted-foreground">
            文本转图片服务的完整API文档，支持Markdown、HTML和纯文本渲染
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="endpoints">接口</TabsTrigger>
            <TabsTrigger value="examples">示例</TabsTrigger>
            <TabsTrigger value="themes">主题</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  🚀 服务特性
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-pink-600">📝 内容格式支持</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Markdown 语法完整支持</li>
                      <li>• HTML 标签渲染</li>
                      <li>• 纯文本格式化</li>
                      <li>• 代码高亮显示</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-purple-600">🎨 视觉设计</h3>
                    <ul className="text-sm space-y-1">
                      <li>• 萌系风格主题</li>
                      <li>• 自定义背景图片</li>
                      <li>• 多种预设主题</li>
                      <li>• 高质量PNG输出</li>
                    </ul>
                  </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  🔧 技术架构
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">🖥️</div>
                    <h3 className="font-semibold">Puppeteer</h3>
                    <p className="text-sm text-muted-foreground">真实浏览器渲染</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold">高性能</h3>
                    <p className="text-sm text-muted-foreground">快速图片生成</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl mb-2">🛡️</div>
                    <h3 className="font-semibold">安全可靠</h3>
                    <p className="text-sm text-muted-foreground">内容安全处理</p>
                  </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📡 生成图片接口
                </CardTitle>
                <CardDescription>
                  将文本内容转换为高质量PNG图片
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">POST</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">/api/generate-image</code>
                </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">请求参数</h3>
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left">参数</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">类型</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">必填</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">content</td>
                            <td className="border border-gray-200 px-4 py-2">string</td>
                            <td className="border border-gray-200 px-4 py-2">✅</td>
                            <td className="border border-gray-200 px-4 py-2">要渲染的内容</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">format</td>
                            <td className="border border-gray-200 px-4 py-2">string</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">内容格式：markdown | html | text</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">theme</td>
                            <td className="border border-gray-200 px-4 py-2">string</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">主题：cute | elegant | dark | fresh | warm | ocean</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">options</td>
                            <td className="border border-gray-200 px-4 py-2">object</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">渲染选项</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">options.width</td>
                            <td className="border border-gray-200 px-4 py-2">number</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">图片宽度（默认800）</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">options.height</td>
                            <td className="border border-gray-200 px-4 py-2">number</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">图片高度（默认600）</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">options.fontSize</td>
                            <td className="border border-gray-200 px-4 py-2">number</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">字体大小（默认18）</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-200 px-4 py-2 font-mono">options.backgroundImage</td>
                            <td className="border border-gray-200 px-4 py-2">string</td>
                            <td className="border border-gray-200 px-4 py-2">❌</td>
                            <td className="border border-gray-200 px-4 py-2">自定义背景图片URL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">响应格式</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">成功响应：</p>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <p className="text-sm font-mono">Content-Type: image/png</p>
                        <p className="text-sm text-muted-foreground">返回PNG图片二进制数据</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">错误响应：</p>
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                          {`{
  "error": "错误信息",
  "details": "详细错误描述"
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💡 使用示例
                </CardTitle>
                </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">基础Markdown渲染</h3>
                  <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
{`fetch('/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: '# 标题\\n\\n这是一段**粗体**文本。',
    format: 'markdown',
    theme: 'cute'
  })
})
.then(response => response.blob())
.then(blob => {
  const url = URL.createObjectURL(blob);
  const img = document.createElement('img');
  img.src = url;
  document.body.appendChild(img);
});`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">HTML内容渲染</h3>
                  <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
{`fetch('/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: '<h1>HTML标题</h1><p>这是HTML内容</p>',
    format: 'html',
    theme: 'elegant',
    options: {
      width: 1000,
      height: 800,
      fontSize: 20
    }
  })
});`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">自定义背景图片</h3>
                  <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
{`fetch('/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: '这是带有自定义背景的内容',
    format: 'text',
    theme: 'cute',
    options: {
      backgroundImage: 'https://example.com/background.jpg',
      width: 800,
      height: 600
    }
  })
});`}
                    </pre>
                  </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">cURL示例</h3>
                  <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
                      {`curl -X POST http://localhost:3000/api/generate-image \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "# 测试标题\\n\\n这是测试内容",
    "format": "markdown",
    "theme": "cute",
    "options": {
      "width": 800,
      "height": 600,
      "fontSize": 18
    }
  }' \\
  --output output.png`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 主题样式
                </CardTitle>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg border-2 border-pink-300 flex items-center justify-center">
                      <span className="text-2xl">💖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-pink-600">Cute 萌系</h3>
                      <p className="text-sm text-muted-foreground">粉色渐变背景，可爱风格</p>
                      <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-pink-500 rounded"></div>
                          <span className="text-xs">主色: #ff6b9d</span>
                    </div>
                    <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-300 rounded"></div>
                          <span className="text-xs">辅色: #ffb3d9</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600">Elegant 优雅</h3>
                      <p className="text-sm text-muted-foreground">蓝紫渐变背景，优雅风格</p>
                      <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs">主色: #667eea</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-xs">辅色: #764ba2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-gray-800 to-purple-900 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                      <span className="text-2xl">🌙</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600">Dark 暗夜</h3>
                      <p className="text-sm text-muted-foreground">深色渐变背景，暗夜风格</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-600 rounded"></div>
                          <span className="text-xs">主色: #805ad5</span>
                        </div>
                    <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-pink-600 rounded"></div>
                          <span className="text-xs">辅色: #d53f8c</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg border-2 border-green-300 flex items-center justify-center">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-600">Fresh 清新</h3>
                      <p className="text-sm text-muted-foreground">青绿渐变背景，清新风格</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-xs">主色: #38b2ac</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                          <span className="text-xs">辅色: #4fd1c7</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg border-2 border-orange-300 flex items-center justify-center">
                      <span className="text-2xl">☀️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-600">Warm 温暖</h3>
                      <p className="text-sm text-muted-foreground">橙黄渐变背景，温暖风格</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span className="text-xs">主色: #ed8936</span>
                        </div>
                    <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                          <span className="text-xs">辅色: #f6ad55</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <span className="text-2xl">🌊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600">Ocean 海洋</h3>
                      <p className="text-sm text-muted-foreground">蓝海渐变背景，海洋风格</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                          <span className="text-xs">主色: #3182ce</span>
                    </div>
                    <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-400 rounded"></div>
                          <span className="text-xs">辅色: #63b3ed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">自定义背景图片</h3>
                  <p className="text-sm text-muted-foreground">
                    除了预设主题，你还可以通过 <code className="bg-muted px-1 rounded">options.backgroundImage</code> 参数指定自定义背景图片URL。
                    图片会自动适应容器大小并添加适当的透明度效果。
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">注意事项：</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 图片URL必须是可公开访问的</li>
                      <li>• 支持常见图片格式：JPG、PNG、WebP等</li>
                      <li>• 建议使用高质量图片以获得最佳效果</li>
                      <li>• 图片会自动缩放以适应容器</li>
                    </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
