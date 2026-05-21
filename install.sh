#!/bin/bash

# Nadesiko3 AI Enhanced Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/rabbit-hand/nadesiko3ai/main/install.sh | bash

set -e

echo "🚀 Nadesiko3 AI Enhanced Installation"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Create installation directory
INSTALL_DIR="$HOME/.nadesiko3-ai"
echo "📁 Installing to: $INSTALL_DIR"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download and install
echo "📦 Downloading Nadesiko3 AI Enhanced..."
if command -v wget &> /dev/null; then
    wget -O nadesiko3-ai.tar.gz "https://github.com/rabbit-hand/nadesiko3ai/archive/main.tar.gz"
elif command -v curl &> /dev/null; then
    curl -L -o nadesiko3-ai.tar.gz "https://github.com/rabbit-hand/nadesiko3ai/archive/main.tar.gz"
else
    echo "❌ Neither wget nor curl is available. Please install one of them."
    exit 1
fi

# Extract
echo "📂 Extracting..."
tar -xzf nadesiko3-ai.tar.gz
cd nadesiko3ai-main

# Install dependencies
echo "📚 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Create symbolic links for commands
echo "🔗 Creating command links..."
mkdir -p "$HOME/.local/bin"

for cmd in cnako3 nako3server nako3edit nako3-ai; do
    if [ -f "src/cnako3.mjs" ]; then
        ln -sf "$PWD/src/cnako3.mjs" "$HOME/.local/bin/$cmd"
        echo "✅ Created link: $cmd"
    fi
done

# Add to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "📝 Adding $HOME/.local/bin to PATH..."
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
fi

# Test installation
echo "🧪 Testing installation..."
if command -v nako3-ai &> /dev/null; then
    echo "✅ nako3-ai command is available"
    nako3-ai -e "「Hello, Nadesiko3 AI Enhanced! 😊」と表示"
else
    echo "⚠️  nako3-ai command not found in PATH. You may need to restart your shell."
fi

# Cleanup
echo "🧹 Cleaning up..."
cd ..
rm -f nadesiko3-ai.tar.gz
rm -rf nadesiko3ai-main

echo ""
echo "🎉 Installation completed!"
echo "================================"
echo "📚 Usage:"
echo "  nako3-ai script.nako3     # Run Nadesiko3 script"
echo "  nako3server               # Start web server"
echo "  nako3edit                 # Start editor"
echo ""
echo "📖 Documentation: https://github.com/rabbit-hand/nadesiko3ai"
echo "🔗 Data Science Demo: nako3-ai demo/datascience_demo_manual.nako3"
echo ""
echo "⚠️  If commands are not found, restart your shell or run:"
echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
