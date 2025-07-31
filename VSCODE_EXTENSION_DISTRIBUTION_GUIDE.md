# ARiS VS Code Extension - Distribution Guide

> **Complete guide to package, publish, and distribute the ARiS VS Code extension**

## 🎯 **Distribution Overview**

### **Distribution Options**
- ✅ **Local Installation**: Install VSIX file directly
- ✅ **VS Code Marketplace**: Publish to official marketplace
- ✅ **Private Distribution**: Share with team/organization
- ✅ **GitHub Releases**: Distribute via GitHub releases

## 📦 **Packaging the Extension**

### **Quick Package Command**
```bash
# Run the packaging script
./package-extension.sh
```

### **Manual Packaging Steps**
```bash
# Navigate to extension directory
cd apps/vscode-extension

# Clean previous builds
rm -rf out/
rm -f *.vsix

# Install dependencies
npm install

# Compile extension
npm run compile

# Package extension
npx vsce package --allow-missing-repository
```

### **Package Requirements**
- ✅ **Compiled JavaScript**: `out/extension.js`
- ✅ **Package.json**: Extension metadata
- ✅ **README.md**: Extension documentation
- ✅ **LICENSE**: License information
- ✅ **.vscodeignore**: Exclude unnecessary files

## 🚀 **Publishing to VS Code Marketplace**

### **Step 1: Create Publisher Account**
1. Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
2. Click "Sign in" and use your Microsoft account
3. Click "Publish extensions"
4. Create a publisher account

