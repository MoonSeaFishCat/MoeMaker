#!/bin/bash

echo "🎨 Installing fonts for text-to-image service..."

# Create fonts directory
mkdir -p public/fonts

# Function to download font if not exists
download_font() {
    local url=$1
    local filename=$2
    local filepath="public/fonts/$filename"
    
    if [ ! -f "$filepath" ]; then
        echo "📥 Downloading $filename..."
        curl -L -o "$filepath" "$url" || {
            echo "❌ Failed to download $filename"
            return 1
        }
        echo "✅ Downloaded $filename"
    else
        echo "✅ $filename already exists"
    fi
}

# Download Google Noto fonts (free and comprehensive)
echo "📦 Downloading Noto Sans CJK fonts..."

# Noto Sans CJK Regular (supports Chinese, Japanese, Korean)
download_font "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf" "NotoSansCJK-Regular.otf"

# Noto Sans CJK Bold
download_font "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf" "NotoSansCJK-Bold.otf"

# Alternative: Source Han Sans (Adobe's open source font)
echo "📦 Downloading Source Han Sans fonts..."
download_font "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/SimplifiedChinese/SourceHanSansSC-Regular.otf" "SourceHanSans-Regular.otf"

# System fonts detection and copying
echo "🔍 Detecting system fonts..."

# macOS fonts
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS, copying system fonts..."
    
    # PingFang SC (macOS default Chinese font)
    if [ -f "/System/Library/Fonts/PingFang.ttc" ]; then
        cp "/System/Library/Fonts/PingFang.ttc" "public/fonts/" 2>/dev/null || echo "⚠️ Could not copy PingFang.ttc"
    fi
    
    # Helvetica Neue
    if [ -f "/System/Library/Fonts/Helvetica Neue.ttc" ]; then
        cp "/System/Library/Fonts/Helvetica Neue.ttc" "public/fonts/" 2>/dev/null || echo "⚠️ Could not copy Helvetica Neue.ttc"
    fi
fi

# Windows fonts
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Detected Windows, copying system fonts..."
    
    # Microsoft YaHei
    if [ -f "/c/Windows/Fonts/msyh.ttc" ]; then
        cp "/c/Windows/Fonts/msyh.ttc" "public/fonts/Microsoft-YaHei.ttc" 2>/dev/null || echo "⚠️ Could not copy Microsoft YaHei"
    fi
    
    # SimHei
    if [ -f "/c/Windows/Fonts/simhei.ttf" ]; then
        cp "/c/Windows/Fonts/simhei.ttf" "public/fonts/SimHei.ttf" 2>/dev/null || echo "⚠️ Could not copy SimHei"
    fi
fi

# Linux fonts
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux, checking system fonts..."
    
    # Common Linux font paths
    font_paths=(
        "/usr/share/fonts"
        "/usr/local/share/fonts"
        "/home/$USER/.fonts"
        "/home/$USER/.local/share/fonts"
    )
    
    for font_path in "${font_paths[@]}"; do
        if [ -d "$font_path" ]; then
            # Look for Chinese fonts
            find "$font_path" -name "*han*" -o -name "*cjk*" -o -name "*chinese*" -o -name "*noto*" | head -5 | while read font_file; do
                if [ -f "$font_file" ]; then
                    font_name=$(basename "$font_file")
                    cp "$font_file" "public/fonts/$font_name" 2>/dev/null && echo "✅ Copied $font_name"
                fi
            done
        fi
    done
fi

# Create a fallback font (simple bitmap font for emergency)
echo "🔧 Creating fallback font configuration..."

cat > public/fonts/font-info.json << EOF
{
  "fonts": [
    {
      "family": "Noto Sans CJK",
      "file": "NotoSansCJK-Regular.otf",
      "weight": "normal",
      "style": "normal"
    },
    {
      "family": "Noto Sans CJK",
      "file": "NotoSansCJK-Bold.otf",
      "weight": "bold",
      "style": "normal"
    },
    {
      "family": "Source Han Sans",
      "file": "SourceHanSans-Regular.otf",
      "weight": "normal",
      "style": "normal"
    }
  ],
  "fallback": [
    "Noto Sans CJK",
    "Source Han Sans",
    "PingFang SC",
    "Microsoft YaHei",
    "SimHei",
    "Arial Unicode MS",
    "sans-serif"
  ]
}
EOF

echo "📊 Font installation summary:"
echo "📁 Fonts directory: $(pwd)/public/fonts"
echo "📄 Available fonts:"
ls -la public/fonts/ | grep -E '\.(ttf|otf|ttc)$' || echo "⚠️ No font files found"

echo ""
echo "🎉 Font installation completed!"
echo "💡 Tips:"
echo "   - Run 'npm run test-fonts' to test font rendering"
echo "   - Check the font-info.json for configuration details"
echo "   - Restart the server after font installation"
