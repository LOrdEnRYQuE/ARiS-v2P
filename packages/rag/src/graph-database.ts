import neo4j, { Driver, Session, Transaction } from 'neo4j-driver';
import { ASTNode, CodeRelationship, ImpactAnalysis, GraphStats } from './types';

export interface GraphConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
  maxConnectionPoolSize?: number;
  connectionTimeout?: number;
}

export interface CodeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'variable' | 'import' | 'export' | 'api_endpoint' | 'database_table';
  name: string;
  path?: string;
  language: string;
  metadata: any;
}

export interface CodeRelationship {
  type: 'IMPORTS' | 'CALLS' | 'INHERITS_FROM' | 'IMPLEMENTS' | 'REFERENCES_TABLE' | 'DEPENDS_ON' | 'USES' | 'EXTENDS';
  sourceId: string;
  targetId: string;
  properties: any;
}

export class GraphDatabase {
  private driver: Driver;
  private config: GraphConfig;
  private isInitialized: boolean = false;

  constructor(config: GraphConfig) {
    this.config = config;
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
      {
        maxConnectionPoolSize: config.maxConnectionPoolSize || 50,
        connectionTimeout: config.connectionTimeout || 30000,
      }
    );
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Graph Database (Layer 2: Structural & Relational Memory)...');
      
      // Test connection
      const session = this.driver.session();
      await session.run('RETURN 1 as test');
      await session.close();
      
      // Create indexes for performance
      await this.createIndexes();
      
