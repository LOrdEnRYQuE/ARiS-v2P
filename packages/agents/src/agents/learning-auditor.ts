import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, AgentMessage, MessageType } from '@aris/shared';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CodeDiff {
  filePath: string;
  beforeCode: string;
  afterCode: string;
  changes: string[];
  timestamp: Date;
  userId: string;
}

export interface LearningRule {
  id: string;
  pattern: string;
  suggestion: string;
  category: 'style' | 'security' | 'performance' | 'best-practice';
  confidence: number;
  usageCount: number;
  createdAt: Date;
  lastUsed: Date;
}

export interface AuditResult {
  passed: boolean;
  issues: AuditIssue[];
  suggestions: string[];
  score: number;
  learningRules: LearningRule[];
}

export interface AuditIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
}

export class LearningAuditor extends BaseAgent {
  private learningRules: Map<string, LearningRule> = new Map();
  private codeHistory: Map<string, CodeDiff[]> = new Map();
  private auditPatterns: Map<string, RegExp> = new Map();
  private learningDataPath: string;

  constructor() {
    super(
      'learning-auditor-001',
      AgentType.AUDITOR,
      'Learning Auditor',
      'Evolutionary code auditor that learns from user corrections',
      [
        'code-auditing',
        'pattern-learning',
        'quality-improvement',
        'rule-generation',
        'diff-analysis'
      ]
    );

    this.learningDataPath = path.join(process.cwd(), 'learning-data');
    this.initializeLearningSystem();
  }

  /**
   * Initialize the learning system
   */
  private async initializeLearningSystem(): Promise<void> {
    try {
      await this.ensureLearningDirectory();
      await this.loadLearningRules();
      this.initializeAuditPatterns();
    } catch (error) {
      console.error('Failed to initialize learning system:', error);
    }
  }

  private async ensureLearningDirectory(): Promise<void> {
    try {
      await fs.access(this.learningDataPath);
    } catch {
      await fs.mkdir(this.learningDataPath, { recursive: true });
    }
  }

  private async loadLearningRules(): Promise<void> {
    try {
      const rulesPath = path.join(this.learningDataPath, 'learning-rules.json');
      const rulesData = await fs.readFile(rulesPath, 'utf-8');
      const rules = JSON.parse(rulesData) as LearningRule[];
      
      rules.forEach(rule => {
        this.learningRules.set(rule.id, rule);
      });
    } catch (error) {
      // No existing rules, start fresh
      console.log('No existing learning rules found, starting fresh');
    }
  }

