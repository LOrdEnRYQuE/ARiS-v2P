# ARiS VS Code Extension - Customization Guide

> **Complete guide to customize and extend the ARiS VS Code extension**

## 🎯 **Customization Overview**

### **What You Can Customize**
- ✅ **Commands**: Add new commands and workflows
- ✅ **UI Elements**: Status bar, decorations, progress indicators
- ✅ **Agent Integration**: Connect to different AI agents
- ✅ **Analysis Features**: Custom code analysis rules
- ✅ **File Operations**: Custom file generation and manipulation

## 🔧 **Command Customization**

### **Adding New Commands**

#### **Step 1: Define Command in package.json**
```json
{
  "contributes": {
    "commands": [
      {
        "command": "aris.customCommand",
        "title": "ARiS: Custom Command"
      }
    ]
  }
}
```

#### **Step 2: Register Command in extension.ts**
```typescript
// Register custom command
let customCommandDisposable = vscode.commands.registerCommand('aris.customCommand', async () => {
    // Your custom command logic here
    vscode.window.showInformationMessage('Custom command executed!');
});

context.subscriptions.push(customCommandDisposable);
```

### **Example: Custom Code Review Command**
```typescript
// Custom code review command
let codeReviewDisposable = vscode.commands.registerCommand('aris.codeReview', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const code = editor.document.getText();
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "ARiS: Code Review",
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0 });
        
        try {
            // Custom code review logic
            const review = await performCustomCodeReview(code);
            
            progress.report({ increment: 100 });
            
            // Show results
            const output = vscode.window.createOutputChannel('ARiS Code Review');
            output.show();
            output.appendLine('=== Custom Code Review ===');
            output.appendLine(`Issues Found: ${review.issues.length}`);
            output.appendLine(`Suggestions: ${review.suggestions.length}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Code review failed: ${error}`);
        }
    });
});

context.subscriptions.push(codeReviewDisposable);
```

## 🎨 **UI Customization**

### **Status Bar Customization**
```typescript
// Custom status bar item
const customStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
customStatusBarItem.text = '$(code) ARiS Custom';
customStatusBarItem.tooltip = 'Custom ARiS feature';
customStatusBarItem.command = 'aris.customCommand';
customStatusBarItem.show();
context.subscriptions.push(customStatusBarItem);
```

### **Custom Decorations**
```typescript
// Custom text decorations
const customDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.findMatchBackground'),
    border: '1px solid',
    borderColor: new vscode.ThemeColor('editor.findMatchBorder')
});

// Apply custom decoration
editor.setDecorations(customDecoration, [new vscode.Range(0, 0, 0, 10)]);
```

### **Progress Indicators**
```typescript
// Custom progress with detailed steps
await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "ARiS: Custom Operation",
    cancellable: true
}, async (progress, token) => {
    progress.report({ increment: 0, message: 'Starting custom operation...' });
    
    // Step 1
    progress.report({ increment: 25, message: 'Step 1: Analyzing...' });
    await performStep1();
    
    // Step 2
    progress.report({ increment: 50, message: 'Step 2: Processing...' });
    await performStep2();
    
    // Step 3
    progress.report({ increment: 75, message: 'Step 3: Finalizing...' });
    await performStep3();
    
    progress.report({ increment: 100, message: 'Custom operation completed!' });
});
```

## 🤖 **Agent Integration Customization**

### **Custom Agent Workflow**
```typescript
// Custom agent workflow
async function customAgentWorkflow(requirements: string) {
    const agentManager = new AgentManager();
    
    // Step 1: Custom analysis
    const analysis = await agentManager.executeWorkflow('custom-analysis', { 
        requirements 
    });
    
    // Step 2: Custom generation
    const generation = await agentManager.executeWorkflow('custom-generation', { 
        requirements,
        analysis: analysis.data 
    });
    
    // Step 3: Custom validation
    const validation = await agentManager.executeWorkflow('custom-validation', { 
        requirements,
        generation: generation.data 
    });
    
    return {
        success: validation.success,
        data: validation.data
    };
}
```

