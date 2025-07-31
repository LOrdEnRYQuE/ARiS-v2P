#!/bin/bash

# ARiS VS Code Extension - Development Startup Script
# This script starts the VS Code extension in development mode

echo "🚀 Starting ARiS VS Code Extension in Development Mode"
echo "======================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in ARiS project root directory"
    exit 1
fi

# Navigate to VS Code extension directory
print_status "Setting up VS Code extension..."
cd apps/vscode-extension

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing VS Code extension dependencies..."
    npm install
fi

# Compile the extension
print_status "Compiling VS Code extension..."
npm run compile

if [ $? -eq 0 ]; then
    print_success "VS Code extension compiled successfully"
else
    echo "❌ Error: Failed to compile VS Code extension"
    exit 1
fi

# Create a simple test workspace
print_status "Creating test workspace..."
mkdir -p test-workspace
cd test-workspace

# Create a sample file for testing
cat > test.js << 'EOF'
// Sample JavaScript file for ARiS testing
function helloWorld() {
    console.log("Hello from ARiS!");
    return "Hello World";
}

// Test function with some issues
function badFunction() {
    var x = 10; // Using var instead of let/const
    if(x == 10) { // Using == instead of ===
        console.log("x is 10");
    }
}

module.exports = {
    helloWorld,
    badFunction
};
EOF

print_success "Test workspace created with sample file"

# Instructions for testing
echo ""
echo "🎯 VS Code Extension Development Mode"
echo "====================================="
echo ""
echo "The ARiS VS Code extension is now ready for development!"
echo ""
echo "📋 To test the extension:"
echo "1. Open VS Code"
echo "2. Press F5 or go to Run > Start Debugging"
echo "3. Select 'Extension' from the dropdown"
echo "4. A new VS Code window will open with the extension loaded"
echo ""
echo "🔧 Available Commands (in Command Palette):"
echo "- ARiS: Hello World"
echo "- ARiS: Start Agent"
echo "- ARiS: Generate Blueprint"
echo "- ARiS: Generate Code"
echo "- ARiS: Enhanced Blueprint-to-Code Pipeline"
echo "- ARiS: Multi-Agent Coordination"
echo "- ARiS: Quality Feedback Loop"
echo "- ARiS: End-to-End Project Generation"
echo ""
echo "📁 Test workspace created at: apps/vscode-extension/test-workspace"
echo "📄 Sample file: test.js (contains code for testing analysis)"
echo ""
echo "🚀 Ready to test ARiS VS Code extension!"

# Return to project root
cd ../..

print_success "VS Code extension development environment is ready!"
echo ""
echo "💡 Next steps:"
echo "1. Open VS Code in the apps/vscode-extension directory"
echo "2. Press F5 to start debugging"
echo "3. Test the extension commands"
echo "4. Check the output panel for results"
echo ""
echo "🎉 ARiS VS Code Extension is ready for development!" 