  private initializeAuditPatterns(): void {
    // Initialize with common patterns
    this.auditPatterns.set('missing-error-handling', /try\s*\{[^}]*\}\s*catch\s*\(/gi);
    this.auditPatterns.set('hardcoded-strings', /"[^"]{10,}"/g);
    this.auditPatterns.set('console-log', /console\.log\(/g);
    this.auditPatterns.set('async-await', /async\s+function|await\s+/g);
    this.auditPatterns.set('security-vulnerabilities', /eval\(|innerHTML|document\.write/g);
  }

  /**
   * Process audit task with learning capabilities
   */
  public async processTask(task: Task): Promise<Result<any>> {
    try {
      switch (task.type) {
        case 'audit-code':
          return await this.auditCode(task.data);
        
        case 'learn-from-diff':
          return await this.learnFromDiff(task.data as CodeDiff);
        
        case 'generate-rules':
          return await this.generateLearningRules();
        
        case 'apply-learning':
          const code = typeof task.data === 'string' ? task.data : JSON.stringify(task.data);
          const issues = await this.applyLearningRules(code);
          return {
            success: true,
            data: issues
          };
        
        default:
          return {
            success: false,
            error: `Unknown task type: ${task.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Learning auditor failed to process task: ${error}`
      };
    }
  }

  /**
   * Audit code with learning-based rules
   */
  private async auditCode(data: any): Promise<Result<AuditResult>> {
    const { code, filePath, language } = data;
    
    const issues: AuditIssue[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Apply static analysis patterns
    for (const [patternName, pattern] of this.auditPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'warning',
          message: `Found ${patternName}: ${matches.length} occurrences`,
          rule: patternName
        });
        score -= 10;
      }
    }

    // Apply learning rules
    const learningIssues = await this.applyLearningRules(code);
    issues.push(...learningIssues);
    score -= learningIssues.length * 5;

    // Generate suggestions based on patterns and learning
    suggestions.push(...this.generateSuggestions(code, issues));

    const result: AuditResult = {
      passed: score >= 70,
      issues,
      suggestions,
      score: Math.max(0, score),
      learningRules: Array.from(this.learningRules.values())
    };

    return {
      success: true,
      data: result
    };
  }

  /**
   * Learn from code differences
   */
  private async learnFromDiff(diff: CodeDiff): Promise<Result<any>> {
    try {
      console.log(`Learning from diff for file: ${diff.filePath}`);
      
      // Analyze the differences
      const changes = this.analyzeCodeChanges(diff.beforeCode, diff.afterCode);
      
      // Generate new learning rules
      const newRules = this.generateRulesFromChanges(changes, diff);
      
      // Add new rules to the learning system
      for (const rule of newRules) {
        this.learningRules.set(rule.id, rule);
      }
      
      // Save learning rules
      await this.saveLearningRules();
      
      // Update audit patterns
      this.updateAuditPatterns(newRules);
      
      return {
        success: true,
        data: {
          rulesGenerated: newRules.length,
          totalRules: this.learningRules.size
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to learn from diff: ${error}`
      };
    }
  }

  /**
   * Analyze code changes to extract patterns
   */
  private analyzeCodeChanges(beforeCode: string, afterCode: string): string[] {
    const changes: string[] = [];
    
    // Simple line-by-line comparison
    const beforeLines = beforeCode.split('\n');
    const afterLines = afterCode.split('\n');
    
    for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i++) {
      const beforeLine = beforeLines[i] || '';
      const afterLine = afterLines[i] || '';
      
      if (beforeLine !== afterLine) {
        changes.push(`Line ${i + 1}: "${beforeLine.trim()}" -> "${afterLine.trim()}"`);
      }
    }
    
    return changes;
  }

  /**
   * Generate learning rules from code changes
   */
  private generateRulesFromChanges(changes: string[], diff: CodeDiff): LearningRule[] {
    const rules: LearningRule[] = [];
    
    changes.forEach((change, index) => {
      // Extract patterns from changes
      const patterns = this.extractPatternsFromChange(change);
      
      patterns.forEach(pattern => {
        const rule: LearningRule = {
          id: `rule-${Date.now()}-${index}`,
          pattern: pattern.regex,
          suggestion: pattern.suggestion,
          category: pattern.category,
          confidence: 0.7,
          usageCount: 1,
          createdAt: new Date(),
          lastUsed: new Date()
        };
        
        rules.push(rule);
      });
    });
    
    return rules;
  }

  /**
   * Extract patterns from code changes
   */
  private extractPatternsFromChange(change: string): Array<{
    regex: string;
    suggestion: string;
    category: LearningRule['category'];
  }> {
    const patterns: Array<{
      regex: string;
      suggestion: string;
      category: LearningRule['category'];
    }> = [];

    // Error handling patterns
    if (change.includes('try') && change.includes('catch')) {
      patterns.push({
        regex: 'try\\s*\\{[^}]*\\}\\s*catch\\s*\\(',
        suggestion: 'Add proper error handling with specific error types',
        category: 'best-practice'
      });
    }

    // Security patterns
    if (change.includes('innerHTML') || change.includes('document.write')) {
      patterns.push({
        regex: 'innerHTML|document\\.write',
        suggestion: 'Use safer DOM manipulation methods',
        category: 'security'
      });
    }

    // Performance patterns
    if (change.includes('forEach') && change.includes('for')) {
      patterns.push({
        regex: 'forEach\\s*\\(',
        suggestion: 'Consider using for...of for better performance',
        category: 'performance'
      });
    }

    // Style patterns
    if (change.includes('var') && change.includes('let') || change.includes('const')) {
      patterns.push({
        regex: '\\bvar\\b',
        suggestion: 'Use let or const instead of var',
        category: 'style'
      });
    }

    return patterns;
  }

  /**
   * Apply learning rules to code
   */
  private async applyLearningRules(code: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // Apply each learning rule to the code
    for (const rule of this.learningRules.values()) {
      try {
        const regex = new RegExp(rule.pattern, 'g');
        const matches = code.match(regex);
        
        if (matches) {
          issues.push({
            type: 'warning',
            message: rule.suggestion,
            rule: rule.id
          });
          
          // Update rule usage
          rule.usageCount++;
          rule.lastUsed = new Date();
        }
      } catch (error) {
        console.warn(`Invalid regex pattern in rule ${rule.id}: ${rule.pattern}`);
      }
    }
    
    return issues;
  }

  /**
   * Generate suggestions based on code analysis
   */
  private generateSuggestions(code: string, issues: AuditIssue[]): string[] {
    const suggestions: string[] = [];
    
    // Performance suggestions
    if (code.includes('forEach') && code.includes('async')) {
      suggestions.push('Consider using for...of with async/await for better performance');
    }
    
    // Security suggestions
    if (code.includes('innerHTML')) {
      suggestions.push('Use textContent instead of innerHTML for better security');
    }
    
    // Style suggestions
    if (code.includes('var ')) {
      suggestions.push('Replace var with let or const for better scoping');
    }
    
    // Best practice suggestions
    if (code.includes('console.log')) {
      suggestions.push('Remove console.log statements for production code');
    }
    
    return suggestions;
  }

  /**
   * Generate new learning rules from accumulated data
   */
  private async generateLearningRules(): Promise<Result<any>> {
    try {
      const newRules: LearningRule[] = [];
      
      // Analyze code history for patterns
      for (const [filePath, diffs] of this.codeHistory) {
        for (const diff of diffs) {
          const changes = this.analyzeCodeChanges(diff.beforeCode, diff.afterCode);
          const rules = this.generateRulesFromChanges(changes, diff);
          newRules.push(...rules);
        }
      }
      
      // Add new rules
      for (const rule of newRules) {
        this.learningRules.set(rule.id, rule);
      }
      
      await this.saveLearningRules();
      
      return {
        success: true,
        data: {
          rulesGenerated: newRules.length,
          totalRules: this.learningRules.size
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate learning rules: ${error}`
      };
    }
  }

  /**
   * Save learning rules to file
   */
  private async saveLearningRules(): Promise<void> {
    const rulesPath = path.join(this.learningDataPath, 'learning-rules.json');
    const rules = Array.from(this.learningRules.values());
    await fs.writeFile(rulesPath, JSON.stringify(rules, null, 2));
  }

  /**
   * Update audit patterns based on new learning rules
   */
  private updateAuditPatterns(newRules: LearningRule[]): void {
    newRules.forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        this.auditPatterns.set(rule.id, regex);
      } catch (error) {
        console.warn(`Invalid regex pattern in rule ${rule.id}: ${rule.pattern}`);
      }
    });
  }

  /**
   * Handle audit-related messages
   */
  protected async handleAuditRequest(message: AgentMessage): Promise<Result<any>> {
    return await this.auditCode(message.content);
  }

  /**
   * Get learning statistics
   */
  public getLearningStats(): {
    totalRules: number;
    activeRules: number;
    totalDiffs: number;
    averageConfidence: number;
  } {
    const rules = Array.from(this.learningRules.values());
    const totalDiffs = Array.from(this.codeHistory.values()).reduce((sum, diffs) => sum + diffs.length, 0);
    const averageConfidence = rules.length > 0 
      ? rules.reduce((sum, rule) => sum + rule.confidence, 0) / rules.length 
      : 0;

    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.usageCount > 0).length,
      totalDiffs,
      averageConfidence
    };
  }
} 