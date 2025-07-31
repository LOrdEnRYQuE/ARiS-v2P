import { File } from '@aris/shared';

export interface ASTNode {
  type: string;
  text: string;
  startPosition: Position;
  endPosition: Position;
  children?: ASTNode[];
}

export interface Position {
  row: number;
  column: number;
}

export interface FunctionInfo {
  name: string;
  startLine: number;
  endLine: number;
  parameters: ParameterInfo[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  complexity: number;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface ClassInfo {
  name: string;
  startLine: number;
  endLine: number;
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  isExported: boolean;
  extends?: string;
  implements?: string[];
}

export interface PropertyInfo {
  name: string;
  type?: string;
  isStatic: boolean;
  isPrivate: boolean;
  isReadonly: boolean;
}

export interface ImportInfo {
  module: string;
  imports: string[];
  isDefault: boolean;
  alias?: string;
  line: number;
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named' | 'namespace';
  line: number;
}

export interface VariableInfo {
  name: string;
  type?: string;
  isConst: boolean;
  isLet: boolean;
  isVar: boolean;
  line: number;
  scope: 'global' | 'function' | 'block';
}

export interface CodeMetrics {
  linesOfCode: number;
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  halsteadMetrics: HalsteadMetrics;
}

export interface HalsteadMetrics {
  vocabulary: number;
  length: number;
  volume: number;
  difficulty: number;
  effort: number;
  time: number;
  bugs: number;
}

export interface CodeQuality {
  score: number;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high';
  category: 'complexity' | 'style' | 'security' | 'performance';
}

export interface CodeSuggestion {
  message: string;
  line: number;
  column: number;
  category: 'refactoring' | 'optimization' | 'best-practice';
  priority: 'low' | 'medium' | 'high';
}

export interface DependencyInfo {
  imports: ImportInfo[];
  exports: ExportInfo[];
  dependencies: string[];
  circularDependencies: string[];
}

export interface ASTAnalysis {
  file: File;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  variables: VariableInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  metrics: CodeMetrics;
  quality: CodeQuality;
  dependencies: DependencyInfo;
  ast: ASTNode;
}

export interface ParserConfig {
  language: 'javascript' | 'typescript';
  includeComments: boolean;
  includeWhitespace: boolean;
  maxDepth: number;
}

export interface AnalyzerConfig {
  enableComplexityAnalysis: boolean;
  enableQualityAnalysis: boolean;
  enableDependencyAnalysis: boolean;
  maxCyclomaticComplexity: number;
  maxFunctionLength: number;
  maxParameters: number;
} 