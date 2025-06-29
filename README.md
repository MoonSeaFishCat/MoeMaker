# Text-to-Image Service

一个基于 Next.js 和 Puppeteer 的高性能文本转图片服务，支持 Markdown、HTML 和纯文本渲染，提供多种萌系风格主题。

## ✨ 功能特性

### 🎨 内容格式支持
- **Markdown 语法** - 完整的 Markdown 渲染支持
- **HTML 标签** - 原生 HTML 内容渲染
- **纯文本格式化** - 自动换行和格式化
- **代码高亮** - 语法高亮显示

### 🌈 视觉设计
- **6种主题风格** - Cute、Elegant、Dark、Fresh、Warm、Ocean
- **自定义背景图片** - 支持图片URL作为背景
- **萌系风格** - 可爱的设计风格
- **高质量PNG输出** - 清晰的图片质量

### ⚡ 技术特性
- **Puppeteer 渲染** - 真实浏览器渲染引擎
- **高性能** - 快速图片生成
- **跨平台** - 支持 Windows 和 Linux
- **类型安全** - TypeScript 开发

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Google Chrome 浏览器
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd text-to-image-service

# 安装依赖
pnpm install

# 安装字体 (可选)
pnpm run install-fonts
```

### 启动服务

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start
```

服务将在 `http://localhost:3000` 启动

## 📖 API 文档

### 生成图片接口

**POST** `/api/generate-image`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | ✅ | 要渲染的内容 |
| format | string | ❌ | 内容格式：markdown \| html \| text |
| theme | string | ❌ | 主题：cute \| elegant \| dark \| fresh \| warm \| ocean |
| options | object | ❌ | 渲染选项 |
| options.width | number | ❌ | 图片宽度（默认800） |
| options.height | number | ❌ | 图片高度（默认600） |
| options.fontSize | number | ❌ | 字体大小（默认18） |
| options.backgroundImage | string | ❌ | 自定义背景图片URL |

#### 响应格式

- **成功**: `Content-Type: image/png` - 返回PNG图片二进制数据
- **错误**: JSON格式错误信息

#### 使用示例

```javascript
// 基础Markdown渲染
fetch('/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: '# 标题\n\n这是一段**粗体**文本。',
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
});

// 自定义背景图片
fetch('/api/generate-image', {
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
});
```

```bash
# cURL示例
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 测试标题\n\n这是测试内容",
    "format": "markdown",
    "theme": "cute",
    "options": {
      "width": 800,
      "height": 600,
      "fontSize": 18
    }
  }' \
  --output output.png
```

## 🎨 主题样式

### Cute 萌系
- **主色**: #ff6b9d
- **辅色**: #ffb3d9
- **风格**: 粉色渐变背景，可爱风格

### Elegant 优雅
- **主色**: #667eea
- **辅色**: #764ba2
- **风格**: 蓝紫渐变背景，优雅风格

### Dark 暗夜
- **主色**: #805ad5
- **辅色**: #d53f8c
- **风格**: 深色渐变背景，暗夜风格

### Fresh 清新
- **主色**: #38b2ac
- **辅色**: #4fd1c7
- **风格**: 青绿渐变背景，清新风格

### Warm 温暖
- **主色**: #ed8936
- **辅色**: #f6ad55
- **风格**: 橙黄渐变背景，温暖风格

### Ocean 海洋
- **主色**: #3182ce
- **辅色**: #63b3ed
- **风格**: 蓝海渐变背景，海洋风格

## 🛠️ 开发

### 项目结构

```
text-to-image-service/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   │   ├── docs/          # API 文档页面
│   │   └── generate-image/ # 图片生成接口
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 布局组件
│   └── page.tsx           # 首页
├── components/            # UI 组件
│   └── ui/               # 基础组件
├── lib/                  # 工具库
├── scripts/              # 脚本文件
│   ├── test-all-themes.js # 主题测试
│   └── docker-*.sh       # Docker 脚本
└── public/               # 静态资源
```

### 测试

```bash
# 测试所有主题
node scripts/test-all-themes.js

# 测试自定义背景
node scripts/test-custom-background.js

# 测试无标题渲染
node scripts/test-no-title.js
```

### Docker 部署

```bash
# 构建镜像
docker build -t text-to-image-service .

# 运行容器
docker run -p 3000:3000 text-to-image-service
```

## 📝 许可证

本项目采用 **GNU Affero General Public License v3.0 (AGPLv3)** 许可证。

### AGPLv3 主要条款

- **开源要求**: 任何修改后的代码必须开源
- **网络服务条款**: 通过网络提供服务的修改版本也必须开源
- **专利授权**: 包含专利授权条款
- **商业友好**: 允许商业使用，但要求开源

### 许可证全文

完整的许可证文本请查看 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

- **项目地址**: [GitHub Repository]
- **问题反馈**: [GitHub Issues]
- **邮箱**: [your-email@example.com]

## 🙏 致谢

感谢以下开源项目的支持：

- [Next.js](https://nextjs.org/) - React 框架
- [Puppeteer](https://pptr.dev/) - 浏览器自动化
- [Marked](https://marked.js.org/) - Markdown 解析器
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库

---

⭐ 如果这个项目对你有帮助，请给它一个星标！ 