import { File } from '@aris/shared';
import { SimpleParser } from './simple-parser';
import {
  ASTAnalysis,
  FunctionInfo,
  ClassInfo,
  VariableInfo,
  ImportInfo,
  ExportInfo,
  CodeMetrics,
  CodeQuality,
  CodeIssue,
  CodeSuggestion,
  DependencyInfo,
  AnalyzerConfig,
  ParserConfig
} from './types';

export class ASTAnalyzer {
  private parser: SimpleParser;
  private config: AnalyzerConfig;

  constructor(config: AnalyzerConfig = this.getDefaultConfig()) {
    this.config = config;
    this.parser = new SimpleParser({
      language: 'javascript',
      includeComments: true,
      includeWhitespace: false,
      maxDepth: 10
    });
  }

  /**
   * Analyze a file and return comprehensive analysis
   */
  public async analyzeFile(file: File): Promise<ASTAnalysis | null> {
    try {
      // Parse the file
      const ast = this.parser.parseFile(file);
      if (!ast) {
        console.error('Failed to parse file:', file.name);
        return null;
      }

      // Analyze different aspects
      const functions = this.analyzeFunctions(ast);
      const classes = this.analyzeClasses(ast);
      const variables = this.analyzeVariables(ast);
      const imports = this.analyzeImports(ast);
      const exports = this.analyzeExports(ast);
      const metrics = this.calculateMetrics(ast, file.content || '');
      const quality = this.analyzeQuality(ast, metrics);
      const dependencies = this.analyzeDependencies(imports, exports);

      return {
        file,
        functions,
        classes,
        variables,
        imports,
        exports,
        metrics,
        quality,
        dependencies,
        ast
      };
    } catch (error) {
      console.error('Error analyzing file:', error);
      return null;
    }
  }

  /**
   * Analyze functions in the AST
   */
  private analyzeFunctions(ast: any): FunctionInfo[] {
    const functionNodes = this.parser.getFunctionDeclarations(ast);
    const functions: FunctionInfo[] = [];

    for (const node of functionNodes) {
      const name = this.parser.getFunctionName(node);
      if (!name) continue;

      const parameters = this.parser.getFunctionParameters(node);
      const complexity = this.parser.calculateComplexity(node);
      const isAsync = node.text.includes('async');
      const isExported = this.isExported(node);

      functions.push({
        name,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        parameters: parameters.map(param => ({
          name: param,
          type: undefined,
          isOptional: false,
          defaultValue: undefined
        })),
        returnType: undefined,
        isAsync,
        isExported,
        complexity
      });
    }

    return functions;
  }

  /**
   * Analyze classes in the AST
   */
  private analyzeClasses(ast: any): ClassInfo[] {
    const classNodes = this.parser.getClassDeclarations(ast);
    const classes: ClassInfo[] = [];

    for (const node of classNodes) {
      const name = this.parser.getFunctionName(node);
      if (!name) continue;

      const methods = this.analyzeClassMethods(node);
      const properties = this.analyzeClassProperties(node);
      const isExported = this.isExported(node);

      classes.push({
        name,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        methods,
        properties,
        isExported,
        extends: undefined,
        implements: []
      });
    }

    return classes;
  }

  /**
   * Analyze class methods
   */
  private analyzeClassMethods(classNode: any): FunctionInfo[] {
    const methodNodes = this.parser.getNodesByType(classNode, 'method_definition');
    const methods: FunctionInfo[] = [];

    for (const node of methodNodes) {
      const name = this.parser.getFunctionName(node);
      if (!name) continue;

      const parameters = this.parser.getFunctionParameters(node);
      const complexity = this.parser.calculateComplexity(node);
      const isAsync = node.text.includes('async');

      methods.push({
        name,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        parameters: parameters.map(param => ({
          name: param,
          type: undefined,
          isOptional: false,
          defaultValue: undefined
        })),
        returnType: undefined,
        isAsync,
        isExported: false,
        complexity
      });
    }

    return methods;
  }

