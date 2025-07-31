import { File } from '@aris/shared';
import { ASTNode, Position, ParserConfig } from './types';

export class SimpleParser {
  private language: 'javascript' | 'typescript';

  constructor(config: ParserConfig) {
    this.language = config.language;
  }

  /**
   * Parse code using regex-based analysis
   */
  public parseCode(code: string): ASTNode | null {
    try {
      const lines = code.split('\n');
      const ast: ASTNode = {
        type: 'program',
        text: code,
        startPosition: { row: 0, column: 0 },
        endPosition: { row: lines.length - 1, column: lines[lines.length - 1]?.length || 0 },
        children: []
      };

      // Extract functions
      const functions = this.extractFunctions(code);
      ast.children?.push(...functions);

      // Extract classes
      const classes = this.extractClasses(code);
      ast.children?.push(...classes);

      // Extract imports
      const imports = this.extractImports(code);
      ast.children?.push(...imports);

      // Extract exports
      const exports = this.extractExports(code);
      ast.children?.push(...exports);

      return ast;
    } catch (error) {
      console.error('Error parsing code:', error);
      return null;
    }
  }

  /**
   * Parse a file and return AST
   */
  public parseFile(file: File): ASTNode | null {
    if (!file.content) {
      console.warn('File has no content to parse');
      return null;
    }

    return this.parseCode(file.content);
  }

  /**
   * Extract function declarations using regex
   */
  private extractFunctions(code: string): ASTNode[] {
    const functions: ASTNode[] = [];
    const lines = code.split('\n');

    // Function declaration patterns
    const patterns = [
      /function\s+(\w+)\s*\(/g,
      /const\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
      /let\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
      /var\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
      /(\w+)\s*:\s*(?:async\s*)?\(/g, // Method definitions
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of patterns) {
        const match = pattern.exec(line);
        if (match) {
          const functionName = match[1];
          const startLine = i;
          const endLine = this.findFunctionEnd(lines, i);
          
          functions.push({
            type: 'function_declaration',
            text: lines.slice(startLine, endLine + 1).join('\n'),
            startPosition: { row: startLine, column: 0 },
            endPosition: { row: endLine, column: lines[endLine]?.length || 0 },
            children: []
          });
          
          break; // Found a function on this line
        }
      }
    }

    return functions;
  }

  /**
   * Extract class declarations using regex
   */
  private extractClasses(code: string): ASTNode[] {
    const classes: ASTNode[] = [];
    const lines = code.split('\n');

    const classPattern = /class\s+(\w+)/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = classPattern.exec(line);
      
      if (match) {
        const className = match[1];
        const startLine = i;
        const endLine = this.findClassEnd(lines, i);
        
        classes.push({
          type: 'class_declaration',
          text: lines.slice(startLine, endLine + 1).join('\n'),
          startPosition: { row: startLine, column: 0 },
          endPosition: { row: endLine, column: lines[endLine]?.length || 0 },
          children: []
        });
      }
    }

    return classes;
  }

  /**
   * Extract import statements using regex
   */
  private extractImports(code: string): ASTNode[] {
    const imports: ASTNode[] = [];
    const lines = code.split('\n');

    const importPattern = /import\s+.*from\s+['"][^'"]+['"]/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = importPattern.exec(line);
      
      if (match) {
        imports.push({
          type: 'import_statement',
          text: line,
          startPosition: { row: i, column: 0 },
          endPosition: { row: i, column: line.length },
          children: []
        });
      }
    }

