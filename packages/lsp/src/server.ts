import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	Diagnostic,
	DiagnosticSeverity,
	Hover,
	TextDocument,
	Position,
	Range
} from 'vscode-languageserver/node';

import {
	TextDocument as VSCodeTextDocument
} from 'vscode-languageserver-textdocument';

import { AgentManager } from '@aris/agents';
import { AgentType } from '@aris/shared';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<VSCodeTextDocument> = new TextDocuments(VSCodeTextDocument);

// Initialize agent manager
const agentManager = new AgentManager();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams): InitializeResult => {
	const capabilities = params.capabilities;

	// The server has support for workspace configuration
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ['.', ':', '@', '/']
			},
			// Add hover provider
			hoverProvider: true,
			// Add diagnostic provider
			diagnosticProvider: {
				identifier: 'aris',
				interFileDependencies: true,
				workspaceDiagnostics: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ArisSettings {
	maxNumberOfProblems: number;
	enableCodeAnalysis: boolean;
	enableAutoCompletion: boolean;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client
const defaultSettings: ArisSettings = { 
	maxNumberOfProblems: 1000,
	enableCodeAnalysis: true,
	enableAutoCompletion: true
};
let globalSettings: ArisSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ArisSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ArisSettings>(
			(change.settings.aris || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ArisSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'aris'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: VSCodeTextDocument): Promise<void> {
	// Get the settings for this document
	const settings = await getDocumentSettings(textDocument.uri);

	// Get the text content
	const text = textDocument.getText();
	const diagnostics: Diagnostic[] = [];

	// Only run analysis if enabled
	if (settings.enableCodeAnalysis) {
		try {
			// Use ARiS agent system for code analysis
			const result = await agentManager.analyzeCode(text, textDocument.uri);
			
			if (result.success && result.data) {
				const analysis = result.data;
				
				// Convert ARiS analysis to VS Code diagnostics
				if (analysis.issues) {
					analysis.issues.forEach((issue: any) => {
						const diagnostic: Diagnostic = {
							severity: getDiagnosticSeverity(issue.severity || 'warning'),
							range: {
								start: { line: (issue.line || 1) - 1, character: 0 },
								end: { line: (issue.line || 1) - 1, character: 100 }
							},
							message: issue.message,
							source: 'ARiS'
						};
						diagnostics.push(diagnostic);
					});
				}
			}
		} catch (error) {
			connection.console.log(`ARiS analysis error: ${error}`);
		}
	}

	// Send the computed diagnostics to VS Code
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function getDiagnosticSeverity(severity: string): DiagnosticSeverity {
	switch (severity.toLowerCase()) {
		case 'error':
			return DiagnosticSeverity.Error;
		case 'warning':
			return DiagnosticSeverity.Warning;
		case 'info':
			return DiagnosticSeverity.Information;
		case 'hint':
			return DiagnosticSeverity.Hint;
		default:
			return DiagnosticSeverity.Warning;
	}
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have changed in VS Code
	connection.console.log('We received a file change event');
});

// This handler provides the initial list of completion items
connection.onCompletion(
	(textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const textDocument = documents.get(textDocumentPosition.textDocument.uri);
		if (!textDocument) {
			return [];
		}

		const position = textDocumentPosition.position;
		const text = textDocument.getText();
		const line = text.split('\n')[position.line];
		
		// ARiS-specific completions
		const completions: CompletionItem[] = [
			{
				label: 'ARiS: Generate Blueprint',
				kind: CompletionItemKind.Snippet,
				detail: 'Generate project blueprint',
				documentation: 'Generate a complete project blueprint using ARiS Architectus agent',
				data: 'blueprint'
			},
			{
				label: 'ARiS: Analyze Code',
				kind: CompletionItemKind.Snippet,
				detail: 'Analyze current code',
				documentation: 'Analyze the current code using ARiS Auditor agent',
				data: 'analyze'
			},
			{
				label: 'ARiS: Generate Code',
				kind: CompletionItemKind.Snippet,
				detail: 'Generate code files',
				documentation: 'Generate code files using ARiS Scriba agent',
				data: 'generate'
			},
			{
				label: 'ARiS: Create Project',
				kind: CompletionItemKind.Snippet,
				detail: 'Create new project',
				documentation: 'Create a new project using ARiS Prometheus agent',
				data: 'project'
			}
		];

		// Add language-specific completions
		if (line.includes('function') || line.includes('class')) {
			completions.push({
				label: 'ARiS: Optimize Function',
				kind: CompletionItemKind.Snippet,
				detail: 'Optimize function',
				documentation: 'Get optimization suggestions for the current function',
				data: 'optimize'
			});
		}

		if (line.includes('import') || line.includes('require')) {
			completions.push({
				label: 'ARiS: Check Dependencies',
				kind: CompletionItemKind.Snippet,
				detail: 'Check dependencies',
				documentation: 'Analyze and check dependencies for issues',
				data: 'dependencies'
			});
		}

		return completions;
	}
);

// This handler resolves additional information for the item selected in
// the completion list
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		switch (item.data) {
			case 'blueprint':
				item.detail = 'Generate project blueprint';
				item.documentation = 'Use ARiS Architectus agent to generate a complete project blueprint from requirements';
				break;
			case 'analyze':
				item.detail = 'Analyze code quality';
				item.documentation = 'Use ARiS Auditor agent to analyze code quality, security, and best practices';
				break;
			case 'generate':
				item.detail = 'Generate code files';
				item.documentation = 'Use ARiS Scriba agent to generate code files from blueprint';
				break;
			case 'project':
				item.detail = 'Create new project';
				item.documentation = 'Use ARiS Prometheus agent to create and manage a new project';
				break;
			case 'optimize':
				item.detail = 'Optimize function';
				item.documentation = 'Get optimization suggestions for the current function';
				break;
			case 'dependencies':
				item.detail = 'Check dependencies';
				item.documentation = 'Analyze dependencies for security issues and updates';
				break;
		}
		return item;
	}
);

// Hover provider
connection.onHover(
	async (params: TextDocumentPositionParams): Promise<Hover | null> => {
		const textDocument = documents.get(params.textDocument.uri);
		if (!textDocument) {
			return null;
		}

		const position = params.position;
		const text = textDocument.getText();
		const line = text.split('\n')[position.line];

		// Provide ARiS-specific hover information
		if (line.includes('function') || line.includes('class')) {
			return {
				contents: {
					kind: 'markdown',
					value: '**ARiS Agent Available**\n\nUse ARiS Auditor to analyze this code for quality and best practices.'
				},
				range: {
					start: { line: position.line, character: 0 },
					end: { line: position.line, character: line.length }
				}
			};
		}

		if (line.includes('import') || line.includes('require')) {
			return {
				contents: {
					kind: 'markdown',
					value: '**ARiS Dependency Analysis**\n\nUse ARiS Auditor to analyze dependencies for security and compatibility issues.'
				},
				range: {
					start: { line: position.line, character: 0 },
					end: { line: position.line, character: line.length }
				}
			};
		}

		return null;
	}
);

// Custom ARiS commands
connection.onExecuteCommand(async (params) => {
	switch (params.command) {
		case 'aris.generateBlueprint':
			// Handle blueprint generation
			connection.console.log('ARiS: Generating blueprint...');
			break;
		case 'aris.analyzeCode':
			// Handle code analysis
			connection.console.log('ARiS: Analyzing code...');
			break;
		case 'aris.generateCode':
			// Handle code generation
			connection.console.log('ARiS: Generating code...');
			break;
		case 'aris.createProject':
			// Handle project creation
			connection.console.log('ARiS: Creating project...');
			break;
	}
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen(); 