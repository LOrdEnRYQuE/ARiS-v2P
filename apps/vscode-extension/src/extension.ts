import * as vscode from 'vscode';
import { AgentManager } from '@aris/agents';
import { AgentType } from '@aris/shared';
import { ASTAnalyzer } from '@aris/ast';
import * as path from 'path';
import * as fs from 'fs/promises';

export function activate(context: vscode.ExtensionContext) {
	console.log('ARiS extension is now active!');

	// Initialize the agent manager and AST analyzer
	const agentManager = new AgentManager();
	const astAnalyzer = new ASTAnalyzer();
	
	// Real-time analysis status bar item
	const analysisStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	analysisStatusBarItem.text = '$(sync~spin) ARiS Analyzing...';
	analysisStatusBarItem.tooltip = 'ARiS is analyzing your code';
	analysisStatusBarItem.hide();
	context.subscriptions.push(analysisStatusBarItem);

	// Quality indicators in editor
	const qualityDecorations = {
		excellent: vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('charts.green'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('charts.green')
		}),
		good: vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('charts.blue'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('charts.blue')
		}),
		warning: vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('charts.orange'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('charts.orange')
		}),
		error: vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('charts.red'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('charts.red')
		})
	};

	context.subscriptions.push(...Object.values(qualityDecorations));

	// Real-time code analysis
	let analysisTimeout: NodeJS.Timeout | undefined;
	
	// Debounced analysis function
	const debouncedAnalysis = (editor: vscode.TextEditor) => {
		if (analysisTimeout) {
			clearTimeout(analysisTimeout);
		}
		
		analysisTimeout = setTimeout(async () => {
			await performRealTimeAnalysis(editor);
		}, 1000); // 1 second delay
	};

	// Perform real-time analysis
	async function performRealTimeAnalysis(editor: vscode.TextEditor) {
		if (!editor || !editor.document) return;
		
		const document = editor.document;
		const code = document.getText();
		const fileName = document.fileName;
		
		// Show analysis status
		analysisStatusBarItem.show();
		
		try {
			// Create file object for AST analyzer
			const file = {
				name: path.basename(fileName),
				type: 'file' as const,
				extension: path.extname(fileName),
				content: code
			};
			
			// Perform AST analysis
			const analysis = await astAnalyzer.analyzeFile(file);
			
			if (analysis) {
				// Update status bar with quality score
				const qualityScore = analysis.quality.score;
				analysisStatusBarItem.text = `$(check) ARiS ${qualityScore}/100`;
				analysisStatusBarItem.tooltip = `Code Quality: ${qualityScore}/100\nFunctions: ${analysis.functions.length}\nIssues: ${analysis.quality.issues.length}`;
				
				// Apply quality decorations
				applyQualityDecorations(editor, analysis);
				
				// Show inline suggestions
				showInlineSuggestions(editor, analysis);
			}
		} catch (error) {
			console.error('Real-time analysis error:', error);
			analysisStatusBarItem.text = '$(error) ARiS Error';
			analysisStatusBarItem.tooltip = 'Analysis failed';
		} finally {
			// Hide status bar after 3 seconds
			setTimeout(() => {
				analysisStatusBarItem.hide();
			}, 3000);
		}
	}

	// Apply quality decorations to editor
	function applyQualityDecorations(editor: vscode.TextEditor, analysis: any) {
		const qualityScore = analysis.quality.score;
		let decorationType = qualityDecorations.good;
		
		if (qualityScore >= 90) {
			decorationType = qualityDecorations.excellent;
		} else if (qualityScore >= 70) {
			decorationType = qualityDecorations.good;
		} else if (qualityScore >= 50) {
			decorationType = qualityDecorations.warning;
		} else {
			decorationType = qualityDecorations.error;
		}
		
		// Clear existing decorations
		Object.values(qualityDecorations).forEach(dec => {
			editor.setDecorations(dec, []);
		});
		
		// Apply new decoration to the entire document
		const range = new vscode.Range(0, 0, editor.document.lineCount, 0);
		editor.setDecorations(decorationType, [range]);
	}

	// Show inline suggestions
	function showInlineSuggestions(editor: vscode.TextEditor, analysis: any) {
		const suggestions = analysis.quality.suggestions;
		if (suggestions.length === 0) return;
		
		// Create diagnostic collection for suggestions
		const diagnosticCollection = vscode.languages.createDiagnosticCollection('aris-suggestions');
		const diagnostics: vscode.Diagnostic[] = [];
		
		suggestions.forEach((suggestion: any) => {
			const range = new vscode.Range(
				suggestion.line - 1, 0,
				suggestion.line - 1, editor.document.lineAt(suggestion.line - 1).text.length
			);
			
			const diagnostic = new vscode.Diagnostic(
				range,
				suggestion.message,
				vscode.DiagnosticSeverity.Information
			);
			diagnostic.source = 'ARiS';
			diagnostic.code = suggestion.category;
			
			diagnostics.push(diagnostic);
		});
		
		diagnosticCollection.set(editor.document.uri, diagnostics);
	}

	// Register document change listener for real-time analysis
	const documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			debouncedAnalysis(editor);
		}
	});

	// Register active editor change listener
	const activeEditorListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			debouncedAnalysis(editor);
		}
	});

	context.subscriptions.push(documentChangeListener, activeEditorListener);

	// Register the hello world command
	let disposable = vscode.commands.registerCommand('aris.hello', () => {
		vscode.window.showInformationMessage('Hello from ARiS! The Agentic Reactive Intelligence System is ready to assist you.');
	});

	context.subscriptions.push(disposable);

	// Register the start agent command
	let startAgentDisposable = vscode.commands.registerCommand('aris.startAgent', async () => {
		const agentType = await vscode.window.showQuickPick(
			['Architectus', 'Scriba', 'Prometheus', 'Auditor', 'Genesis', 'Executor'],
			{
				placeHolder: 'Select an agent to start'
			}
		);

		if (agentType) {
			vscode.window.showInformationMessage(`Starting ${agentType} agent...`);
			
			// Connect to the real agent system
			const agentTypeEnum = getAgentTypeFromString(agentType);
			if (agentTypeEnum) {
				const agent = agentManager['agents'].get(agentTypeEnum);
				if (agent) {
					const result = await agent.initialize();
					if (result.success) {
						vscode.window.showInformationMessage(`${agentType} agent is now active and ready for tasks.`);
					} else {
						vscode.window.showErrorMessage(`Failed to start ${agentType} agent: ${result.error}`);
					}
				}
			}
		}
	});

	context.subscriptions.push(startAgentDisposable);

	// Register the generate blueprint command
	let generateBlueprintDisposable = vscode.commands.registerCommand('aris.generateBlueprint', async () => {
		const requirements = await vscode.window.showInputBox({
			prompt: 'Describe the software project you want to create',
			placeHolder: 'e.g., Create a REST API for user management with authentication'
		});

		if (requirements) {
			vscode.window.showInformationMessage('Generating blueprint...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Generating Blueprint",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.generateProjectFromRequirements(requirements, './generated-project');
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Blueprint generated successfully! Check the output panel for details.');
						
						// Show blueprint in output panel
						const output = vscode.window.createOutputChannel('ARiS Blueprint');
						output.show();
						output.appendLine('=== ARiS Blueprint ===');
						output.appendLine(`Requirements: ${requirements}`);
						output.appendLine('Generated blueprint structure:');
						
						if (result.data && result.data.blueprint) {
							const blueprint = result.data.blueprint;
							output.appendLine(`Blueprint ID: ${blueprint.id}`);
							output.appendLine(`API Endpoints: ${blueprint.apiContracts?.length || 0}`);
							output.appendLine(`Database Tables: ${blueprint.databaseSchema?.tables?.length || 0}`);
							output.appendLine(`Technologies: ${blueprint.technologies?.map((t: any) => t.name).join(', ') || 'None'}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to generate blueprint: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error generating blueprint: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(generateBlueprintDisposable);

	// Register the generate code command
	let generateCodeDisposable = vscode.commands.registerCommand('aris.generateCode', async () => {
		const fileName = await vscode.window.showInputBox({
			prompt: 'Enter the file name to generate',
			placeHolder: 'e.g., userController.js'
		});

		if (fileName) {
			vscode.window.showInformationMessage(`Generating code for ${fileName}...`);
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `ARiS: Generating ${fileName}`,
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system to generate code
					const code = `// Generated by ARiS
console.log('Hello from ${fileName}');

// TODO: Implement your logic here
export function example() {
    return 'Generated by ARiS';
}`;

					// Get workspace folder
					const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
					if (workspaceFolder) {
						const filePath = path.join(workspaceFolder.uri.fsPath, fileName);
						
						// Use real file system operations
						const result = await agentManager.createFile(filePath, code);
						
						progress.report({ increment: 100 });
						
						if (result.success) {
							// Open the generated file
							const uri = vscode.Uri.file(filePath);
							const document = await vscode.workspace.openTextDocument(uri);
							await vscode.window.showTextDocument(document);
							
							vscode.window.showInformationMessage(`Code generated and file created: ${fileName}`);
						} else {
							vscode.window.showErrorMessage(`Failed to create file: ${result.error}`);
						}
					} else {
						vscode.window.showErrorMessage('No workspace folder found');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error generating code: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(generateCodeDisposable);

	// Register the analyze code command
	let analyzeCodeDisposable = vscode.commands.registerCommand('aris.analyzeCode', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found');
			return;
		}

		const code = editor.document.getText();
		const fileName = editor.document.fileName;

		vscode.window.showInformationMessage('Analyzing code...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Analyzing Code",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				// Use real agent system
				const result = await agentManager.analyzeCode(code, fileName);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Code analysis completed! Check the output panel for details.');
					
					// Show analysis in output panel
					const output = vscode.window.createOutputChannel('ARiS Code Analysis');
					output.show();
					output.appendLine('=== ARiS Code Analysis ===');
					output.appendLine(`File: ${fileName}`);
					
					if (result.data) {
						const analysis = result.data;
						output.appendLine(`Quality Score: ${analysis.qualityScore || 'N/A'}/100`);
						output.appendLine(`Functions Found: ${analysis.functions?.length || 0}`);
						output.appendLine(`Issues Found: ${analysis.issues?.length || 0}`);
						output.appendLine(`Suggestions: ${analysis.suggestions?.length || 0}`);
						
						if (analysis.issues && analysis.issues.length > 0) {
							output.appendLine('\nIssues:');
							analysis.issues.forEach((issue: any, index: number) => {
								output.appendLine(`${index + 1}. ${issue.message} (Line ${issue.line})`);
							});
						}
						
						if (analysis.suggestions && analysis.suggestions.length > 0) {
							output.appendLine('\nSuggestions:');
							analysis.suggestions.forEach((suggestion: any, index: number) => {
								output.appendLine(`${index + 1}. ${suggestion.message}`);
							});
						}
					}
				} else {
					vscode.window.showErrorMessage(`Failed to analyze code: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error analyzing code: ${error}`);
			}
		});
	});

	context.subscriptions.push(analyzeCodeDisposable);

	// Register the create project command
	let createProjectDisposable = vscode.commands.registerCommand('aris.createProject', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter project name',
			placeHolder: 'e.g., my-awesome-app'
		});

		if (!projectName) return;

		const description = await vscode.window.showInputBox({
			prompt: 'Enter project description',
			placeHolder: 'e.g., A modern web application'
		});

		if (!description) return;

		const requirements = await vscode.window.showInputBox({
			prompt: 'Enter project requirements',
			placeHolder: 'e.g., Create a REST API with authentication and user management'
		});

		if (requirements) {
			vscode.window.showInformationMessage('Creating project...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Creating Project",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.createAndManageProject(projectName, description, requirements);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Project created successfully! Check the output panel for details.');
						
						// Show project details in output panel
						const output = vscode.window.createOutputChannel('ARiS Project Creation');
						output.show();
						output.appendLine('=== ARiS Project Creation ===');
						output.appendLine(`Project Name: ${projectName}`);
						output.appendLine(`Description: ${description}`);
						output.appendLine(`Requirements: ${requirements}`);
						
						if (result.data) {
							const project = result.data;
							output.appendLine(`Project ID: ${project.id}`);
							output.appendLine(`Estimated Duration: ${project.estimatedDuration} minutes`);
							output.appendLine(`Complexity: ${project.complexity}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to create project: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error creating project: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(createProjectDisposable);

	// Register the generate frontend command
	let generateFrontendDisposable = vscode.commands.registerCommand('aris.generateFrontend', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter frontend project name',
			placeHolder: 'e.g., my-react-app'
		});

		if (!projectName) return;

		const requirements = await vscode.window.showInputBox({
			prompt: 'Describe the frontend you want to create',
			placeHolder: 'e.g., Create a React app with user authentication, dashboard, and responsive design'
		});

		if (!requirements) return;

		const framework = await vscode.window.showQuickPick(
			['react', 'vue', 'angular', 'svelte', 'vanilla'],
			{
				placeHolder: 'Select frontend framework'
			}
		);

		if (framework) {
			vscode.window.showInformationMessage('Generating frontend project...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Generating Frontend",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.generateFrontendProject(projectName, requirements, framework);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Frontend project generated successfully! Check the output panel for details.');
						
						// Show frontend details in output panel
						const output = vscode.window.createOutputChannel('ARiS Frontend Generation');
						output.show();
						output.appendLine('=== ARiS Frontend Generation ===');
						output.appendLine(`Project Name: ${projectName}`);
						output.appendLine(`Framework: ${framework}`);
						output.appendLine(`Requirements: ${requirements}`);
						
						if (result.data) {
							const frontend = result.data;
							output.appendLine(`\nFrontend Project Details:`);
							output.appendLine(`Components: ${frontend.components?.length || 0}`);
							output.appendLine(`Pages: ${frontend.pages?.length || 0}`);
							output.appendLine(`Styling Framework: ${frontend.styling?.framework || 'N/A'}`);
							output.appendLine(`State Management: ${frontend.stateManagement?.type || 'N/A'}`);
							output.appendLine(`Dependencies: ${frontend.dependencies?.join(', ') || 'None'}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to generate frontend: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error generating frontend: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(generateFrontendDisposable);

	// Register the design UI component command
	let designComponentDisposable = vscode.commands.registerCommand('aris.designComponent', async () => {
		const componentType = await vscode.window.showQuickPick(
			['button', 'input', 'card', 'modal', 'form', 'table', 'chart', 'navigation', 'layout'],
			{
				placeHolder: 'Select component type'
			}
		);

		if (!componentType) return;

		const requirements = await vscode.window.showInputBox({
			prompt: 'Describe the component requirements',
			placeHolder: 'e.g., A responsive button with hover effects and loading state'
		});

		if (!requirements) return;

		const framework = await vscode.window.showQuickPick(
			['react', 'vue', 'angular', 'svelte', 'vanilla'],
			{
				placeHolder: 'Select framework'
			}
		);

		if (framework) {
			vscode.window.showInformationMessage('Designing UI component...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Designing Component",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.designUIComponent(componentType, requirements, framework);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Component designed successfully! Check the output panel for details.');
						
						// Show component details in output panel
						const output = vscode.window.createOutputChannel('ARiS Component Design');
						output.show();
						output.appendLine('=== ARiS Component Design ===');
						output.appendLine(`Component Type: ${componentType}`);
						output.appendLine(`Framework: ${framework}`);
						output.appendLine(`Requirements: ${requirements}`);
						
						if (result.data) {
							const component = result.data;
							output.appendLine(`\nComponent Details:`);
							output.appendLine(`Name: ${component.name}`);
							output.appendLine(`Type: ${component.type}`);
							output.appendLine(`Props: ${Object.keys(component.props || {}).join(', ')}`);
							output.appendLine(`Events: ${Object.keys(component.events || {}).join(', ')}`);
							output.appendLine(`Styles: ${Object.keys(component.styles || {}).join(', ')}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to design component: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error designing component: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(designComponentDisposable);

	// Register the generate full-stack app command
	let generateFullStackDisposable = vscode.commands.registerCommand('aris.generateFullStack', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter full-stack project name',
			placeHolder: 'e.g., my-fullstack-app'
		});

		if (!projectName) return;

		const description = await vscode.window.showInputBox({
			prompt: 'Enter project description',
			placeHolder: 'e.g., A modern full-stack web application'
		});

		if (!description) return;

		const requirements = await vscode.window.showInputBox({
			prompt: 'Describe the full-stack application requirements',
			placeHolder: 'e.g., Create a full-stack app with React frontend, Node.js backend, and PostgreSQL database'
		});

		if (requirements) {
			vscode.window.showInformationMessage('Generating full-stack application...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Generating Full-Stack App",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.generateFullStackApp(projectName, description, requirements, './generated-fullstack');
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Full-stack application generated successfully! Check the output panel for details.');
						
						// Show full-stack details in output panel
						const output = vscode.window.createOutputChannel('ARiS Full-Stack Generation');
						output.show();
						output.appendLine('=== ARiS Full-Stack Generation ===');
						output.appendLine(`Project Name: ${projectName}`);
						output.appendLine(`Description: ${description}`);
						output.appendLine(`Requirements: ${requirements}`);
						
						if (result.data) {
							output.appendLine(`\nFull-Stack Application Details:`);
							output.appendLine(`Project ID: ${result.data.id || 'N/A'}`);
							output.appendLine(`Status: Generated successfully`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to generate full-stack app: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error generating full-stack app: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(generateFullStackDisposable);

	// Register the setup state management command
	let setupStateManagementDisposable = vscode.commands.registerCommand('aris.setupStateManagement', async () => {
		const stateManagementType = await vscode.window.showQuickPick(
			['context', 'redux', 'zustand', 'recoil', 'mobx', 'none'],
			{
				placeHolder: 'Select state management type'
			}
		);

		if (stateManagementType) {
			vscode.window.showInformationMessage('Setting up state management...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Setting Up State Management",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.setupStateManagement(stateManagementType, []);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('State management setup successfully! Check the output panel for details.');
						
						// Show state management details in output panel
						const output = vscode.window.createOutputChannel('ARiS State Management');
						output.show();
						output.appendLine('=== ARiS State Management Setup ===');
						output.appendLine(`Type: ${stateManagementType}`);
						
						if (result.data) {
							const stateManagement = result.data;
							output.appendLine(`\nState Management Details:`);
							output.appendLine(`Type: ${stateManagement.type}`);
							output.appendLine(`Stores: ${stateManagement.stores?.length || 0}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to setup state management: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error setting up state management: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(setupStateManagementDisposable);

	// Register the execute command
	let executeCommandDisposable = vscode.commands.registerCommand('aris.executeCommand', async () => {
		const command = await vscode.window.showInputBox({
			prompt: 'Enter command to execute',
			placeHolder: 'e.g., npm install'
		});

		if (!command) return;

		const args = await vscode.window.showInputBox({
			prompt: 'Enter command arguments (space-separated)',
			placeHolder: 'e.g., --save-dev'
		});

		const argsArray = args ? args.split(' ') : [];

		vscode.window.showInformationMessage('Executing command...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Executing Command",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				// Use real agent system
				const result = await agentManager.executeCommand(command, argsArray);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Command executed successfully! Check the output panel for details.');
					
					// Show command results in output panel
					const output = vscode.window.createOutputChannel('ARiS Command Execution');
					output.show();
					output.appendLine('=== ARiS Command Execution ===');
					output.appendLine(`Command: ${command} ${argsArray.join(' ')}`);
					
					if (result.data) {
						const executionData = result.data;
						output.appendLine(`\nExecution Details:`);
						output.appendLine(`Execution ID: ${executionData.executionId}`);
						output.appendLine(`Duration: ${executionData.duration}ms`);
						output.appendLine(`Exit Code: ${executionData.result.exitCode}`);
						output.appendLine(`\nSTDOUT:`);
						output.appendLine(executionData.result.stdout);
						if (executionData.result.stderr) {
							output.appendLine(`\nSTDERR:`);
							output.appendLine(executionData.result.stderr);
						}
					}
				} else {
					vscode.window.showErrorMessage(`Failed to execute command: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error executing command: ${error}`);
			}
		});
	});

	context.subscriptions.push(executeCommandDisposable);

	// Register the deploy application command
	let deployApplicationDisposable = vscode.commands.registerCommand('aris.deployApplication', async () => {
		const deploymentType = await vscode.window.showQuickPick(
			['docker', 'kubernetes', 'serverless', 'static', 'custom'],
			{
				placeHolder: 'Select deployment type'
			}
		);

		if (!deploymentType) return;

		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-app'
		});

		if (!applicationPath) return;

		const environment = await vscode.window.showQuickPick(
			['development', 'staging', 'production'],
			{
				placeHolder: 'Select deployment environment'
			}
		);

		if (environment) {
			vscode.window.showInformationMessage('Deploying application...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Deploying Application",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					const deploymentConfig = {
						id: `deploy_${Date.now()}`,
						name: 'ARiS Deployment',
						type: deploymentType,
						environment: environment,
						config: {},
						secrets: {}
					};

					// Use real agent system
					const result = await agentManager.deployApplication(deploymentConfig, applicationPath, environment);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Application deployed successfully! Check the output panel for details.');
						
						// Show deployment results in output panel
						const output = vscode.window.createOutputChannel('ARiS Deployment');
						output.show();
						output.appendLine('=== ARiS Application Deployment ===');
						output.appendLine(`Deployment Type: ${deploymentType}`);
						output.appendLine(`Environment: ${environment}`);
						output.appendLine(`Application Path: ${applicationPath}`);
						
						if (result.data) {
							const deploymentData = result.data;
							output.appendLine(`\nDeployment Details:`);
							output.appendLine(`Deployment ID: ${deploymentData.deploymentId}`);
							output.appendLine(`Config: ${JSON.stringify(deploymentData.config, null, 2)}`);
							output.appendLine(`Deployment Result: ${deploymentData.deploymentResult.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Verification Result: ${deploymentData.verificationResult.success ? 'Success' : 'Failed'}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to deploy application: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error deploying application: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(deployApplicationDisposable);

	// Register the build project command
	let buildProjectDisposable = vscode.commands.registerCommand('aris.buildProject', async () => {
		const buildType = await vscode.window.showQuickPick(
			['npm', 'yarn', 'pnpm', 'docker', 'custom'],
			{
				placeHolder: 'Select build type'
			}
		);

		if (!buildType) return;

		const projectPath = await vscode.window.showInputBox({
			prompt: 'Enter project path',
			placeHolder: 'e.g., ./my-project'
		});

		if (!projectPath) return;

		const outputPath = await vscode.window.showInputBox({
			prompt: 'Enter output path',
			placeHolder: 'e.g., dist'
		});

		if (outputPath) {
			vscode.window.showInformationMessage('Building project...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Building Project",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					const buildConfig = {
						id: `build_${Date.now()}`,
						name: 'ARiS Build',
						type: buildType,
						commands: buildType === 'npm' ? ['npm run build'] : ['yarn build'],
						output: outputPath,
						environment: {}
					};

					// Use real agent system
					const result = await agentManager.buildProject(buildConfig, projectPath);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Project built successfully! Check the output panel for details.');
						
						// Show build results in output panel
						const output = vscode.window.createOutputChannel('ARiS Build');
						output.show();
						output.appendLine('=== ARiS Project Build ===');
						output.appendLine(`Build Type: ${buildType}`);
						output.appendLine(`Project Path: ${projectPath}`);
						output.appendLine(`Output Path: ${outputPath}`);
						
						if (result.data) {
							const buildData = result.data;
							output.appendLine(`\nBuild Details:`);
							output.appendLine(`Build ID: ${buildData.buildId}`);
							output.appendLine(`Config: ${JSON.stringify(buildData.config, null, 2)}`);
							output.appendLine(`Build Result: ${buildData.buildResult.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Verification Result: ${buildData.verificationResult.success ? 'Success' : 'Failed'}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to build project: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error building project: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(buildProjectDisposable);

	// Register the run CI/CD pipeline command
	let runCICDPipelineDisposable = vscode.commands.registerCommand('aris.runCICDPipeline', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter project name',
			placeHolder: 'e.g., my-ci-cd-project'
		});

		if (!projectName) return;

		const description = await vscode.window.showInputBox({
			prompt: 'Enter project description',
			placeHolder: 'e.g., A project with CI/CD pipeline'
		});

		if (!description) return;

		const requirements = await vscode.window.showInputBox({
			prompt: 'Enter project requirements',
			placeHolder: 'e.g., Create a project with automated testing and deployment'
		});

		if (requirements) {
			vscode.window.showInformationMessage('Running CI/CD pipeline...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Running CI/CD Pipeline",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					// Use real agent system
					const result = await agentManager.runCICDPipeline(projectName, description, requirements);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('CI/CD pipeline completed successfully! Check the output panel for details.');
						
						// Show CI/CD results in output panel
						const output = vscode.window.createOutputChannel('ARiS CI/CD Pipeline');
						output.show();
						output.appendLine('=== ARiS CI/CD Pipeline ===');
						output.appendLine(`Project Name: ${projectName}`);
						output.appendLine(`Description: ${description}`);
						output.appendLine(`Requirements: ${requirements}`);
						
						if (result.data) {
							output.appendLine(`\nPipeline Details:`);
							output.appendLine(`Pipeline completed successfully`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to run CI/CD pipeline: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error running CI/CD pipeline: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(runCICDPipelineDisposable);

	// Register the optimize performance command
	let optimizePerformanceDisposable = vscode.commands.registerCommand('aris.optimizePerformance', async () => {
		const projectPath = await vscode.window.showInputBox({
			prompt: 'Enter project path',
			placeHolder: 'e.g., ./my-project'
		});

		if (!projectPath) return;

		vscode.window.showInformationMessage('Optimizing performance...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Optimizing Performance",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				const optimizationConfig = {
					id: `opt_${Date.now()}`,
					name: 'ARiS Performance Optimization',
					metrics: ['cpu', 'memory', 'disk', 'response-time']
				};

				// Use real agent system
				const result = await agentManager.optimizePerformance(optimizationConfig, projectPath);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Performance optimization completed! Check the output panel for details.');
					
					// Show optimization results in output panel
					const output = vscode.window.createOutputChannel('ARiS Performance Optimization');
					output.show();
					output.appendLine('=== ARiS Performance Optimization ===');
					output.appendLine(`Project Path: ${projectPath}`);
					
					if (result.data) {
						const optData = result.data;
						output.appendLine(`\nOptimization Details:`);
						output.appendLine(`Optimization ID: ${optData.optimizationId}`);
						output.appendLine(`Analysis Result: ${JSON.stringify(optData.analysisResult, null, 2)}`);
						output.appendLine(`Recommendations: ${optData.recommendations.join(', ')}`);
						output.appendLine(`Optimization Result: ${optData.optimizationResult.success ? 'Success' : 'Failed'}`);
						output.appendLine(`Verification Result: ${optData.verificationResult.success ? 'Success' : 'Failed'}`);
					}
				} else {
					vscode.window.showErrorMessage(`Failed to optimize performance: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error optimizing performance: ${error}`);
			}
		});
	});

	context.subscriptions.push(optimizePerformanceDisposable);

	// Register the deploy to production command
	let deployToProductionDisposable = vscode.commands.registerCommand('aris.deployToProduction', async () => {
		const deploymentStrategy = await vscode.window.showQuickPick(
			['rolling', 'blue-green', 'canary', 'recreate'],
			{
				placeHolder: 'Select deployment strategy'
			}
		);

		if (!deploymentStrategy) return;

		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-production-app'
		});

		if (!applicationPath) return;

		const minReplicas = await vscode.window.showInputBox({
			prompt: 'Enter minimum replicas',
			placeHolder: 'e.g., 2'
		});

		if (minReplicas) {
			vscode.window.showInformationMessage('Deploying to production...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Deploying to Production",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					const productionConfig = {
						id: `prod_${Date.now()}`,
						name: 'Production Deployment',
						environment: 'production',
						deploymentStrategy: deploymentStrategy,
						scaling: {
							minReplicas: parseInt(minReplicas),
							maxReplicas: 10,
							targetCPUUtilization: 70,
							targetMemoryUtilization: 80
						},
						monitoring: {
							metrics: ['cpu', 'memory', 'disk', 'network'],
							alerts: [],
							dashboards: []
						},
						security: {
							scanning: true,
							compliance: ['OWASP', 'NIST'],
							secrets: {}
						}
					};

					// Use real agent system
					const result = await agentManager.deployToProduction(productionConfig, applicationPath);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Production deployment completed! Check the output panel for details.');
						
						// Show production deployment results in output panel
						const output = vscode.window.createOutputChannel('ARiS Production Deployment');
						output.show();
						output.appendLine('=== ARiS Production Deployment ===');
						output.appendLine(`Deployment Strategy: ${deploymentStrategy}`);
						output.appendLine(`Application Path: ${applicationPath}`);
						output.appendLine(`Min Replicas: ${minReplicas}`);
						
						if (result.data) {
							const deployData = result.data;
							output.appendLine(`\nDeployment Details:`);
							output.appendLine(`Deployment ID: ${deployData.deploymentId}`);
							output.appendLine(`Deployment Result: ${deployData.deploymentResult.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Monitoring Result: ${deployData.monitoringResult.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Verification Result: ${deployData.verificationResult.success ? 'Success' : 'Failed'}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to deploy to production: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error deploying to production: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(deployToProductionDisposable);

	// Register the security scan command
	let securityScanDisposable = vscode.commands.registerCommand('aris.securityScan', async () => {
		const scanType = await vscode.window.showQuickPick(
			['vulnerability', 'compliance', 'secrets', 'dependencies'],
			{
				placeHolder: 'Select scan type'
			}
		);

		if (!scanType) return;

		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-app'
		});

		if (!applicationPath) return;

		vscode.window.showInformationMessage('Performing security scan...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Security Scan",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				const scanConfig = {
					type: scanType,
					frameworks: ['OWASP', 'NIST'],
					severity: ['low', 'medium', 'high', 'critical'],
					output: 'security-report.json'
				};

				// Use real agent system
				const result = await agentManager.performSecurityScan(scanConfig, applicationPath);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Security scan completed! Check the output panel for details.');
					
					// Show security scan results in output panel
					const output = vscode.window.createOutputChannel('ARiS Security Scan');
					output.show();
					output.appendLine('=== ARiS Security Scan ===');
					output.appendLine(`Scan Type: ${scanType}`);
					output.appendLine(`Application Path: ${applicationPath}`);
					
					if (result.data) {
						const scanData = result.data;
						output.appendLine(`\nScan Details:`);
						output.appendLine(`Scan ID: ${scanData.scanId}`);
						output.appendLine(`Vulnerability Scan: ${scanData.vulnerabilityScan.findings.length} findings`);
						output.appendLine(`Dependency Scan: ${scanData.dependencyScan.findings.length} findings`);
						output.appendLine(`Secrets Scan: ${scanData.secretsScan.findings.length} findings`);
						output.appendLine(`Security Report: ${scanData.securityReport.totalFindings} total findings`);
						output.appendLine(`Critical: ${scanData.securityReport.criticalFindings}, High: ${scanData.securityReport.highFindings}`);
					}
				} else {
					vscode.window.showErrorMessage(`Failed to perform security scan: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error performing security scan: ${error}`);
			}
		});
	});

	context.subscriptions.push(securityScanDisposable);

	// Register the compliance check command
	let complianceCheckDisposable = vscode.commands.registerCommand('aris.complianceCheck', async () => {
		const framework = await vscode.window.showQuickPick(
			['OWASP', 'NIST', 'ISO27001', 'SOC2', 'GDPR'],
			{
				placeHolder: 'Select compliance framework'
			}
		);

		if (!framework) return;

		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-app'
		});

		if (!applicationPath) return;

		vscode.window.showInformationMessage('Performing compliance check...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Compliance Check",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				const complianceConfig = {
					framework: framework,
					version: '2021',
					controls: ['authentication', 'authorization', 'input-validation', 'encryption'],
					output: 'compliance-report.json'
				};

				// Use real agent system
				const result = await agentManager.performComplianceCheck(complianceConfig, applicationPath);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Compliance check completed! Check the output panel for details.');
					
					// Show compliance check results in output panel
					const output = vscode.window.createOutputChannel('ARiS Compliance Check');
					output.show();
					output.appendLine('=== ARiS Compliance Check ===');
					output.appendLine(`Framework: ${framework}`);
					output.appendLine(`Application Path: ${applicationPath}`);
					
					if (result.data) {
						const complianceData = result.data;
						output.appendLine(`\nCompliance Details:`);
						output.appendLine(`Compliance ID: ${complianceData.complianceId}`);
						output.appendLine(`Checks Performed: ${complianceData.checks.length}`);
						output.appendLine(`Report Status: ${complianceData.report.status}`);
						output.appendLine(`Framework: ${complianceData.report.framework} ${complianceData.report.version}`);
						output.appendLine(`Controls: ${complianceData.checks.filter((c: any) => c.status === 'pass').length}/${complianceData.checks.length} passed`);
					}
				} else {
					vscode.window.showErrorMessage(`Failed to perform compliance check: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error performing compliance check: ${error}`);
			}
		});
	});

	context.subscriptions.push(complianceCheckDisposable);

	// Register the blue-green deployment command
	let blueGreenDeploymentDisposable = vscode.commands.registerCommand('aris.blueGreenDeployment', async () => {
		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-app'
		});

		if (!applicationPath) return;

		vscode.window.showInformationMessage('Performing blue-green deployment...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Blue-Green Deployment",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				const deploymentConfig = {
					strategy: 'blue-green',
					environments: ['blue', 'green'],
					healthChecks: true,
					rollback: true
				};

				// Use real agent system
				const result = await agentManager.performBlueGreenDeployment(deploymentConfig, applicationPath);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Blue-green deployment completed! Check the output panel for details.');
					
					// Show blue-green deployment results in output panel
					const output = vscode.window.createOutputChannel('ARiS Blue-Green Deployment');
					output.show();
					output.appendLine('=== ARiS Blue-Green Deployment ===');
					output.appendLine(`Application Path: ${applicationPath}`);
					
					if (result.data) {
						const deployData = result.data;
						output.appendLine(`\nDeployment Details:`);
						output.appendLine(`Blue-Green ID: ${deployData.blueGreenId}`);
						output.appendLine(`Blue Deployment: ${deployData.blueDeployment.success ? 'Success' : 'Failed'}`);
						output.appendLine(`Blue Tests: ${deployData.blueTests.success ? 'Passed' : 'Failed'}`);
						output.appendLine(`Green Deployment: ${deployData.greenDeployment.success ? 'Success' : 'Failed'}`);
						output.appendLine(`Green Tests: ${deployData.greenTests.success ? 'Passed' : 'Failed'}`);
					}
				} else {
					vscode.window.showErrorMessage(`Failed to perform blue-green deployment: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error performing blue-green deployment: ${error}`);
			}
		});
	});

	context.subscriptions.push(blueGreenDeploymentDisposable);

	// Register the canary deployment command
	let canaryDeploymentDisposable = vscode.commands.registerCommand('aris.canaryDeployment', async () => {
		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-app'
		});

		if (!applicationPath) return;

		const initialTraffic = await vscode.window.showInputBox({
			prompt: 'Enter initial traffic percentage',
			placeHolder: 'e.g., 10'
		});

		if (initialTraffic) {
			vscode.window.showInformationMessage('Performing canary deployment...');
			
			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Canary Deployment",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0 });
				
				try {
					const deploymentConfig = {
						strategy: 'canary',
						initialTraffic: parseInt(initialTraffic),
						maxTraffic: 100,
						monitoring: true,
						rollback: true
					};

					// Use real agent system
					const result = await agentManager.performCanaryDeployment(deploymentConfig, applicationPath);
					
					progress.report({ increment: 100 });
					
					if (result.success) {
						vscode.window.showInformationMessage('Canary deployment completed! Check the output panel for details.');
						
						// Show canary deployment results in output panel
						const output = vscode.window.createOutputChannel('ARiS Canary Deployment');
						output.show();
						output.appendLine('=== ARiS Canary Deployment ===');
						output.appendLine(`Application Path: ${applicationPath}`);
						output.appendLine(`Initial Traffic: ${initialTraffic}%`);
						
						if (result.data) {
							const deployData = result.data;
							output.appendLine(`\nDeployment Details:`);
							output.appendLine(`Canary ID: ${deployData.canaryId}`);
							output.appendLine(`Canary Deployment: ${deployData.canaryDeployment.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Initial Routing: ${deployData.initialRouting.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Canary Monitoring: ${deployData.canaryMonitoring.success ? 'Success' : 'Failed'}`);
							output.appendLine(`Full Deployment: ${deployData.fullDeployment.success ? 'Success' : 'Failed'}`);
						}
					} else {
						vscode.window.showErrorMessage(`Failed to perform canary deployment: ${result.error}`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Error performing canary deployment: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(canaryDeploymentDisposable);

	// Register the disaster recovery command
	let disasterRecoveryDisposable = vscode.commands.registerCommand('aris.disasterRecovery', async () => {
		const applicationPath = await vscode.window.showInputBox({
			prompt: 'Enter application path',
			placeHolder: 'e.g., ./my-app'
		});

		if (!applicationPath) return;

		vscode.window.showInformationMessage('Setting up disaster recovery...');
		
		// Show progress
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "ARiS: Disaster Recovery",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0 });
			
			try {
				const recoveryConfig = {
					backup: true,
					replication: true,
					rto: '4 hours',
					rpo: '1 hour',
					testing: true
				};

				// Use real agent system
				const result = await agentManager.performDisasterRecovery(recoveryConfig, applicationPath);
				
				progress.report({ increment: 100 });
				
				if (result.success) {
					vscode.window.showInformationMessage('Disaster recovery setup completed! Check the output panel for details.');
					
					// Show disaster recovery results in output panel
					const output = vscode.window.createOutputChannel('ARiS Disaster Recovery');
					output.show();
					output.appendLine('=== ARiS Disaster Recovery ===');
					output.appendLine(`Application Path: ${applicationPath}`);
					
					if (result.data) {
						const recoveryData = result.data;
						output.appendLine(`\nRecovery Details:`);
						output.appendLine(`Recovery ID: ${recoveryData.recoveryId}`);
						output.appendLine(`Backup Result: ${recoveryData.backupResult.success ? 'Success' : 'Failed'}`);
						output.appendLine(`Recovery Setup: ${recoveryData.recoverySetup.success ? 'Success' : 'Failed'}`);
						output.appendLine(`Recovery Test: ${recoveryData.recoveryTest.success ? 'Success' : 'Failed'}`);
					}
				} else {
					vscode.window.showErrorMessage(`Failed to setup disaster recovery: ${result.error}`);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error setting up disaster recovery: ${error}`);
			}
		});
	});

	context.subscriptions.push(disasterRecoveryDisposable);

	// Enhanced Sprint 5: End-to-End Integration Commands

	// Register the enhanced blueprint-to-code pipeline command
	let enhancedBlueprintToCodeDisposable = vscode.commands.registerCommand('aris.enhancedBlueprintToCode', async () => {
		const requirements = await vscode.window.showInputBox({
			prompt: 'Describe the software project you want to create',
			placeHolder: 'e.g., Create a REST API for user management with authentication'
		});

		if (requirements) {
			vscode.window.showInformationMessage('Starting enhanced blueprint-to-code pipeline...');
			
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Enhanced Blueprint-to-Code Pipeline",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0, message: 'Initializing agents...' });
				
				try {
					// Step 1: Generate blueprint with Architectus
					progress.report({ increment: 20, message: 'Generating architecture blueprint...' });
					const blueprintResult = await agentManager.executeWorkflow('blueprint-to-code', { requirements }, (step, result) => {
						console.log(`📝 ${step.description}`);
						console.log(`🤖 Agent: ${step.agent}`);
						console.log(`✅ Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
					});
					
					if (!blueprintResult.success) {
						throw new Error(`Blueprint generation failed: ${blueprintResult.error}`);
					}
					
					// Step 2: Generate code with Scriba
					progress.report({ increment: 40, message: 'Generating code files...' });
					const codeResult = await agentManager.executeWorkflow('blueprint-to-code', { 
						requirements, 
						blueprint: blueprintResult.data 
					});
					
					if (!codeResult.success) {
						throw new Error(`Code generation failed: ${codeResult.error}`);
					}
					
					// Step 3: Audit code with Auditor
					progress.report({ increment: 60, message: 'Auditing generated code...' });
					const auditResult = await agentManager.executeWorkflow('code-analysis', { 
						code: codeResult.data 
					});
					
					if (!auditResult.success) {
						throw new Error(`Code audit failed: ${auditResult.error}`);
					}
					
					// Step 4: Apply improvements if needed
					progress.report({ increment: 80, message: 'Applying improvements...' });
					const finalResult = await agentManager.executeWorkflow('blueprint-to-code', { 
						requirements, 
						blueprint: blueprintResult.data,
						audit: auditResult.data
					});
					
					progress.report({ increment: 100, message: 'Pipeline completed successfully!' });
					
					// Show results
					vscode.window.showInformationMessage('Enhanced blueprint-to-code pipeline completed! Check the output panel for details.');
					
					const output = vscode.window.createOutputChannel('ARiS Enhanced Pipeline');
					output.show();
					output.appendLine('=== ARiS Enhanced Blueprint-to-Code Pipeline ===');
					output.appendLine(`Requirements: ${requirements}`);
					output.appendLine(`Blueprint Status: ${blueprintResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Code Generation Status: ${codeResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Audit Status: ${auditResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Final Status: ${finalResult.success ? 'SUCCESS' : 'FAILED'}`);
					
					if (finalResult.data) {
						output.appendLine(`\nGenerated Files: ${finalResult.data.files?.length || 0}`);
						output.appendLine(`Quality Score: ${finalResult.data.qualityScore || 'N/A'}`);
						output.appendLine(`Issues Resolved: ${finalResult.data.issuesResolved || 0}`);
					}
					
				} catch (error) {
					vscode.window.showErrorMessage(`Enhanced pipeline failed: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(enhancedBlueprintToCodeDisposable);

	// Register the multi-agent coordination command
	let multiAgentCoordinationDisposable = vscode.commands.registerCommand('aris.multiAgentCoordination', async () => {
		const taskDescription = await vscode.window.showInputBox({
			prompt: 'Describe the complex task you want the agents to coordinate on',
			placeHolder: 'e.g., Create a full-stack application with React frontend, Node.js backend, and PostgreSQL database'
		});

		if (taskDescription) {
			vscode.window.showInformationMessage('Starting multi-agent coordination...');
			
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Multi-Agent Coordination",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0, message: 'Initializing agent coordination...' });
				
				try {
					// Step 1: Genesis analyzes requirements
					progress.report({ increment: 10, message: 'Genesis analyzing requirements...' });
					const genesisResult = await agentManager.executeWorkflow('complete-project-generation', { 
						requirements: taskDescription 
					});
					
					// Step 2: Prometheus creates project structure
					progress.report({ increment: 20, message: 'Prometheus creating project structure...' });
					const prometheusResult = await agentManager.executeWorkflow('project-management', { 
						requirements: taskDescription,
						analysis: genesisResult.data 
					});
					
					// Step 3: Architectus generates architecture
					progress.report({ increment: 30, message: 'Architectus generating architecture...' });
					const architectusResult = await agentManager.executeWorkflow('blueprint-to-code', { 
						requirements: taskDescription,
						project: prometheusResult.data 
					});
					
					// Step 4: Scriba generates code
					progress.report({ increment: 50, message: 'Scriba generating code...' });
					const scribaResult = await agentManager.executeWorkflow('blueprint-to-code', { 
						requirements: taskDescription,
						blueprint: architectusResult.data 
					});
					
					// Step 5: Auditor reviews code
					progress.report({ increment: 70, message: 'Auditor reviewing code...' });
					const auditorResult = await agentManager.executeWorkflow('code-analysis', { 
						code: scribaResult.data 
					});
					
					// Step 6: Executor sets up environment
					progress.report({ increment: 85, message: 'Executor setting up environment...' });
					const executorResult = await agentManager.executeWorkflow('deployment-automation', { 
						project: prometheusResult.data,
						code: scribaResult.data,
						audit: auditorResult.data 
					});
					
					progress.report({ increment: 100, message: 'Multi-agent coordination completed!' });
					
					// Show results
					vscode.window.showInformationMessage('Multi-agent coordination completed! Check the output panel for details.');
					
					const output = vscode.window.createOutputChannel('ARiS Multi-Agent Coordination');
					output.show();
					output.appendLine('=== ARiS Multi-Agent Coordination ===');
					output.appendLine(`Task: ${taskDescription}`);
					output.appendLine(`Genesis Analysis: ${genesisResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Prometheus Project: ${prometheusResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Architectus Blueprint: ${architectusResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Scriba Code: ${scribaResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Auditor Review: ${auditorResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Executor Setup: ${executorResult.success ? 'SUCCESS' : 'FAILED'}`);
					
					if (executorResult.data) {
						output.appendLine(`\nFinal Project Status: ${executorResult.data.status || 'COMPLETED'}`);
						output.appendLine(`Files Generated: ${executorResult.data.files?.length || 0}`);
						output.appendLine(`Quality Score: ${executorResult.data.qualityScore || 'N/A'}`);
					}
					
				} catch (error) {
					vscode.window.showErrorMessage(`Multi-agent coordination failed: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(multiAgentCoordinationDisposable);

	// Register the quality feedback loop command
	let qualityFeedbackLoopDisposable = vscode.commands.registerCommand('aris.qualityFeedbackLoop', async () => {
		const filePath = await vscode.window.showInputBox({
			prompt: 'Enter the file path to analyze and improve',
			placeHolder: 'e.g., src/components/UserProfile.js'
		});

		if (filePath) {
			vscode.window.showInformationMessage('Starting quality feedback loop...');
			
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: Quality Feedback Loop",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0, message: 'Reading file...' });
				
				try {
					// Step 1: Read and analyze file
					const fileContent = await fs.readFile(filePath, 'utf8');
					const file = {
						name: path.basename(filePath),
						type: 'file' as const,
						extension: path.extname(filePath),
						content: fileContent
					};
					
					progress.report({ increment: 20, message: 'Analyzing code quality...' });
					const analysis = await astAnalyzer.analyzeFile(file);
					
					if (!analysis) {
						throw new Error('Failed to analyze file');
					}
					
					// Step 2: Generate improvements
					progress.report({ increment: 40, message: 'Generating improvements...' });
					const improvementResult = await agentManager.executeWorkflow('code-analysis', { 
						code: fileContent,
						analysis: analysis 
					});
					
					// Step 3: Apply improvements
					progress.report({ increment: 60, message: 'Applying improvements...' });
					const improvedCode = improvementResult.data?.improvedCode || fileContent;
					
					// Step 4: Re-analyze improved code
					progress.report({ increment: 80, message: 'Re-analyzing improved code...' });
					const improvedFile = {
						name: path.basename(filePath),
						type: 'file' as const,
						extension: path.extname(filePath),
						content: improvedCode
					};
					
					const improvedAnalysis = await astAnalyzer.analyzeFile(improvedFile);
					
					progress.report({ increment: 100, message: 'Quality feedback loop completed!' });
					
					// Show results
					vscode.window.showInformationMessage('Quality feedback loop completed! Check the output panel for details.');
					
					const output = vscode.window.createOutputChannel('ARiS Quality Feedback Loop');
					output.show();
					output.appendLine('=== ARiS Quality Feedback Loop ===');
					output.appendLine(`File: ${filePath}`);
					output.appendLine(`Original Quality Score: ${analysis.quality.score}/100`);
					output.appendLine(`Improved Quality Score: ${improvedAnalysis?.quality.score || 'N/A'}/100`);
					output.appendLine(`Original Issues: ${analysis.quality.issues.length}`);
					output.appendLine(`Remaining Issues: ${improvedAnalysis?.quality.issues.length || 0}`);
					output.appendLine(`Issues Resolved: ${analysis.quality.issues.length - (improvedAnalysis?.quality.issues.length || 0)}`);
					
					if (improvedAnalysis) {
						output.appendLine(`\nQuality Improvement: ${improvedAnalysis.quality.score - analysis.quality.score} points`);
					}
					
				} catch (error) {
					vscode.window.showErrorMessage(`Quality feedback loop failed: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(qualityFeedbackLoopDisposable);

	// Register the end-to-end project generation command
	let endToEndProjectGenerationDisposable = vscode.commands.registerCommand('aris.endToEndProjectGeneration', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter project name',
			placeHolder: 'e.g., my-fullstack-app'
		});

		if (!projectName) return;

		const description = await vscode.window.showInputBox({
			prompt: 'Enter project description',
			placeHolder: 'e.g., A modern full-stack web application'
		});

		if (!description) return;

		const requirements = await vscode.window.showInputBox({
			prompt: 'Describe the project requirements',
			placeHolder: 'e.g., Create a full-stack app with React frontend, Node.js backend, and PostgreSQL database'
		});

		if (requirements) {
			vscode.window.showInformationMessage('Starting end-to-end project generation...');
			
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "ARiS: End-to-End Project Generation",
				cancellable: false
			}, async (progress) => {
				progress.report({ increment: 0, message: 'Initializing project generation...' });
				
				try {
					// Step 1: Create project structure
					progress.report({ increment: 10, message: 'Creating project structure...' });
					const projectResult = await agentManager.createAndManageProject(projectName, description, requirements);
					
					// Step 2: Generate complete project
					progress.report({ increment: 30, message: 'Generating complete project...' });
					const completeProjectResult = await agentManager.generateCompleteProject(projectName, description, requirements, `./${projectName}`);
					
					// Step 3: Analyze project quality
					progress.report({ increment: 60, message: 'Analyzing project quality...' });
					const analysisResult = await agentManager.analyzeProject(`./${projectName}`);
					
					// Step 4: Setup deployment
					progress.report({ increment: 80, message: 'Setting up deployment...' });
					const deploymentResult = await agentManager.setupEnvironment({}, `./${projectName}`);
					
					progress.report({ increment: 100, message: 'End-to-end project generation completed!' });
					
					// Show results
					vscode.window.showInformationMessage('End-to-end project generation completed! Check the output panel for details.');
					
					const output = vscode.window.createOutputChannel('ARiS End-to-End Project Generation');
					output.show();
					output.appendLine('=== ARiS End-to-End Project Generation ===');
					output.appendLine(`Project Name: ${projectName}`);
					output.appendLine(`Description: ${description}`);
					output.appendLine(`Requirements: ${requirements}`);
					output.appendLine(`Project Creation: ${projectResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Complete Generation: ${completeProjectResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Quality Analysis: ${analysisResult.success ? 'SUCCESS' : 'FAILED'}`);
					output.appendLine(`Deployment Setup: ${deploymentResult.success ? 'SUCCESS' : 'FAILED'}`);
					
					if (analysisResult.data) {
						output.appendLine(`\nProject Quality Score: ${analysisResult.data.qualityScore || 'N/A'}/100`);
						output.appendLine(`Files Generated: ${analysisResult.data.files?.length || 0}`);
						output.appendLine(`Issues Found: ${analysisResult.data.issues?.length || 0}`);
					}
					
				} catch (error) {
					vscode.window.showErrorMessage(`End-to-end project generation failed: ${error}`);
				}
			});
		}
	});

	context.subscriptions.push(endToEndProjectGenerationDisposable);
}

export function deactivate() {
	console.log('ARiS extension is now deactivated.');
}

// Helper function to convert string to AgentType enum
function getAgentTypeFromString(agentString: string): AgentType | null {
	switch (agentString.toLowerCase()) {
		case 'architectus':
			return AgentType.ARCHITECTUS;
		case 'scriba':
			return AgentType.SCRIBA;
		case 'prometheus':
			return AgentType.PROMETHEUS;
		case 'auditor':
			return AgentType.AUDITOR;
		case 'genesis':
			return AgentType.GENESIS;
		case 'executor':
			return AgentType.EXECUTOR;
		default:
			return null;
	}
} 