    return imports;
  }

  /**
   * Extract export statements using regex
   */
  private extractExports(code: string): ASTNode[] {
    const exports: ASTNode[] = [];
    const lines = code.split('\n');

    const exportPatterns = [
      /export\s+default\s+/g,
      /export\s+(?:function|class|const|let|var)\s+(\w+)/g,
      /export\s*{/g
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of exportPatterns) {
        const match = pattern.exec(line);
        if (match) {
          exports.push({
            type: 'export_statement',
            text: line,
            startPosition: { row: i, column: 0 },
            endPosition: { row: i, column: line.length },
            children: []
          });
          break;
        }
      }
    }

    return exports;
  }

  /**
   * Find the end of a function (simplified)
   */
  private findFunctionEnd(lines: string[], startLine: number): number {
    let braceCount = 0;
    let inFunction = false;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      // Count opening braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      braceCount += openBraces - closeBraces;
      
      if (openBraces > 0 && !inFunction) {
        inFunction = true;
      }
      
      if (inFunction && braceCount === 0) {
        return i;
      }
    }

    return lines.length - 1;
  }

  /**
   * Find the end of a class (simplified)
   */
  private findClassEnd(lines: string[], startLine: number): number {
    let braceCount = 0;
    let inClass = false;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      // Count opening braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      braceCount += openBraces - closeBraces;
      
      if (openBraces > 0 && !inClass) {
        inClass = true;
      }
      
      if (inClass && braceCount === 0) {
        return i;
      }
    }

    return lines.length - 1;
  }

  /**
   * Get all nodes of a specific type
   */
  public getNodesByType(ast: ASTNode, type: string): ASTNode[] {
    const nodes: ASTNode[] = [];

    const traverse = (node: ASTNode) => {
      if (node.type === type) {
        nodes.push(node);
      }
      
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
    };

    traverse(ast);
    return nodes;
  }

  /**
   * Get function declarations
   */
  public getFunctionDeclarations(ast: ASTNode): ASTNode[] {
    return this.getNodesByType(ast, 'function_declaration');
  }

  /**
   * Get class declarations
   */
  public getClassDeclarations(ast: ASTNode): ASTNode[] {
    return this.getNodesByType(ast, 'class_declaration');
  }

  /**
   * Get import statements
   */
  public getImportStatements(ast: ASTNode): ASTNode[] {
    return this.getNodesByType(ast, 'import_statement');
  }

  /**
   * Get export statements
   */
  public getExportStatements(ast: ASTNode): ASTNode[] {
    return this.getNodesByType(ast, 'export_statement');
  }

  /**
   * Get variable declarations
   */
  public getVariableDeclarations(ast: ASTNode): ASTNode[] {
    const variables: ASTNode[] = [];
    const lines = ast.text.split('\n');

    // Variable declaration patterns
    const patterns = [
      /const\s+(\w+)/g,
      /let\s+(\w+)/g,
      /var\s+(\w+)/g
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of patterns) {
        const match = pattern.exec(line);
        if (match) {
          variables.push({
            type: 'variable_declaration',
            text: line,
            startPosition: { row: i, column: 0 },
            endPosition: { row: i, column: line.length },
            children: []
          });
          break;
        }
      }
    }

    return variables;
  }

  /**
   * Calculate cyclomatic complexity for a function
   */
  public calculateComplexity(functionNode: ASTNode): number {
    let complexity = 1; // Base complexity
    const code = functionNode.text;

    // Count complexity factors
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bdo\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\?\s*[^:]+:/g, // ternary operators
      /\|\||&&/g // logical operators
    ];

    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Get function name from function node
   */
  public getFunctionName(functionNode: ASTNode): string | null {
    const patterns = [
      /function\s+(\w+)/,
      /const\s+(\w+)\s*=/,
      /let\s+(\w+)\s*=/,
      /var\s+(\w+)\s*=/,
      /(\w+)\s*:/
    ];

    for (const pattern of patterns) {
      const match = functionNode.text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Get function parameters
   */
  public getFunctionParameters(functionNode: ASTNode): string[] {
    const paramMatch = functionNode.text.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    const params = paramMatch[1].split(',').map(p => p.trim());
    return params.filter(p => p.length > 0);
  }

  /**
   * Get line count from AST
   */
  public getLineCount(ast: ASTNode): number {
    if (!ast.endPosition) {
      return 0;
    }
    return ast.endPosition.row + 1;
  }

  /**
   * Get comment lines from code
   */
  public getCommentLines(code: string): number {
    const lines = code.split('\n');
    let commentLines = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        commentLines++;
      }
    }

    return commentLines;
  }

  /**
   * Get blank lines from code
   */
  public getBlankLines(code: string): number {
    const lines = code.split('\n');
    let blankLines = 0;

    for (const line of lines) {
      if (line.trim() === '') {
        blankLines++;
      }
    }

    return blankLines;
  }
} 