### **Custom Agent Commands**
```typescript
// Custom agent command
let customAgentDisposable = vscode.commands.registerCommand('aris.customAgent', async () => {
    const agentType = await vscode.window.showQuickPick(
        ['CustomAgent1', 'CustomAgent2', 'CustomAgent3'],
        { placeHolder: 'Select custom agent' }
    );

    if (agentType) {
        // Custom agent logic
        const result = await executeCustomAgent(agentType);
        
        if (result.success) {
            vscode.window.showInformationMessage(`Custom agent ${agentType} executed successfully!`);
        } else {
            vscode.window.showErrorMessage(`Custom agent failed: ${result.error}`);
        }
    }
});

context.subscriptions.push(customAgentDisposable);
```

## 📊 **Analysis Customization**

### **Custom Code Analysis**
```typescript
// Custom code analysis function
async function performCustomCodeAnalysis(code: string, fileName: string) {
    const analysis = {
        quality: {
            score: 0,
            issues: [],
            suggestions: []
        },
        functions: [],
        complexity: 0,
        maintainability: 0
    };
    
    // Custom analysis logic
    const lines = code.split('\n');
    analysis.complexity = calculateComplexity(lines);
    analysis.maintainability = calculateMaintainability(lines);
    analysis.quality.score = calculateQualityScore(analysis);
    
    return analysis;
}

// Custom complexity calculation
function calculateComplexity(lines: string[]): number {
    let complexity = 0;
    
    for (const line of lines) {
        if (line.includes('if') || line.includes('for') || line.includes('while')) {
            complexity++;
        }
    }
    
    return complexity;
}
```

### **Custom Quality Rules**
```typescript
// Custom quality rules
const customQualityRules = {
    maxFunctionLength: 50,
    maxComplexity: 10,
    requiredComments: true,
    namingConventions: true
};

// Apply custom rules
function applyCustomQualityRules(code: string): any {
    const issues = [];
    const suggestions = [];
    
    // Check function length
    const functions = extractFunctions(code);
    functions.forEach(func => {
        if (func.lines.length > customQualityRules.maxFunctionLength) {
            issues.push({
                line: func.startLine,
                message: `Function too long (${func.lines.length} lines)`,
                severity: 'warning'
            });
        }
    });
    
    return { issues, suggestions };
}
```

## 📁 **File Operations Customization**

### **Custom File Generation**
```typescript
// Custom file generation
async function generateCustomFile(fileName: string, template: string) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error('No workspace folder found');
    }
    
    const filePath = path.join(workspaceFolder.uri.fsPath, fileName);
    
    // Custom file content generation
    const content = generateCustomContent(template);
    
    // Write file
    await fs.writeFile(filePath, content, 'utf8');
    
    // Open the generated file
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    
    return { success: true, filePath };
}

// Custom content generation
function generateCustomContent(template: string): string {
    const timestamp = new Date().toISOString();
    const user = process.env.USER || 'unknown';
    
    return template
        .replace('{{timestamp}}', timestamp)
        .replace('{{user}}', user)
        .replace('{{generator}}', 'ARiS Custom Generator');
}
```

### **Custom Project Templates**
```typescript
// Custom project template
const customProjectTemplate = {
    name: 'Custom Project',
    structure: {
        'src/': {
            'components/': {},
            'utils/': {},
            'styles/': {}
        },
        'tests/': {},
        'docs/': {},
        'config/': {}
    },
    files: {
        'package.json': generatePackageJson,
        'README.md': generateReadme,
        'src/index.js': generateIndex,
        'src/components/App.js': generateApp
    }
};

// Generate custom project
async function generateCustomProject(projectName: string, template: any) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        throw new Error('No workspace folder found');
    }
    
    const projectPath = path.join(workspaceFolder.uri.fsPath, projectName);
    
    // Create project structure
    await createProjectStructure(projectPath, template.structure);
    
    // Generate files
    for (const [fileName, generator] of Object.entries(template.files)) {
        const filePath = path.join(projectPath, fileName);
        const content = await generator(projectName);
        await fs.writeFile(filePath, content, 'utf8');
    }
    
    return { success: true, projectPath };
}
```