      this.isInitialized = true;
      console.log('✅ Graph Database initialized successfully');
    } catch (error) {
      console.error('❌ Graph Database initialization failed:', error);
      throw new Error(`Graph Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createIndexes(): Promise<void> {
    const session = this.driver.session();
    try {
      // Create indexes for better query performance
      await session.run('CREATE INDEX code_node_id IF NOT EXISTS FOR (n:CodeNode) ON (n.id)');
      await session.run('CREATE INDEX code_node_type IF NOT EXISTS FOR (n:CodeNode) ON (n.type)');
      await session.run('CREATE INDEX code_node_language IF NOT EXISTS FOR (n:CodeNode) ON (n.language)');
      await session.run('CREATE INDEX relationship_type IF NOT EXISTS FOR ()-[r:RELATES_TO]-() ON (r.type)');
    } finally {
      await session.close();
    }
  }

  // Node Management
  async createNode(node: CodeNode): Promise<void> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      const query = `
        MERGE (n:CodeNode {id: $id})
        SET n.type = $type,
            n.name = $name,
            n.path = $path,
            n.language = $language,
            n.metadata = $metadata,
            n.createdAt = datetime()
        RETURN n
      `;
      
      await session.run(query, {
        id: node.id,
        type: node.type,
        name: node.name,
        path: node.path,
        language: node.language,
        metadata: JSON.stringify(node.metadata)
      });
      
      console.log(`📊 Created/Updated node: ${node.type} - ${node.name}`);
    } finally {
      await session.close();
    }
  }

  async getNode(nodeId: string): Promise<CodeNode | null> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      const result = await session.run(
        'MATCH (n:CodeNode {id: $id}) RETURN n',
        { id: nodeId }
      );
      
      if (result.records.length > 0) {
        const record = result.records[0];
        const node = record.get('n').properties;
        return {
          id: node.id,
          type: node.type,
          name: node.name,
          path: node.path,
          language: node.language,
          metadata: JSON.parse(node.metadata)
        };
      }
      
      return null;
    } finally {
      await session.close();
    }
  }

  // Relationship Management
  async createRelationship(relationship: CodeRelationship): Promise<void> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      const query = `
        MATCH (source:CodeNode {id: $sourceId})
        MATCH (target:CodeNode {id: $targetId})
        MERGE (source)-[r:RELATES_TO {type: $type}]->(target)
        SET r.properties = $properties,
            r.createdAt = datetime()
        RETURN r
      `;
      
      await session.run(query, {
        sourceId: relationship.sourceId,
        targetId: relationship.targetId,
        type: relationship.type,
        properties: JSON.stringify(relationship.properties)
      });
      
      console.log(`🔗 Created relationship: ${relationship.sourceId} -[${relationship.type}]-> ${relationship.targetId}`);
    } finally {
      await session.close();
    }
  }

  // Impact Analysis
  async analyzeImpact(nodeId: string, changeType: 'modify' | 'delete' | 'add'): Promise<ImpactAnalysis> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      // Find all nodes that would be affected by a change to this node
      const query = `
        MATCH (start:CodeNode {id: $nodeId})
        CALL apoc.path.subgraphAll(start, {
          maxLevel: 3,
          relationshipFilter: 'RELATES_TO'
        })
        YIELD nodes, relationships
        RETURN nodes, relationships
      `;
      
      const result = await session.run(query, { nodeId });
      
      if (result.records.length > 0) {
        const record = result.records[0];
        const nodes = record.get('nodes');
        const relationships = record.get('relationships');
        
        const affectedNodes = nodes.map((node: any) => ({
          id: node.properties.id,
          type: node.properties.type,
          name: node.properties.name,
          path: node.properties.path,
          impactLevel: this.calculateImpactLevel(node, changeType)
        }));
        
        return {
          sourceNodeId: nodeId,
          changeType,
          affectedNodes,
          totalAffected: affectedNodes.length,
          impactScore: this.calculateImpactScore(affectedNodes),
          recommendations: this.generateRecommendations(affectedNodes, changeType)
        };
      }
      
      return {
        sourceNodeId: nodeId,
        changeType,
        affectedNodes: [],
        totalAffected: 0,
        impactScore: 0,
        recommendations: []
      };
    } finally {
      await session.close();
    }
  }

  // Code Dependency Analysis
  async getDependencies(nodeId: string, direction: 'incoming' | 'outgoing' | 'both' = 'both'): Promise<CodeNode[]> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      let query: string;
      
      switch (direction) {
        case 'incoming':
          query = `
            MATCH (target:CodeNode {id: $nodeId})<-[:RELATES_TO]-(source:CodeNode)
            RETURN source
          `;
          break;
        case 'outgoing':
          query = `
            MATCH (source:CodeNode {id: $nodeId})-[:RELATES_TO]->(target:CodeNode)
            RETURN target
          `;
          break;
        default:
          query = `
            MATCH (source:CodeNode {id: $nodeId})-[:RELATES_TO]-(related:CodeNode)
            RETURN related
          `;
      }
      
      const result = await session.run(query, { nodeId });
      
      return result.records.map(record => {
        const node = record.get('related' || 'source' || 'target').properties;
        return {
          id: node.id,
          type: node.type,
          name: node.name,
          path: node.path,
          language: node.language,
          metadata: JSON.parse(node.metadata)
        };
      });
    } finally {
      await session.close();
    }
  }

  // Architecture Analysis
  async analyzeArchitecture(): Promise<{
    components: any[];
    relationships: any[];
    complexity: number;
    recommendations: string[];
  }> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      // Get all components grouped by type
      const componentsQuery = `
        MATCH (n:CodeNode)
        RETURN n.type as type, count(n) as count, collect(n.name) as names
        ORDER BY count DESC
      `;
      
      const componentsResult = await session.run(componentsQuery);
      const components = componentsResult.records.map(record => ({
        type: record.get('type'),
        count: record.get('count').toNumber(),
        names: record.get('names')
      }));
      
      // Get relationship distribution
      const relationshipsQuery = `
        MATCH ()-[r:RELATES_TO]->()
        RETURN r.type as type, count(r) as count
        ORDER BY count DESC
      `;
      
      const relationshipsResult = await session.run(relationshipsQuery);
      const relationships = relationshipsResult.records.map(record => ({
        type: record.get('type'),
        count: record.get('count').toNumber()
      }));
      
      // Calculate complexity score
      const complexity = this.calculateComplexityScore(components, relationships);
      
      // Generate recommendations
      const recommendations = this.generateArchitectureRecommendations(components, relationships, complexity);
      
      return {
        components,
        relationships,
        complexity,
        recommendations
      };
    } finally {
      await session.close();
    }
  }

  // AST Integration
  async buildFromAST(filePath: string, ast: ASTNode): Promise<void> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      // Create file node
      const fileNode: CodeNode = {
        id: `file:${filePath}`,
        type: 'file',
        name: filePath.split('/').pop() || filePath,
        path: filePath,
        language: this.getLanguageFromFile(filePath),
        metadata: { size: 0, lastModified: new Date() }
      };
      
      await this.createNode(fileNode);
      
      // Process AST nodes
      await this.processASTNode(ast, filePath, session);
      
      console.log(`🌳 Built graph from AST for: ${filePath}`);
    } finally {
      await session.close();
    }
  }

  private async processASTNode(node: ASTNode, filePath: string, session: Session): Promise<void> {
    // Create node for this AST element
    const codeNode: CodeNode = {
      id: `${filePath}:${node.type}:${node.name || 'anonymous'}`,
      type: this.mapASTTypeToNodeType(node.type),
      name: node.name || 'anonymous',
      path: filePath,
      language: this.getLanguageFromFile(filePath),
      metadata: {
        startLine: node.startLine,
        endLine: node.endLine,
        ...node.metadata
      }
    };
    
    await this.createNode(codeNode);
    
    // Create relationship to parent file
    const fileRelationship: CodeRelationship = {
      type: 'DEPENDS_ON',
      sourceId: codeNode.id,
      targetId: `file:${filePath}`,
      properties: { relationship: 'belongs_to' }
    };
    
    await this.createRelationship(fileRelationship);
    
    // Process children
    if (node.children) {
      for (const child of node.children) {
        await this.processASTNode(child, filePath, session);
        
        // Create parent-child relationship
        const childRelationship: CodeRelationship = {
          type: 'DEPENDS_ON',
          sourceId: child.name ? `${filePath}:${child.type}:${child.name}` : `${filePath}:${child.type}:anonymous`,
          targetId: codeNode.id,
          properties: { relationship: 'child_of' }
        };
        
        await this.createRelationship(childRelationship);
      }
    }
  }

  // Utility Methods
  private mapASTTypeToNodeType(astType: string): CodeNode['type'] {
    const typeMap: Record<string, CodeNode['type']> = {
      'function': 'function',
      'method': 'function',
      'class': 'class',
      'interface': 'class',
      'variable': 'variable',
      'import': 'import',
      'export': 'export',
      'component': 'function',
      'hook': 'function'
    };
    
    return typeMap[astType] || 'function';
  }

  private getLanguageFromFile(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust'
    };
    
    return languageMap[ext || ''] || 'javascript';
  }

  private calculateImpactLevel(node: any, changeType: string): 'low' | 'medium' | 'high' | 'critical' {
    const nodeType = node.properties.type;
    
    if (changeType === 'delete') {
      if (nodeType === 'file') return 'critical';
      if (nodeType === 'class') return 'high';
      if (nodeType === 'function') return 'medium';
      return 'low';
    }
    
    if (changeType === 'modify') {
      if (nodeType === 'function') return 'medium';
      if (nodeType === 'class') return 'high';
      return 'low';
    }
    
    return 'low';
  }

  private calculateImpactScore(affectedNodes: any[]): number {
    const impactWeights = { low: 1, medium: 3, high: 5, critical: 10 };
    return affectedNodes.reduce((score, node) => {
      return score + (impactWeights[node.impactLevel] || 1);
    }, 0);
  }

  private generateRecommendations(affectedNodes: any[], changeType: string): string[] {
    const recommendations: string[] = [];
    
    if (affectedNodes.length > 10) {
      recommendations.push('High impact change detected. Consider breaking this into smaller changes.');
    }
    
    const criticalNodes = affectedNodes.filter(n => n.impactLevel === 'critical');
    if (criticalNodes.length > 0) {
      recommendations.push('Critical nodes will be affected. Ensure comprehensive testing.');
    }
    
    if (changeType === 'delete') {
      recommendations.push('Deletion detected. Verify no critical dependencies will be broken.');
    }
    
    return recommendations;
  }

  private calculateComplexityScore(components: any[], relationships: any[]): number {
    const totalComponents = components.reduce((sum, comp) => sum + comp.count, 0);
    const totalRelationships = relationships.reduce((sum, rel) => sum + rel.count, 0);
    
    // Simple complexity formula: (relationships / components) * log(components)
    return (totalRelationships / Math.max(totalComponents, 1)) * Math.log(Math.max(totalComponents, 1));
  }

  private generateArchitectureRecommendations(components: any[], relationships: any[], complexity: number): string[] {
    const recommendations: string[] = [];
    
    if (complexity > 10) {
      recommendations.push('High architectural complexity detected. Consider modularization.');
    }
    
    const functionCount = components.find(c => c.type === 'function')?.count || 0;
    const classCount = components.find(c => c.type === 'class')?.count || 0;
    
    if (functionCount > classCount * 5) {
      recommendations.push('High function-to-class ratio. Consider grouping related functions into classes.');
    }
    
    const importCount = components.find(c => c.type === 'import')?.count || 0;
    if (importCount > 50) {
      recommendations.push('High number of imports. Consider dependency management and bundling.');
    }
    
    return recommendations;
  }

  // Statistics
  async getGraphStats(): Promise<GraphStats> {
    if (!this.isInitialized) throw new Error('Graph Database not initialized');
    
    const session = this.driver.session();
    try {
      const nodeCount = await session.run('MATCH (n:CodeNode) RETURN count(n) as count');
      const relationshipCount = await session.run('MATCH ()-[r:RELATES_TO]->() RETURN count(r) as count');
      const fileCount = await session.run('MATCH (n:CodeNode {type: "file"}) RETURN count(n) as count');
      
      return {
        totalNodes: nodeCount.records[0].get('count').toNumber(),
        totalRelationships: relationshipCount.records[0].get('count').toNumber(),
        totalFiles: fileCount.records[0].get('count').toNumber(),
        lastUpdated: new Date()
      };
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('🔌 Graph Database connection closed');
    }
  }
} 