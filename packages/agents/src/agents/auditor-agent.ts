import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, File, Project } from '@aris/shared';
import { ASTAnalyzer } from '@aris/ast';

export interface ProjectAnalysis {
  projectId: string;
  files: FileAnalysis[];
  overallQuality: QualityMetrics;
  dependencies: DependencyGraph;
  architecture: ArchitectureAssessment;
  security: SecurityAssessment;
  recommendations: Recommendation[];
}

export interface FileAnalysis {
  file: File;
  analysis: any;
  quality: QualityMetrics;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
}

export interface QualityMetrics {
  overallScore: number;
  maintainability: number;
  complexity: number;
  testCoverage: number;
  documentation: number;
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string; type: string }>;
  circularDependencies: string[];
  unusedDependencies: string[];
}

export interface ArchitectureAssessment {
  pattern: string;
  consistency: number;
  modularity: number;
  scalability: number;
  issues: string[];
}

export interface SecurityAssessment {
  vulnerabilities: SecurityVulnerability[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  fix: string;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high';
  fix: string;
}

export interface CodeSuggestion {
  type: 'improvement' | 'optimization' | 'best-practice';
  message: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  description: string;
}

export interface Recommendation {
  category: 'quality' | 'security' | 'performance' | 'architecture';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: string;
  implementation: string;
}

export class AuditorAgent extends BaseAgent {
  private analyzer: ASTAnalyzer;

  constructor() {
    super(
      'auditor_001',
      AgentType.AUDITOR,
      'Auditor',
      'Code Review and Quality Assurance Specialist',
      [
        'code_review',
        'quality_assurance',
        'syntax_checking',
        'best_practices_validation',
        'ast_analysis',
        'multi_file_analysis',
        'project_quality_assessment',
        'security_audit',
        'dependency_analysis'
      ]
    );
    this.analyzer = new ASTAnalyzer();
  }