  /**
   * Analyze class properties
   */
  private analyzeClassProperties(classNode: any): any[] {
    const propertyNodes = this.parser.getNodesByType(classNode, 'field_definition');
    const properties: any[] = [];

    for (const node of propertyNodes) {
      const identifier = this.findChildByType(node, 'property_identifier');
      if (!identifier) continue;

      properties.push({
        name: identifier.text,
        type: undefined,
        isStatic: node.text.includes('static'),
        isPrivate: node.text.includes('private'),
        isReadonly: node.text.includes('readonly')
      });
    }

    return properties;
  }

  /**
   * Analyze variables in the AST
   */
  private analyzeVariables(ast: any): VariableInfo[] {
    const variableNodes = this.parser.getVariableDeclarations(ast);
    const variables: VariableInfo[] = [];

    for (const node of variableNodes) {
      const identifiers = this.parser.getNodesByType(node, 'identifier');
      
      for (const identifier of identifiers) {
        const isConst = node.type.includes('const');
        const isLet = node.type.includes('let');
        const isVar = node.type.includes('var');

        variables.push({
          name: identifier.text,
          type: undefined,
          isConst,
          isLet,
          isVar,
          line: identifier.startPosition.row + 1,
          scope: 'global' // Simplified scope detection
        });
      }
    }

    return variables;
  }

  /**
   * Analyze imports in the AST
   */
  private analyzeImports(ast: any): ImportInfo[] {
    const importNodes = this.parser.getImportStatements(ast);
    const imports: ImportInfo[] = [];

    for (const node of importNodes) {
      // Simplified import analysis
      const importText = node.text;
      const moduleMatch = importText.match(/from\s+['"]([^'"]+)['"]/);
      const module = moduleMatch ? moduleMatch[1] : '';

      imports.push({
        module,
        imports: [],
        isDefault: importText.includes('import') && !importText.includes('{'),
        alias: undefined,
        line: node.startPosition.row + 1
      });
    }

    return imports;
  }

  /**
   * Analyze exports in the AST
   */
  private analyzeExports(ast: any): ExportInfo[] {
    const exportNodes = this.parser.getExportStatements(ast);
    const exports: ExportInfo[] = [];

    for (const node of exportNodes) {
      const exportText = node.text;
      const nameMatch = exportText.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/);
      const name = nameMatch ? nameMatch[1] : 'default';

      exports.push({
        name,
        type: exportText.includes('default') ? 'default' : 'named',
        line: node.startPosition.row + 1
      });
    }

