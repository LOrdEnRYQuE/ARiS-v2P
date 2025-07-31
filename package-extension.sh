#!/bin/bash

# ARiS VS Code Extension - Packaging Script
echo "📦 Packaging ARiS VS Code Extension"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in ARiS project root directory"
fi

# Navigate to VS Code extension directory
print_status "Setting up VS Code extension packaging..."
cd apps/vscode-extension

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf out/
rm -f *.vsix

# Install dependencies
print_status "Installing dependencies..."
npm install

# Compile the extension
print_status "Compiling extension..."
npm run compile

if [ $? -ne 0 ]; then
    print_error "Failed to compile extension"
fi

print_success "Extension compiled successfully"

# Package the extension
print_status "Packaging extension..."
npx vsce package --allow-missing-repository

if [ $? -ne 0 ]; then
    print_error "Failed to package extension"
fi

# Get the package name
PACKAGE_NAME=$(ls *.vsix 2>/dev/null | head -1)

if [ -z "$PACKAGE_NAME" ]; then
    print_error "No VSIX package found"
fi

print_success "Extension packaged successfully: $PACKAGE_NAME"

# Move package to project root
print_status "Moving package to project root..."
mv "$PACKAGE_NAME" ../../

# Return to project root
cd ../..

print_success "Extension packaging completed!"
echo ""
echo "📦 Package Information:"
echo "======================="
echo "Package: $PACKAGE_NAME"
echo "Size: $(du -h "$PACKAGE_NAME" | cut -f1)"
echo "Location: $(pwd)/$PACKAGE_NAME"
echo ""
echo "📋 Installation Instructions:"
echo "============================"
echo "1. Open VS Code"
echo "2. Go to Extensions (Ctrl+Shift+X)"
echo "3. Click '...' (More Actions)"
echo "4. Select 'Install from VSIX...'"
echo "5. Choose the file: $PACKAGE_NAME"
echo ""
echo "🎉 ARiS VS Code Extension is ready for distribution!" 