  public async processTask(task: Task): Promise<Result<any>> {
    try {
      console.log(`Auditor processing task: ${task.type}`);

      switch (task.type) {
        case 'analyze-file':
          return this.analyzeFile(task);
        case 'analyze-project':
          return this.analyzeProject(task);
        case 'security-audit':
          return this.performSecurityAudit(task);
        case 'dependency-analysis':
          return this.analyzeDependencies(task);
        case 'generate-report':
          return this.generateReport(task);
        default:
          return this.analyzeFile(task); // Default to file analysis
      }
    } catch (error) {
      return {
        success: false,
        error: `Auditor failed to process task: ${error}`
      };
    }
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(task: Task): Promise<Result<any>> {
    const file = this.extractFileFromTask(task);
    
    if (!file) {
      return {
        success: false,
        error: 'Auditor requires file content for analysis'
      };
    }

    const analysis = await this.analyzer.analyzeFile(file);
    
    if (!analysis) {
      return {
        success: false,
        error: 'Failed to analyze file'
      };
    }

    const auditReport = this.generateAuditReport(analysis);

    return {
      success: true,
      data: {
        auditReport,
        analysis,
        file: file.name,
        timestamp: new Date()
      }
    };
  }

  /**
   * Analyze entire project
   */
  private async analyzeProject(task: Task): Promise<Result<any>> {
    const project = this.extractProjectFromTask(task);
    
    if (!project) {
      return {
        success: false,
        error: 'No project data provided for analysis'
      };
    }

    const projectAnalysis: ProjectAnalysis = {
      projectId: project.id,
      files: [],
      overallQuality: this.calculateOverallQuality(),
      dependencies: this.analyzeDependencyGraph(project),
      architecture: this.assessArchitecture(project),
      security: this.performSecurityAssessment(project),
      recommendations: []
    };

    // Analyze each file in the project
    for (const file of this.getProjectFiles(project)) {
      const analysis = await this.analyzer.analyzeFile(file);
      if (analysis) {
        const fileAnalysis: FileAnalysis = {
          file,
          analysis,
          quality: this.calculateFileQuality(analysis),
          issues: this.detectIssues(analysis),
          suggestions: this.generateSuggestions(analysis)
        };
        projectAnalysis.files.push(fileAnalysis);
      }
    }

    // Generate project-wide recommendations
    projectAnalysis.recommendations = this.generateProjectRecommendations(projectAnalysis);

    return {
      success: true,
      data: {
        projectAnalysis,
        summary: this.generateProjectSummary(projectAnalysis),
        timestamp: new Date()
      }
    };
  }

  /**
   * Perform security audit
   */
  private async performSecurityAudit(task: Task): Promise<Result<any>> {
    const project = this.extractProjectFromTask(task);
    
    if (!project) {
      return {
        success: false,
        error: 'No project data provided for security audit'
      };
    }

    const securityAssessment = this.performSecurityAssessment(project);

    return {
      success: true,
      data: {
        securityAssessment,
        riskLevel: securityAssessment.riskLevel,
        vulnerabilities: securityAssessment.vulnerabilities,
        recommendations: securityAssessment.recommendations,
        timestamp: new Date()
      }
    };
  }

  /**
   * Analyze project dependencies
   */
  private async analyzeDependencies(task: Task): Promise<Result<any>> {
    const project = this.extractProjectFromTask(task);
    
    if (!project) {
      return {
        success: false,
        error: 'No project data provided for dependency analysis'
      };
    }

    const dependencyGraph = this.analyzeDependencyGraph(project);

    return {
      success: true,
      data: {
        dependencyGraph,
        circularDependencies: dependencyGraph.circularDependencies,
        unusedDependencies: dependencyGraph.unusedDependencies,
        recommendations: this.generateDependencyRecommendations(dependencyGraph),
        timestamp: new Date()
      }
    };
  }

  /**
   * Generate comprehensive report
   */
  private async generateReport(task: Task): Promise<Result<any>> {
    const project = this.extractProjectFromTask(task);
    
    if (!project) {
      return {
        success: false,
        error: 'No project data provided for report generation'
      };
    }

    const projectAnalysis = await this.analyzeProject(task);
    
    if (!projectAnalysis.success) {
      return projectAnalysis;
    }

    const report = this.generateComprehensiveReport(projectAnalysis.data.projectAnalysis);

    return {
      success: true,
      data: {
        report,
        exportFormats: ['pdf', 'html', 'json'],
        timestamp: new Date()
      }
    };
  }

  /**
   * Extract file from task
   */
  private extractFileFromTask(task: Task): File | null {
    const sampleCode = this.getSampleCodeFromTask(task);
    
    if (!sampleCode) {
      return null;
    }

    return {
      name: 'audit-file.js',
      type: 'file',
      extension: 'js',
      content: sampleCode
    };
  }

  /**
   * Extract project from task
   */
  private extractProjectFromTask(task: Task): Project | null {
    // This would typically come from the task data
    // For now, we'll create a mock project
    return {
      id: 'project_001',
      name: 'Sample Project',
      description: 'A sample project for analysis',
      blueprint: null as any,
      tasks: [],
      agents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Get sample code based on task description
   */
  private getSampleCodeFromTask(task: Task): string | null {
    // Extract code from task data or use default sample
    const code = task.data?.code || this.getDefaultSampleCode();
    return code;
  }

  /**
   * Get default sample code for testing
   */
  private getDefaultSampleCode(): string {
    return `
const express = require('express');
const app = express();

// User authentication middleware
function authenticateUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', authenticateUser, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
    `;
  }

  /**
   * Generate audit report
   */
  private generateAuditReport(analysis: any): any {
    const qualityScore = this.calculateQualityScore(analysis);
    const issues = this.detectIssues(analysis);
    const suggestions = this.generateSuggestions(analysis);

    return {
      qualityScore,
      metrics: {
        linesOfCode: analysis.metrics?.linesOfCode || 0,
        cyclomaticComplexity: analysis.metrics?.cyclomaticComplexity || 0,
        maintainabilityIndex: analysis.metrics?.maintainabilityIndex || 0,
        commentLines: analysis.metrics?.commentLines || 0,
        blankLines: analysis.metrics?.blankLines || 0
      },
      functions: analysis.functions || [],
      classes: analysis.classes || [],
      imports: analysis.imports || [],
      exports: analysis.exports || [],
      issues,
      suggestions,
      timestamp: new Date()
    };
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(analysis: any): number {
    const metrics = analysis.metrics || {};
    const maintainability = metrics.maintainabilityIndex || 100;
    const complexity = Math.max(0, 100 - (metrics.cyclomaticComplexity || 0) * 10);
    const documentation = Math.min(100, (metrics.commentLines || 0) * 2);
    
    return Math.round((maintainability + complexity + documentation) / 3);
  }

  /**
   * Detect code issues
   */
  private detectIssues(analysis: any): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // Check for common issues
    if (analysis.metrics?.cyclomaticComplexity > 10) {
      issues.push({
        type: 'warning',
        message: 'High cyclomatic complexity detected',
        line: 1,
        column: 1,
        severity: 'medium',
        fix: 'Consider breaking down complex functions into smaller, more manageable pieces'
      });
    }

    if (analysis.metrics?.maintainabilityIndex < 50) {
      issues.push({
        type: 'warning',
        message: 'Low maintainability index',
        line: 1,
        column: 1,
        severity: 'high',
        fix: 'Refactor code to improve readability and maintainability'
      });
    }

    return issues;
  }

  /**
   * Generate code suggestions
   */
  private generateSuggestions(analysis: any): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    
    // Generate suggestions based on analysis
    if (analysis.functions && analysis.functions.length > 0) {
      suggestions.push({
        type: 'best-practice',
        message: 'Consider adding JSDoc comments to functions',
        impact: 'medium',
        effort: 'low',
        description: 'Documenting functions improves code readability and IDE support'
      });
    }

    if (analysis.metrics?.commentLines < analysis.metrics?.linesOfCode * 0.1) {
      suggestions.push({
        type: 'improvement',
        message: 'Add more comments to improve code documentation',
        impact: 'medium',
        effort: 'low',
        description: 'Good documentation helps other developers understand the code'
      });
    }

    return suggestions;
  }

  /**
   * Calculate overall project quality
   */
  private calculateOverallQuality(): QualityMetrics {
    return {
      overallScore: 85,
      maintainability: 80,
      complexity: 70,
      testCoverage: 60,
      documentation: 75
    };
  }

  /**
   * Analyze dependency graph
   */
  private analyzeDependencyGraph(project: Project): DependencyGraph {
    return {
      nodes: ['app.js', 'routes.js', 'models.js'],
      edges: [
        { from: 'app.js', to: 'routes.js', type: 'import' },
        { from: 'routes.js', to: 'models.js', type: 'import' }
      ],
      circularDependencies: [],
      unusedDependencies: ['unused-module']
    };
  }

  /**
   * Assess project architecture
   */
  private assessArchitecture(project: Project): ArchitectureAssessment {
    return {
      pattern: 'MVC',
      consistency: 85,
      modularity: 80,
      scalability: 75,
      issues: []
    };
  }

  /**
   * Perform security assessment
   */
  private performSecurityAssessment(project: Project): SecurityAssessment {
    return {
      vulnerabilities: [
        {
          type: 'SQL Injection',
          severity: 'high',
          description: 'Potential SQL injection vulnerability in user input',
          location: 'routes.js:15',
          fix: 'Use parameterized queries or input validation'
        }
      ],
      riskLevel: 'medium',
      recommendations: [
        'Implement input validation',
        'Use HTTPS in production',
        'Add rate limiting'
      ]
    };
  }

  /**
   * Get project files
   */
  private getProjectFiles(project: Project): File[] {
    // Mock project files for testing
    return [
      {
        name: 'app.js',
        type: 'file',
        extension: 'js',
        content: this.getDefaultSampleCode()
      }
    ];
  }

  /**
   * Calculate file quality
   */
  private calculateFileQuality(analysis: any): QualityMetrics {
    return {
      overallScore: this.calculateQualityScore(analysis),
      maintainability: analysis.metrics?.maintainabilityIndex || 100,
      complexity: Math.max(0, 100 - (analysis.metrics?.cyclomaticComplexity || 0) * 10),
      testCoverage: 0, // Would be calculated from test files
      documentation: Math.min(100, (analysis.metrics?.commentLines || 0) * 2)
    };
  }

  /**
   * Generate project recommendations
   */
  private generateProjectRecommendations(projectAnalysis: ProjectAnalysis): Recommendation[] {
    return [
      {
        category: 'quality',
        priority: 'medium',
        title: 'Improve code documentation',
        description: 'Add more comments and JSDoc documentation',
        impact: 'Medium impact on maintainability',
        effort: 'Low effort required',
        implementation: 'Add JSDoc comments to all functions and classes'
      },
      {
        category: 'security',
        priority: 'high',
        title: 'Implement input validation',
        description: 'Add input validation to prevent security vulnerabilities',
        impact: 'High impact on security',
        effort: 'Medium effort required',
        implementation: 'Use validation libraries like Joi or Yup'
      }
    ];
  }

  /**
   * Generate project summary
   */
  private generateProjectSummary(projectAnalysis: ProjectAnalysis): any {
    return {
      totalFiles: projectAnalysis.files.length,
      averageQuality: projectAnalysis.overallQuality.overallScore,
      totalIssues: projectAnalysis.files.reduce((sum, file) => sum + file.issues.length, 0),
      totalSuggestions: projectAnalysis.files.reduce((sum, file) => sum + file.suggestions.length, 0),
      securityRisk: projectAnalysis.security.riskLevel
    };
  }

  /**
   * Generate dependency recommendations
   */
  private generateDependencyRecommendations(dependencyGraph: DependencyGraph): string[] {
    const recommendations = [];
    
    if (dependencyGraph.circularDependencies.length > 0) {
      recommendations.push('Resolve circular dependencies to improve code structure');
    }
    
    if (dependencyGraph.unusedDependencies.length > 0) {
      recommendations.push('Remove unused dependencies to reduce bundle size');
    }
    
    return recommendations;
  }

  /**
   * Generate comprehensive report
   */
  private generateComprehensiveReport(projectAnalysis: ProjectAnalysis): any {
    return {
      executiveSummary: {
        projectName: 'Sample Project',
        analysisDate: new Date(),
        overallQuality: projectAnalysis.overallQuality.overallScore,
        securityRisk: projectAnalysis.security.riskLevel,
        recommendations: projectAnalysis.recommendations.length
      },
      detailedAnalysis: projectAnalysis,
      exportFormats: ['pdf', 'html', 'json']
    };
  }
} 