import { EnhancedRAGSystem } from './enhanced-rag-system';
import { GraphDatabase } from './graph-database';
import { 
  EnhancedRAGConfig,
  GraphConfig,
  CodeNode,
  CodeRelationship,
  ImpactAnalysis,
  GraphStats,
  ASTNode,
  ContextChunk
} from './types';

export interface ProjectCortexConfig {
  rag: EnhancedRAGConfig;
  graph: GraphConfig;
}

export class ProjectCortex {
  private enhancedRAG: EnhancedRAGSystem;
  private graphDB: GraphDatabase;
  private config: ProjectCortexConfig;
  private isInitialized: boolean = false;

  constructor(config: ProjectCortexConfig) {
    this.config = config;
    this.enhancedRAG = new EnhancedRAGSystem(config.rag);
    this.graphDB = new GraphDatabase(config.graph);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing Project Cortex (Complete Multi-Layered Memory System)...');
      console.log('📊 Architecture:');
      console.log('   - Layer 1: Vector Store (Long-Term Associative Memory)');
      console.log('   - Layer 2: Graph Database (Structural & Relational Memory)');
      console.log('   - Layer 3: Cache Store (Short-Term Working Memory)');
      
      // Initialize all layers
      await this.enhancedRAG.initialize();
      await this.graphDB.initialize();
      
      this.isInitialized = true;
      console.log('✅ Project Cortex initialized successfully');
    } catch (error) {
      console.error('❌ Project Cortex initialization failed:', error);
      throw error;
    }
  }

  // Multi-layered context retrieval
  async getComprehensiveContext(
    query: string, 
    agentType: string, 
    filePath?: string,
    includeImpactAnalysis: boolean = false
  ): Promise<{
    semanticContext: ContextChunk[];
    structuralContext: CodeNode[];
    cachedContext: any[];
    impactAnalysis?: ImpactAnalysis;
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      // Layer 1: Semantic context from vector store
      const semanticContext = await this.enhancedRAG.retrieveContext(query, agentType);
      
      // Layer 2: Structural context from graph database
      let structuralContext: CodeNode[] = [];
      if (filePath) {
        const fileNode = await this.graphDB.getNode(`file:${filePath}`);
        if (fileNode) {
          structuralContext = await this.graphDB.getDependencies(fileNode.id, 'both');
        }
      }
      
      // Layer 3: Cached context
      const cachedContext = await this.enhancedRAG.getCachedRAGQuery?.(query, agentType) || [];
      
      // Optional: Impact analysis
      let impactAnalysis: ImpactAnalysis | undefined;
      if (includeImpactAnalysis && filePath) {
        const fileNode = await this.graphDB.getNode(`file:${filePath}`);
        if (fileNode) {
          impactAnalysis = await this.graphDB.analyzeImpact(fileNode.id, 'modify');
        }
      }

      return {
        semanticContext,
        structuralContext,
        cachedContext,
        impactAnalysis
      };
    } catch (error) {
      console.error('❌ Comprehensive context retrieval failed:', error);
      throw error;
    }
  }

  // Advanced code analysis with all layers
  async analyzeCodeComprehensively(
    filePath: string,
    ast: ASTNode,
    query?: string
  ): Promise<{
    semanticAnalysis: ContextChunk[];
    structuralAnalysis: any;
    architecturalAnalysis: any;
    recommendations: string[];
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      // Layer 1: Semantic analysis
      const semanticAnalysis = query 
        ? await this.enhancedRAG.retrieveContext(query, 'architectus')
        : [];

      // Layer 2: Structural analysis
      await this.graphDB.buildFromAST(filePath, ast);
      const structuralAnalysis = await this.graphDB.analyzeArchitecture();
      
      // Layer 3: Cache the analysis results
      await this.enhancedRAG.storeFileContext(filePath, '', ast);

      // Generate comprehensive recommendations
      const recommendations = [
        ...structuralAnalysis.recommendations,
        ...this.generateCodeRecommendations(semanticAnalysis, structuralAnalysis)
      ];

      return {
        semanticAnalysis,
        structuralAnalysis,
        architecturalAnalysis: structuralAnalysis,
        recommendations
      };
    } catch (error) {
      console.error('❌ Comprehensive code analysis failed:', error);
      throw error;
    }
  }

  // Impact analysis for code changes
  async analyzeChangeImpact(
    filePath: string,
    changeType: 'modify' | 'delete' | 'add',
    changeDescription?: string
  ): Promise<{
    impactAnalysis: ImpactAnalysis;
    affectedContext: ContextChunk[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      const fileNode = await this.graphDB.getNode(`file:${filePath}`);
      if (!fileNode) {
        throw new Error(`File node not found: ${filePath}`);
      }

      // Layer 2: Impact analysis
      const impactAnalysis = await this.graphDB.analyzeImpact(fileNode.id, changeType);
      
      // Layer 1: Get affected context
      const affectedContext = await this.enhancedRAG.retrieveContext(
        `code affected by changes in ${filePath}`,
        'auditor'
      );

      // Determine risk level
      const riskLevel = this.calculateRiskLevel(impactAnalysis, affectedContext);
      
      // Generate recommendations
      const recommendations = [
        ...impactAnalysis.recommendations,
        ...this.generateChangeRecommendations(impactAnalysis, riskLevel)
      ];

      return {
        impactAnalysis,
        affectedContext,
        recommendations,
        riskLevel
      };
    } catch (error) {
      console.error('❌ Change impact analysis failed:', error);
      throw error;
    }
  }

  // Architecture visualization and analysis
  async getArchitectureInsights(): Promise<{
    components: any[];
    relationships: any[];
    complexity: number;
    recommendations: string[];
    visualization: any;
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      // Layer 2: Architecture analysis
      const architecture = await this.graphDB.analyzeArchitecture();
      
      // Layer 1: Get architectural patterns
      const patterns = await this.enhancedRAG.retrieveContext(
        'software architecture patterns and best practices',
        'architectus'
      );

      // Generate visualization data
      const visualization = this.generateArchitectureVisualization(architecture);

      return {
        ...architecture,
        visualization
      };
    } catch (error) {
      console.error('❌ Architecture insights failed:', error);
      throw error;
    }
  }

  // Dependency analysis
  async analyzeDependencies(
    nodeId: string,
    depth: number = 3
  ): Promise<{
    dependencies: CodeNode[];
    dependents: CodeNode[];
    circularDependencies: string[];
    recommendations: string[];
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      // Layer 2: Get dependencies
      const dependencies = await this.graphDB.getDependencies(nodeId, 'outgoing');
      const dependents = await this.graphDB.getDependencies(nodeId, 'incoming');
      
      // Detect circular dependencies
      const circularDependencies = this.detectCircularDependencies(dependencies, dependents);
      
      // Generate recommendations
      const recommendations = this.generateDependencyRecommendations(
        dependencies, 
        dependents, 
        circularDependencies
      );

      return {
        dependencies,
        dependents,
        circularDependencies,
        recommendations
      };
    } catch (error) {
      console.error('❌ Dependency analysis failed:', error);
      throw error;
    }
  }

  // Code refactoring suggestions
  async suggestRefactoring(
    filePath: string,
    context: any = {}
  ): Promise<{
    suggestions: string[];
    impactAnalysis: ImpactAnalysis;
    complexityReduction: number;
    priority: 'low' | 'medium' | 'high';
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      // Layer 1: Get refactoring patterns
      const refactoringContext = await this.enhancedRAG.retrieveContext(
        'code refactoring patterns and best practices',
        'architectus'
      );

      // Layer 2: Analyze current structure
      const fileNode = await this.graphDB.getNode(`file:${filePath}`);
      const impactAnalysis = fileNode 
        ? await this.graphDB.analyzeImpact(fileNode.id, 'modify')
        : { sourceNodeId: filePath, changeType: 'modify', affectedNodes: [], totalAffected: 0, impactScore: 0, recommendations: [] };

      // Generate refactoring suggestions
      const suggestions = this.generateRefactoringSuggestions(refactoringContext, impactAnalysis);
      
      // Calculate complexity reduction
      const complexityReduction = this.calculateComplexityReduction(suggestions);
      
      // Determine priority
      const priority = this.determineRefactoringPriority(impactAnalysis, complexityReduction);

      return {
        suggestions,
        impactAnalysis,
        complexityReduction,
        priority
      };
    } catch (error) {
      console.error('❌ Refactoring suggestions failed:', error);
      throw error;
    }
  }

  // Get comprehensive system statistics
  async getSystemStats(): Promise<{
    ragStats: any;
    graphStats: GraphStats;
    cacheStats: any;
    combinedStats: {
      totalQueries: number;
      totalNodes: number;
      totalRelationships: number;
      cacheHitRate: number;
      averageQueryTime: number;
      systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    };
  }> {
    if (!this.isInitialized) throw new Error('Project Cortex not initialized');

    try {
      const [ragStats, graphStats, cacheStats] = await Promise.all([
        this.enhancedRAG.getEnhancedStats(),
        this.graphDB.getGraphStats(),
        this.enhancedRAG.getEnhancedStats() // Cache stats are included in enhanced stats
      ]);

      const combinedStats = {
        totalQueries: ragStats.combinedStats.totalQueries,
        totalNodes: graphStats.totalNodes,
        totalRelationships: graphStats.totalRelationships,
        cacheHitRate: ragStats.combinedStats.cacheHitRate,
        averageQueryTime: ragStats.combinedStats.averageQueryTime,
        systemHealth: this.calculateSystemHealth(ragStats, graphStats)
      };

      return {
        ragStats,
        graphStats,
        cacheStats,
        combinedStats
      };
    } catch (error) {
      console.error('❌ System stats retrieval failed:', error);
      throw error;
    }
  }

  // Utility methods
  private generateCodeRecommendations(semanticAnalysis: ContextChunk[], structuralAnalysis: any): string[] {
    const recommendations: string[] = [];
    
    if (semanticAnalysis.length === 0) {
      recommendations.push('Consider adding more documentation and examples to improve code understanding.');
    }
    
    if (structuralAnalysis.complexity > 8) {
      recommendations.push('High complexity detected. Consider breaking down large components into smaller, focused modules.');
    }
    
    return recommendations;
  }

  private generateChangeRecommendations(impactAnalysis: ImpactAnalysis, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('High-risk change detected. Implement comprehensive testing before deployment.');
      recommendations.push('Consider implementing feature flags for gradual rollout.');
    }
    
    if (impactAnalysis.totalAffected > 20) {
      recommendations.push('Large impact scope. Consider breaking changes into smaller, incremental updates.');
    }
    
    return recommendations;
  }

  private calculateRiskLevel(impactAnalysis: ImpactAnalysis, affectedContext: ContextChunk[]): 'low' | 'medium' | 'high' | 'critical' {
    const impactScore = impactAnalysis.impactScore;
    const affectedCount = impactAnalysis.totalAffected;
    
    if (impactScore > 50 || affectedCount > 30) return 'critical';
    if (impactScore > 25 || affectedCount > 15) return 'high';
    if (impactScore > 10 || affectedCount > 5) return 'medium';
    return 'low';
  }

  private generateArchitectureVisualization(architecture: any): any {
    return {
      nodes: architecture.components.map((comp: any) => ({
        id: comp.type,
        label: comp.type,
        size: comp.count,
        color: this.getComponentColor(comp.type)
      })),
      edges: architecture.relationships.map((rel: any) => ({
        source: rel.type.split('_')[0],
        target: rel.type.split('_')[1] || 'other',
        weight: rel.count
      }))
    };
  }

  private getComponentColor(type: string): string {
    const colors: Record<string, string> = {
      'function': '#4CAF50',
      'class': '#2196F3',
      'file': '#FF9800',
      'import': '#9C27B0',
      'export': '#F44336'
    };
    return colors[type] || '#607D8B';
  }

  private detectCircularDependencies(dependencies: CodeNode[], dependents: CodeNode[]): string[] {
    // Simple circular dependency detection
    const circular: string[] = [];
    const dependencyIds = new Set(dependencies.map(d => d.id));
    const dependentIds = new Set(dependents.map(d => d.id));
    
    for (const dep of dependencies) {
      if (dependentIds.has(dep.id)) {
        circular.push(dep.id);
      }
    }
    
    return circular;
  }

  private generateDependencyRecommendations(
    dependencies: CodeNode[], 
    dependents: CodeNode[], 
    circular: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (circular.length > 0) {
      recommendations.push('Circular dependencies detected. Consider refactoring to break dependency cycles.');
    }
    
    if (dependencies.length > 20) {
      recommendations.push('High number of dependencies. Consider dependency injection or modularization.');
    }
    
    if (dependents.length > 10) {
      recommendations.push('Many components depend on this. Consider interface segregation.');
    }
    
    return recommendations;
  }

  private generateRefactoringSuggestions(context: ContextChunk[], impactAnalysis: ImpactAnalysis): string[] {
    const suggestions: string[] = [];
    
    if (impactAnalysis.impactScore > 30) {
      suggestions.push('High impact changes detected. Consider incremental refactoring approach.');
    }
    
    if (context.length > 0) {
      suggestions.push('Apply established refactoring patterns from similar codebases.');
    }
    
    suggestions.push('Extract common functionality into reusable utilities.');
    suggestions.push('Consider applying SOLID principles to improve code structure.');
    
    return suggestions;
  }

  private calculateComplexityReduction(suggestions: string[]): number {
    // Simple complexity reduction calculation
    return Math.min(suggestions.length * 0.5, 5);
  }

  private determineRefactoringPriority(impactAnalysis: ImpactAnalysis, complexityReduction: number): 'low' | 'medium' | 'high' {
    if (impactAnalysis.impactScore > 40 || complexityReduction > 3) return 'high';
    if (impactAnalysis.impactScore > 20 || complexityReduction > 1) return 'medium';
    return 'low';
  }

  private calculateSystemHealth(ragStats: any, graphStats: GraphStats): 'excellent' | 'good' | 'fair' | 'poor' {
    const cacheHitRate = ragStats.combinedStats.cacheHitRate;
    const totalNodes = graphStats.totalNodes;
    const totalRelationships = graphStats.totalRelationships;
    
    if (cacheHitRate > 0.8 && totalNodes > 100 && totalRelationships > 200) return 'excellent';
    if (cacheHitRate > 0.6 && totalNodes > 50 && totalRelationships > 100) return 'good';
    if (cacheHitRate > 0.4 && totalNodes > 20 && totalRelationships > 50) return 'fair';
    return 'poor';
  }

  async close(): Promise<void> {
    try {
      await this.enhancedRAG.close();
      await this.graphDB.close();
      console.log('🔌 Project Cortex closed');
    } catch (error) {
      console.error('❌ Project Cortex closure failed:', error);
    }
  }
} 