    return exports;
  }

  /**
   * Calculate code metrics
   */
  private calculateMetrics(ast: any, code: string): CodeMetrics {
    const linesOfCode = this.parser.getLineCount(ast);
    const commentLines = this.parser.getCommentLines(code);
    const blankLines = this.parser.getBlankLines(code);
    const cyclomaticComplexity = this.calculateTotalComplexity(ast);

    return {
      linesOfCode,
      commentLines,
      blankLines,
      cyclomaticComplexity,
      maintainabilityIndex: this.calculateMaintainabilityIndex(linesOfCode, cyclomaticComplexity, commentLines),
      halsteadMetrics: this.calculateHalsteadMetrics(code)
    };
  }

  /**
   * Calculate total cyclomatic complexity
   */
  private calculateTotalComplexity(ast: any): number {
    const functions = this.parser.getFunctionDeclarations(ast);
    let totalComplexity = 0;

    for (const func of functions) {
      totalComplexity += this.parser.calculateComplexity(func);
    }

    return totalComplexity;
  }

  /**
   * Calculate maintainability index
   */
  private calculateMaintainabilityIndex(loc: number, complexity: number, commentLines: number): number {
    // Simplified maintainability index calculation
    const volume = Math.log(loc);
    const complexityFactor = Math.log(complexity + 1);
    const commentFactor = Math.log(commentLines + 1);
    
    const mi = 171 - 5.2 * volume - 0.23 * complexityFactor - 16.2 * commentFactor;
    return Math.max(0, Math.min(100, mi));
  }

  /**
   * Calculate Halstead metrics
   */
  private calculateHalsteadMetrics(code: string): any {
    // Simplified Halstead metrics calculation
    const operators = code.match(/[+\-*/=<>!&|^~%]/g) || [];
    const operands = code.match(/\b\w+\b/g) || [];
    
    const uniqueOperators = new Set(operators).size;
    const uniqueOperands = new Set(operands).size;
    const totalOperators = operators.length;
    const totalOperands = operands.length;

    const vocabulary = uniqueOperators + uniqueOperands;
    const length = totalOperators + totalOperands;
    const volume = length * Math.log2(vocabulary);
    const difficulty = (uniqueOperators / 2) * (totalOperands / uniqueOperands);
    const effort = difficulty * volume;
    const time = effort / 18;
    const bugs = volume / 3000;

    return {
      vocabulary,
      length,
      volume,
      difficulty,
      effort,
      time,
      bugs
    };
  }

  /**
   * Analyze code quality
   */
  private analyzeQuality(ast: any, metrics: CodeMetrics): CodeQuality {
    const issues: CodeIssue[] = [];
    const suggestions: CodeSuggestion[] = [];

    // Check complexity
    if (metrics.cyclomaticComplexity > this.config.maxCyclomaticComplexity) {
      issues.push({
        type: 'warning',
        message: `High cyclomatic complexity: ${metrics.cyclomaticComplexity}`,
        line: 1,
        column: 1,
        severity: 'medium',
        category: 'complexity'
      });
    }

    // Check maintainability
    if (metrics.maintainabilityIndex < 50) {
      issues.push({
        type: 'warning',
        message: `Low maintainability index: ${metrics.maintainabilityIndex.toFixed(1)}`,
        line: 1,
        column: 1,
        severity: 'high',
        category: 'complexity'
      });
    }

    // Check function length
    const functions = this.parser.getFunctionDeclarations(ast);
    for (const func of functions) {
      const functionLength = func.endPosition.row - func.startPosition.row + 1;
      if (functionLength > this.config.maxFunctionLength) {
        issues.push({
          type: 'warning',
          message: `Function is too long: ${functionLength} lines`,
          line: func.startPosition.row + 1,
          column: func.startPosition.column + 1,
          severity: 'medium',
          category: 'style'
        });
      }
    }

    // Add suggestions
    if (metrics.commentLines < metrics.linesOfCode * 0.1) {
      suggestions.push({
        message: 'Consider adding more comments to improve code documentation',
        line: 1,
        column: 1,
        category: 'best-practice',
        priority: 'medium'
      });
    }

    const score = Math.max(0, 100 - issues.length * 10 - (100 - metrics.maintainabilityIndex));

    return {
      score,
      issues,
      suggestions,
      metrics
    };
  }

  /**
   * Analyze dependencies
   */
  private analyzeDependencies(imports: ImportInfo[], exports: ExportInfo[]): DependencyInfo {
    const dependencies = imports.map(imp => imp.module).filter(Boolean);
    const circularDependencies: string[] = []; // Simplified - would need more complex analysis

    return {
      imports,
      exports,
      dependencies,
      circularDependencies
    };
  }

  /**
   * Check if a node is exported
   */
  private isExported(node: any): boolean {
    // Simplified export detection
    return node.text.includes('export');
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AnalyzerConfig {
    return {
      enableComplexityAnalysis: true,
      enableQualityAnalysis: true,
      enableDependencyAnalysis: true,
      maxCyclomaticComplexity: 10,
      maxFunctionLength: 50,
      maxParameters: 5
    };
  }

  /**
   * Find child node by type
   */
  private findChildByType(node: any, type: string): any | null {
    if (!node.children) {
      return null;
    }

    for (const child of node.children) {
      if (child.type === type) {
        return child;
      }
    }

    return null;
  }
} 