## 🔧 **Configuration Customization**

### **Extension Settings**
```json
{
  "contributes": {
    "configuration": {
      "title": "ARiS Extension",
      "properties": {
        "aris.customSetting": {
          "type": "string",
          "default": "default",
          "description": "Custom ARiS setting"
        },
        "aris.qualityThreshold": {
          "type": "number",
          "default": 80,
          "description": "Quality score threshold"
        }
      }
    }
  }
}
```

### **Accessing Settings**
```typescript
// Get custom settings
const config = vscode.workspace.getConfiguration('aris');
const customSetting = config.get('customSetting');
const qualityThreshold = config.get('qualityThreshold');

// Use settings in your code
if (qualityScore < qualityThreshold) {
    vscode.window.showWarningMessage('Code quality below threshold!');
}
```

## 🚀 **Advanced Customization Examples**

### **Custom Workflow Orchestration**
```typescript
// Custom workflow with multiple agents
async function customWorkflowOrchestration(requirements: string) {
    const agentManager = new AgentManager();
    
    // Phase 1: Analysis
    const analysis = await agentManager.executeWorkflow('analysis', { requirements });
    
    // Phase 2: Design
    const design = await agentManager.executeWorkflow('design', { 
        requirements, 
        analysis: analysis.data 
    });
    
    // Phase 3: Implementation
    const implementation = await agentManager.executeWorkflow('implementation', { 
        requirements,
        analysis: analysis.data,
        design: design.data 
    });
    
    // Phase 4: Testing
    const testing = await agentManager.executeWorkflow('testing', { 
        implementation: implementation.data 
    });
    
    return {
        success: testing.success,
        data: {
            analysis: analysis.data,
            design: design.data,
            implementation: implementation.data,
            testing: testing.data
        }
    };
}
```

### **Custom UI Components**
```typescript
// Custom webview panel
async function showCustomWebview() {
    const panel = vscode.window.createWebviewPanel(
        'arisCustom',
        'ARiS Custom View',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );
    
    panel.webview.html = getCustomWebviewContent();
    
    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'customAction':
                    handleCustomAction(message.data);
                    break;
            }
        },
        undefined,
        context.subscriptions
    );
}

function getCustomWebviewContent(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ARiS Custom View</title>
        </head>
        <body>
            <h1>ARiS Custom Interface</h1>
            <button onclick="sendMessage()">Custom Action</button>
            <script>
                function sendMessage() {
                    vscode.postMessage({
                        command: 'customAction',
                        data: { action: 'test' }
                    });
                }
            </script>
        </body>
        </html>
    `;
}
```

## 📝 **Customization Checklist**

### **Basic Customization**
- [ ] Add new commands to package.json
- [ ] Register commands in extension.ts
- [ ] Test command functionality
- [ ] Add command to Command Palette

### **UI Customization**
- [ ] Customize status bar items
- [ ] Add custom decorations
- [ ] Implement progress indicators
- [ ] Test UI responsiveness

### **Agent Integration**
- [ ] Connect to custom agents
- [ ] Implement custom workflows
- [ ] Add agent-specific commands
- [ ] Test agent communication

### **Analysis Features**
- [ ] Implement custom analysis rules
- [ ] Add quality metrics
- [ ] Create custom suggestions
- [ ] Test analysis accuracy

### **File Operations**
- [ ] Add custom file generators
- [ ] Implement project templates
- [ ] Add file manipulation features
- [ ] Test file operations

## 🎉 **Ready to Customize!**

Your ARiS VS Code extension is now ready for customization. Use this guide to add new features, modify existing functionality, and create a personalized development experience.

**Next**: After customization, proceed to package the extension for distribution! 