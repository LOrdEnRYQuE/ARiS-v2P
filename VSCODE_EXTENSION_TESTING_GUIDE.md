# ARiS VS Code Extension - Testing Guide

> **Complete testing guide for the ARiS VS Code extension**

## 🚀 Quick Start Testing

### **Step 1: Launch Extension in Development Mode**
```bash
# Run the setup script
./start-vscode-extension.sh

# Open VS Code in the extension directory
cd apps/vscode-extension
code .
```

### **Step 2: Start Debugging**
1. Open VS Code in `apps/vscode-extension` directory
2. Press `F5` or go to `Run > Start Debugging`
3. Select "Extension" from the dropdown
4. A new VS Code window will open with ARiS loaded

### **Step 3: Test Basic Commands**
1. Open Command Palette (`Cmd+Shift+P`)
2. Type "ARiS" to see all available commands
3. Start with "ARiS: Hello World"

## 🧪 **Comprehensive Testing Checklist**

### **✅ Basic Functionality Tests**

#### **1. Extension Activation**
- [ ] Extension loads without errors
- [ ] Status bar shows ARiS indicator
- [ ] Commands appear in Command Palette

#### **2. Hello World Command**
- [ ] Run "ARiS: Hello World"
- [ ] Verify welcome message appears
- [ ] Check output panel for confirmation

#### **3. Agent Management**
- [ ] Run "ARiS: Start Agent"
- [ ] Select different agents (Architectus, Scriba, etc.)
- [ ] Verify agent initialization messages
- [ ] Check for any error messages

### **✅ Code Analysis Tests**

#### **4. Real-time Analysis**
- [ ] Open `apps/vscode-extension/test-workspace/test.js`
- [ ] Verify quality indicators appear
- [ ] Check status bar shows quality score
- [ ] Look for inline suggestions

#### **5. Code Quality Indicators**
- [ ] Check color-coded quality decorations
- [ ] Verify issue highlighting works
- [ ] Test with different code quality levels

### **✅ Advanced Feature Tests**

#### **6. Blueprint Generation**
- [ ] Run "ARiS: Generate Blueprint"
- [ ] Enter project requirements
- [ ] Verify progress indicator
- [ ] Check output panel for results

#### **7. Code Generation**
- [ ] Run "ARiS: Generate Code"
- [ ] Enter file name
- [ ] Verify file creation
- [ ] Check generated code quality

#### **8. Multi-Agent Workflows**
- [ ] Test "ARiS: Enhanced Blueprint-to-Code Pipeline"
- [ ] Test "ARiS: Multi-Agent Coordination"
- [ ] Test "ARiS: Quality Feedback Loop"
- [ ] Test "ARiS: End-to-End Project Generation"

## 🔍 **Debugging and Troubleshooting**

### **Common Issues and Solutions**

#### **Issue: Extension doesn't activate**
```bash
# Check the extension logs
# In VS Code: Help > Toggle Developer Tools
# Look for any error messages in the console
```

#### **Issue: Commands not appearing**
```bash
# Verify package.json has correct command definitions
# Check activationEvents in package.json
# Ensure extension.ts is properly compiled
```

#### **Issue: Agent integration fails**
```bash
# Check if agent packages are properly linked
# Verify environment variables are set
# Check network connectivity for API calls
```

### **Debug Output**
The extension provides detailed logging:
- Check Output panel for "ARiS" channel
- Look for real-time analysis status
- Monitor agent initialization messages

## 📊 **Performance Testing**

### **Response Time Benchmarks**
- **Command Execution**: < 2 seconds
- **Real-time Analysis**: < 1 second
- **File Generation**: < 5 seconds
- **Multi-agent Workflows**: < 30 seconds

### **Memory Usage**
- Monitor memory usage during agent operations
- Check for memory leaks in long-running workflows
- Verify cleanup of resources

## 🎯 **User Experience Testing**

### **Interface Elements**
- [ ] Status bar indicators work correctly
- [ ] Progress indicators show during operations
- [ ] Error messages are clear and helpful
- [ ] Success messages provide useful feedback

### **Workflow Testing**
- [ ] End-to-end project generation works
- [ ] Code analysis provides actionable feedback
- [ ] Agent coordination handles complex tasks
- [ ] File operations work correctly

## 📝 **Test Results Template**

```markdown
## Test Results - [Date]

### Basic Functionality
- [ ] Extension Activation: ✅/❌
- [ ] Hello World Command: ✅/❌
- [ ] Agent Management: ✅/❌

### Code Analysis
- [ ] Real-time Analysis: ✅/❌
- [ ] Quality Indicators: ✅/❌
- [ ] Inline Suggestions: ✅/❌

### Advanced Features
- [ ] Blueprint Generation: ✅/❌
- [ ] Code Generation: ✅/❌
- [ ] Multi-agent Workflows: ✅/❌

### Performance
- [ ] Response Times: ✅/❌
- [ ] Memory Usage: ✅/❌
- [ ] Error Handling: ✅/❌

### Notes
- Any issues encountered:
- Performance observations:
- User experience feedback:
```

## 🚀 **Ready to Test!**

Your ARiS VS Code extension is now ready for comprehensive testing. Follow this guide to ensure all features work correctly and provide the best user experience.

**Next**: After testing, proceed to customize commands and add new features! 