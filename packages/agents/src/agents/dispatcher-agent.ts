import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, AgentMessage, MessageType } from '@aris/shared';

export class DispatcherAgent extends BaseAgent {
  private complexityThresholds = {
    simple: 0.3,
    medium: 0.7,
    complex: 1.0
  };

  private modelRouting = {
    simple: ['scriba', 'executor'],
    medium: ['architectus', 'scriba'],
    complex: ['architectus', 'prometheus', 'genesis']
  };

  constructor() {
    super(
      'dispatcher-001',
      AgentType.DISPATCHER,
      'Dispatcher',
      'Intelligent task router that analyzes complexity and routes to optimal agents',
      [
        'task-complexity-analysis',
        'intelligent-routing',
        'model-selection',
        'workflow-optimization',
        'resource-allocation'
      ]
    );
  }

  /**
   * Analyze task complexity and route to appropriate agents
   */
  public async processTask(task: Task): Promise<Result<any>> {
    try {
      console.log(`Dispatcher analyzing task: ${task.type}`);
      
      const complexity = await this.analyzeTaskComplexity(task);
      const route = this.determineOptimalRoute(complexity, task);
      
      console.log(`Task complexity: ${complexity.level} (${complexity.score})`);
      console.log(`Routing to: ${route.agents.join(', ')}`);
      
      return {
        success: true,
        data: {
          complexity,
          route,
          originalTask: task
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Dispatcher failed to process task: ${error}`
      };
    }
  }

  /**
   * Analyze task complexity using multiple factors
   */
  private async analyzeTaskComplexity(task: Task): Promise<{ level: string; score: number; factors: any }> {
    const factors = {
      descriptionLength: this.analyzeDescriptionLength(task.description),
      technicalTerms: this.countTechnicalTerms(task.description),
      taskType: this.analyzeTaskType(task.type),
      dataComplexity: this.analyzeDataComplexity(task.data),
      dependencies: task.dependencies?.length || 0
    };

    const score = this.calculateComplexityScore(factors);
    const level = this.determineComplexityLevel(score);

    return { level, score, factors };
  }

  private analyzeDescriptionLength(description: string): number {
    const words = description.split(' ').length;
    return Math.min(words / 50, 1); // Normalize to 0-1 scale
  }

  private countTechnicalTerms(description: string): number {
    const technicalTerms = [
      'architecture', 'scalable', 'microservices', 'authentication', 'authorization',
      'database', 'API', 'endpoint', 'middleware', 'deployment', 'production',
      'testing', 'CI/CD', 'containerization', 'orchestration', 'monitoring',
      'logging', 'caching', 'optimization', 'security', 'encryption', 'validation'
    ];
    
    const found = technicalTerms.filter(term => 
      description.toLowerCase().includes(term.toLowerCase())
    ).length;
    
    return Math.min(found / 10, 1); // Normalize to 0-1 scale
  }

  private analyzeTaskType(taskType: string): number {
    const simpleTasks = ['rename', 'format', 'lint', 'comment', 'import'];
    const mediumTasks = ['refactor', 'optimize', 'test', 'document', 'debug'];
    const complexTasks = ['design', 'architect', 'implement', 'deploy', 'integrate'];
    
    if (simpleTasks.some(type => taskType.includes(type))) return 0.2;
    if (mediumTasks.some(type => taskType.includes(type))) return 0.5;
    if (complexTasks.some(type => taskType.includes(type))) return 0.8;
    
    return 0.5; // Default medium complexity
  }

  private analyzeDataComplexity(data?: any): number {
    if (!data) return 0;
    
    const dataStr = JSON.stringify(data);
    const size = dataStr.length;
    const depth = this.getObjectDepth(data);
    
    return Math.min((size / 1000 + depth / 5) / 2, 1);
  }

  private getObjectDepth(obj: any, depth = 0): number {
    if (!obj || typeof obj !== 'object') return depth;
    
    let maxDepth = depth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        maxDepth = Math.max(maxDepth, this.getObjectDepth(obj[key], depth + 1));
      }
    }
    return maxDepth;
  }

  private calculateComplexityScore(factors: any): number {
    const weights = {
      descriptionLength: 0.1,
      technicalTerms: 0.3,
      taskType: 0.3,
      dataComplexity: 0.2,
      dependencies: 0.1
    };

    return (
      factors.descriptionLength * weights.descriptionLength +
      factors.technicalTerms * weights.technicalTerms +
      factors.taskType * weights.taskType +
      factors.dataComplexity * weights.dataComplexity +
      Math.min(factors.dependencies / 5, 1) * weights.dependencies
    );
  }

  private determineComplexityLevel(score: number): string {
    if (score <= this.complexityThresholds.simple) return 'simple';
    if (score <= this.complexityThresholds.medium) return 'medium';
    return 'complex';
  }

  /**
   * Determine optimal routing based on complexity and task type
   */
  private determineOptimalRoute(complexity: { level: string; score: number }, task: Task): { agents: string[]; workflow: string } {
    const baseAgents = this.modelRouting[complexity.level as keyof typeof this.modelRouting] || ['architectus'];
    
    // Customize routing based on specific task types
    if (task.type.includes('blueprint') || task.type.includes('design')) {
      return {
        agents: ['architectus', 'genesis'],
        workflow: 'blueprint-generation'
      };
    }
    
    if (task.type.includes('code') || task.type.includes('generate')) {
      return {
        agents: ['scriba', 'architectus'],
        workflow: 'code-generation'
      };
    }
    
    if (task.type.includes('audit') || task.type.includes('review')) {
      return {
        agents: ['auditor'],
        workflow: 'code-audit'
      };
    }
    
    if (task.type.includes('execute') || task.type.includes('run')) {
      return {
        agents: ['executor'],
        workflow: 'task-execution'
      };
    }
    
    return {
      agents: baseAgents,
      workflow: 'standard-workflow'
    };
  }

  /**
   * Handle routing requests from other agents
   */
  protected async handleTaskRequest(message: AgentMessage): Promise<Result<any>> {
    const task = message.content as Task;
    return await this.processTask(task);
  }

  /**
   * Handle blueprint requests
   */
  protected async handleBlueprintRequest(message: AgentMessage): Promise<Result<any>> {
    const task: Task = {
      id: `blueprint-${Date.now()}`,
      type: 'generate-blueprint',
      description: message.content.requirements || 'Generate architecture blueprint',
      data: message.content,
      agentType: AgentType.DISPATCHER
    };
    
    return await this.processTask(task);
  }

  /**
   * Handle code generation requests
   */
  protected async handleCodeGenerationRequest(message: AgentMessage): Promise<Result<any>> {
    const task: Task = {
      id: `code-gen-${Date.now()}`,
      type: 'generate-code',
      description: message.content.description || 'Generate code from blueprint',
      data: message.content,
      agentType: AgentType.DISPATCHER
    };
    
    return await this.processTask(task);
  }

  /**
   * Handle audit requests
   */
  protected async handleAuditRequest(message: AgentMessage): Promise<Result<any>> {
    const task: Task = {
      id: `audit-${Date.now()}`,
      type: 'audit-code',
      description: message.content.description || 'Audit code quality',
      data: message.content,
      agentType: AgentType.DISPATCHER
    };
    
    return await this.processTask(task);
  }

  /**
   * Handle execution requests
   */
  protected async handleExecutionRequest(message: AgentMessage): Promise<Result<any>> {
    const task: Task = {
      id: `execute-${Date.now()}`,
      type: 'execute-task',
      description: message.content.description || 'Execute task',
      data: message.content,
      agentType: AgentType.DISPATCHER
    };
    
    return await this.processTask(task);
  }
} 