### **Step 2: Get Personal Access Token**
1. Go to [Azure DevOps](https://dev.azure.com/)
2. Create or select an organization
3. Go to User Settings > Personal Access Tokens
4. Create a new token with "Marketplace (Publish)" scope

### **Step 3: Login to VSCE**
```bash
# Install VSCE globally (if not already installed)
npm install -g @vscode/vsce

# Login with your publisher account
npx vsce login <publisher-name>
# Enter your Personal Access Token when prompted
```

### **Step 4: Publish Extension**
```bash
# Navigate to extension directory
cd apps/vscode-extension

# Publish the extension
npx vsce publish

# Or publish with specific version
npx vsce publish patch  # 1.0.0 -> 1.0.1
npx vsce publish minor  # 1.0.0 -> 1.1.0
npx vsce publish major  # 1.0.0 -> 2.0.0
```

### **Step 5: Verify Publication**
1. Check your extension on the [VS Code Marketplace](https://marketplace.visualstudio.com/)
2. Search for your extension name
3. Verify all information is correct

## 📋 **Extension Metadata Requirements**

### **Package.json Configuration**
```json
{
  "name": "aris-vscode-extension",
  "displayName": "ARiS - AI Agent Platform",
  "description": "Intelligent software development powered by multi-agent AI system",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other",
    "Programming Languages",
    "Snippets",
    "Extension Packs"
  ],
  "keywords": [
    "ai",
    "agent",
    "code-generation",
    "quality",
    "analysis",
    "automation"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/ARiS-v2P.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/ARiS-v2P/issues"
  },
  "homepage": "https://github.com/your-username/ARiS-v2P#readme",
  "license": "MIT",
  "icon": "images/icon.png",
  "galleryBanner": {
    "color": "#007ACC",
    "theme": "dark"
  }
}
```

### **README.md Requirements**
```markdown
# ARiS - AI Agent Platform for VS Code

> **Intelligent software development powered by multi-agent AI system**

## 🚀 Features

### **AI Agent Integration**
- **11 Specialized AI Agents**: Architectus, Scriba, Prometheus, Auditor, Genesis, Executor, and more
- **Multi-Agent Coordination**: Complex workflow orchestration
- **Real-time Analysis**: Live code quality assessment
- **Intelligent Code Generation**: Context-aware code creation

### **Development Tools**
- **Blueprint Generation**: Create project architecture from requirements
- **Code Quality Analysis**: Real-time quality scoring and suggestions
- **Enhanced Workflows**: End-to-end project generation
- **Quality Feedback Loop**: Continuous code improvement

## 📋 Commands

| Command | Description |
|---------|-------------|
| `ARiS: Hello World` | Welcome message and extension status |
| `ARiS: Start Agent` | Initialize specific AI agents |
| `ARiS: Generate Blueprint` | Create project architecture |
| `ARiS: Generate Code` | Generate code files |
| `ARiS: Enhanced Blueprint-to-Code Pipeline` | Complete workflow |
| `ARiS: Multi-Agent Coordination` | Complex task orchestration |
| `ARiS: Quality Feedback Loop` | Code improvement cycle |
| `ARiS: End-to-End Project Generation` | Full project creation |

## 🎯 Quick Start

1. **Install the Extension**: Search for "ARiS" in VS Code Extensions
2. **Open a Project**: Open any JavaScript/TypeScript project
3. **Start Using**: Use Command Palette (`Cmd+Shift+P`) and type "ARiS"
4. **Try Commands**: Start with "ARiS: Hello World"

## 📄 License

This extension is licensed under the MIT License.
```

## 🎨 **Visual Assets**

### **Icon Requirements**
- **Size**: 128x128 pixels
- **Format**: PNG
- **Location**: `images/icon.png`
- **Style**: Simple, recognizable, matches VS Code theme

### **Banner Requirements**
- **Size**: 1280x200 pixels
- **Format**: PNG
- **Location**: `images/banner.png`
- **Style**: Professional, showcases key features

### **Screenshots**
- **Size**: 1280x720 pixels
- **Format**: PNG
- **Location**: `images/screenshots/`
- **Content**: Show key features in action

## 📊 **Quality Checklist**

### **Before Publishing**
- [ ] Extension compiles without errors
- [ ] All commands work correctly
- [ ] UI elements display properly
- [ ] Error handling is implemented
- [ ] Documentation is complete
- [ ] License is included
- [ ] Repository is public (if open source)
- [ ] Issues template is set up

### **Marketplace Requirements**
- [ ] Clear description and features
- [ ] High-quality screenshots
- [ ] Proper categorization
- [ ] Accurate keywords
- [ ] Working demo/example
- [ ] Support information

## 🔧 **Local Distribution**

### **Install from VSIX**
```bash
# Package the extension
./package-extension.sh

# Install in VS Code
# 1. Open VS Code
# 2. Go to Extensions (Ctrl+Shift+X)
# 3. Click "..." (More Actions)
# 4. Select "Install from VSIX..."
# 5. Choose the .vsix file
```

### **Share with Team**
```bash
# Create distribution package
./package-extension.sh

# Share the .vsix file via:
# - Email
# - File sharing service
# - Internal repository
# - Team chat
```

## 🌐 **GitHub Releases**

### **Create Release**
```bash
# Tag the release
git tag v1.0.0

# Push the tag
git push origin v1.0.0

# Create GitHub release
# 1. Go to GitHub repository
# 2. Click "Releases"
# 3. Click "Create a new release"
# 4. Upload the .vsix file
# 5. Add release notes
```

### **Release Notes Template**
```markdown
## 🚀 ARiS VS Code Extension v1.0.0

### ✨ New Features
- Multi-agent AI integration
- Real-time code analysis
- Blueprint generation
- Code quality assessment
- Enhanced workflows

### 🔧 Commands Added
- ARiS: Hello World
- ARiS: Start Agent
- ARiS: Generate Blueprint
- ARiS: Generate Code
- ARiS: Enhanced Blueprint-to-Code Pipeline
- ARiS: Multi-Agent Coordination
- ARiS: Quality Feedback Loop
- ARiS: End-to-End Project Generation

### 🐛 Bug Fixes
- Fixed extension activation issues
- Improved error handling
- Enhanced UI responsiveness

### 📦 Installation
Download the .vsix file and install via VS Code Extensions panel.
```

## 📈 **Analytics and Monitoring**

### **Extension Analytics**
- **Installations**: Track download counts
- **Ratings**: Monitor user feedback
- **Reviews**: Read user comments
- **Usage**: Analyze feature usage

### **Performance Monitoring**
- **Startup Time**: Monitor extension activation
- **Memory Usage**: Track resource consumption
- **Error Rates**: Monitor crash reports
- **User Engagement**: Track command usage

## 🔄 **Update Process**

### **Version Management**
```bash
# Update version in package.json
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Package new version
./package-extension.sh

# Publish to marketplace
npx vsce publish
```

### **Changelog Management**
```markdown
# CHANGELOG.md

## [Unreleased]

## [1.0.0] - 2024-01-01
### Added
- Initial release
- Multi-agent AI integration
- Real-time code analysis
- Blueprint generation
- Code quality assessment

### Changed
- N/A

### Fixed
- N/A
```

## 🎯 **Distribution Checklist**

### **Pre-Publishing**
- [ ] Test extension thoroughly
- [ ] Update version number
- [ ] Update changelog
- [ ] Create release notes
- [ ] Package extension
- [ ] Test VSIX installation

### **Publishing**
- [ ] Login to VSCE
- [ ] Publish to marketplace
- [ ] Verify publication
- [ ] Create GitHub release
- [ ] Share with team

### **Post-Publishing**
- [ ] Monitor installations
- [ ] Respond to reviews
- [ ] Address issues
- [ ] Plan next release
- [ ] Update documentation

## 🎉 **Ready to Distribute!**

Your ARiS VS Code extension is now ready for distribution. Follow this guide to package, publish, and share your extension with the world!

**Next**: After distribution, monitor usage and plan future updates! 