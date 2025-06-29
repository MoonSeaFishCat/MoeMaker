#!/bin/bash

echo "🐳 Setting up Docker environment with fonts..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t text-to-image-service .

# Create a volume for fonts
echo "📁 Creating fonts volume..."
docker volume create text-to-image-fonts

# Run a temporary container to set up fonts
echo "🎨 Setting up fonts in container..."
docker run --rm \
  -v text-to-image-fonts:/app/public/fonts \
  text-to-image-service \
  sh -c "
    echo 'Setting up fonts in container...'
    
    # Download Noto fonts
    curl -L -o /app/public/fonts/NotoSansCJK-Regular.otf \
      'https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
    
    curl -L -o /app/public/fonts/SourceHanSans-Regular.otf \
      'https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Regular.otf'
    
    echo 'Fonts setup completed!'
    ls -la /app/public/fonts/
  "

echo "🚀 Starting the service..."
docker run -d \
  --name text-to-image-service \
  -p 3000:3000 \
  -v text-to-image-fonts:/app/public/fonts \
  text-to-image-service

echo "✅ Service started!"
echo "🌐 Access the service at: http://localhost:3000"
echo "📊 Check logs with: docker logs text-to-image-service"
echo "🛑 Stop with: docker stop text-to-image-service"
