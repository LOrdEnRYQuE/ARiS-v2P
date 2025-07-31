import { Agent, AgentType, Task, Result, AgentMessage, MessageType, WorkflowStep, WorkflowResult, TaskStatus, TaskPriority } from '@aris/shared';
import { DispatcherAgent } from './agents/dispatcher-agent';
import { ConsensusManager } from './agents/consensus-manager';
import { LearningAuditor } from './agents/learning-auditor';
import { ArchitectusAgent } from './agents/architectus-agent';
import { ScribaAgent } from './agents/scriba-agent';
import { AuditorAgent } from './agents/auditor-agent';
import { PrometheusAgent } from './agents/prometheus-agent';
import { GenesisAgent } from './agents/genesis-agent';
import { ExecutorAgent } from './agents/executor-agent';
import { ProductionAgent } from './agents/production-agent';
import * as fs from 'fs/promises';
import * as path from 'path';

export class AgentManager {
  private agents: Map<AgentType, Agent>;
  private workflows: Map<string, WorkflowStep[]>;
  private messageQueue: Map<AgentType, AgentMessage[]>;
  private fileSystem: FileSystemOperations;

  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
    this.messageQueue = new Map();
    this.fileSystem = new FileSystemOperations();
    this.initializeAgents();
    this.initializeWorkflows();
  }

  private initializeAgents(): void {
    this.agents.set(AgentType.DISPATCHER, new DispatcherAgent());
    this.agents.set(AgentType.AUDITOR, new LearningAuditor()); // Use LearningAuditor instead of ConsensusManager
    this.agents.set(AgentType.ARCHITECTUS, new ArchitectusAgent());
    this.agents.set(AgentType.SCRIBA, new ScribaAgent());
    this.agents.set(AgentType.PROMETHEUS, new PrometheusAgent());
    this.agents.set(AgentType.GENESIS, new GenesisAgent());
    this.agents.set(AgentType.EXECUTOR, new ExecutorAgent());
    this.agents.set(AgentType.PRODUCTION, new ProductionAgent());

    // Initialize message queues for each agent
    Object.values(AgentType).forEach(agentType => {
      this.messageQueue.set(agentType, []);
    });
  }

  private initializeWorkflows(): void {
    // Phase 1 Workflows
    this.workflows.set('blueprint-to-code', [
      {
        agent: AgentType.ARCHITECTUS,
        task: 'generate-blueprint',
        description: 'Generate architecture blueprint from requirements'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-code',
        description: 'Generate code files from blueprint'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-code',
        description: 'Audit generated code for quality and best practices'
      }
    ]);

    this.workflows.set('code-analysis', [
      {
        agent: AgentType.AUDITOR,
        task: 'analyze-code',
        description: 'Analyze existing code for quality and improvements'
      }
    ]);

    // Phase 2 Workflows
    this.workflows.set('project-management', [
      {
        agent: AgentType.PROMETHEUS,
        task: 'create-project',
        description: 'Create project with template and workflow'
      },
      {
        agent: AgentType.PROMETHEUS,
        task: 'manage-workflow',
        description: 'Manage workflow execution and progress tracking'
      },
      {
        agent: AgentType.PROMETHEUS,
        task: 'track-progress',
        description: 'Track project progress and resource allocation'
      }
    ]);

    this.workflows.set('multi-file-analysis', [
      {
        agent: AgentType.AUDITOR,
        task: 'analyze-project',
        description: 'Analyze entire project for quality and architecture'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'security-audit',
        description: 'Perform security audit and vulnerability assessment'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'dependency-analysis',
        description: 'Analyze dependencies and detect circular references'
      }
    ]);

    this.workflows.set('complete-project-generation', [
      {
        agent: AgentType.PROMETHEUS,
        task: 'create-project',
        description: 'Create project with template and workflow'
      },
      {
        agent: AgentType.ARCHITECTUS,
        task: 'generate-blueprint',
        description: 'Generate architecture blueprint from requirements'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-code',
        description: 'Generate code files from blueprint'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'analyze-project',
        description: 'Analyze entire project for quality and architecture'
      },
      {
        agent: AgentType.PROMETHEUS,
        task: 'optimize-resources',
        description: 'Optimize resource allocation and performance'
      }
    ]);

    // Phase 3 Workflows
    this.workflows.set('frontend-generation', [
      {
        agent: AgentType.GENESIS,
        task: 'create-frontend-project',
        description: 'Create complete frontend project with UI components'
      },
      {
        agent: AgentType.GENESIS,
        task: 'generate-responsive-layout',
        description: 'Generate responsive layout and styling'
      },
      {
        agent: AgentType.GENESIS,
        task: 'setup-state-management',
        description: 'Setup state management and routing'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-frontend-code',
        description: 'Generate frontend code files and components'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-frontend',
        description: 'Audit frontend code for quality and best practices'
      }
    ]);

    this.workflows.set('ui-component-design', [
      {
        agent: AgentType.GENESIS,
        task: 'design-component',
        description: 'Design UI component with props and styling'
      },
      {
        agent: AgentType.GENESIS,
        task: 'generate-styles',
        description: 'Generate component styles and theme'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-component-code',
        description: 'Generate component code files'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-component',
        description: 'Audit component for accessibility and best practices'
      }
    ]);

    this.workflows.set('full-stack-generation', [
      {
        agent: AgentType.PROMETHEUS,
        task: 'create-project',
        description: 'Create full-stack project with frontend and backend'
      },
      {
        agent: AgentType.ARCHITECTUS,
        task: 'generate-blueprint',
        description: 'Generate architecture blueprint for full-stack app'
      },
      {
        agent: AgentType.GENESIS,
        task: 'create-frontend-project',
        description: 'Create frontend with UI components and styling'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-backend-code',
        description: 'Generate backend API and database code'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-frontend-code',
        description: 'Generate frontend code and components'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-full-stack',
        description: 'Audit full-stack application for quality and security'
      }
    ]);

    // Phase 4 Workflows
    this.workflows.set('deployment-automation', [
      {
        agent: AgentType.EXECUTOR,
        task: 'setup-environment',
        description: 'Setup deployment environment and dependencies'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'build-project',
        description: 'Build project for deployment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'run-tests',
        description: 'Run tests to ensure quality before deployment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'deploy-application',
        description: 'Deploy application to target environment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'monitor-process',
        description: 'Monitor deployment and application health'
      }
    ]);

    this.workflows.set('ci-cd-pipeline', [
      {
        agent: AgentType.PROMETHEUS,
        task: 'create-project',
        description: 'Initialize CI/CD pipeline project'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'setup-environment',
        description: 'Setup CI/CD environment and tools'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'build-project',
        description: 'Build project in CI environment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'run-tests',
        description: 'Run comprehensive test suite'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-code',
        description: 'Audit code quality and security'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'deploy-application',
        description: 'Deploy to staging/production environment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'monitor-process',
        description: 'Monitor deployment and application metrics'
      }
    ]);

    this.workflows.set('performance-optimization', [
      {
        agent: AgentType.EXECUTOR,
        task: 'monitor-process',
        description: 'Monitor current application performance'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'analyze-code',
        description: 'Analyze code for performance bottlenecks'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'optimize-performance',
        description: 'Apply performance optimizations'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'run-tests',
        description: 'Run performance tests to verify improvements'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'deploy-application',
        description: 'Deploy optimized application'
      }
    ]);

    this.workflows.set('complete-automation', [
      {
        agent: AgentType.PROMETHEUS,
        task: 'create-project',
        description: 'Create project with automation pipeline'
      },
      {
        agent: AgentType.ARCHITECTUS,
        task: 'generate-blueprint',
        description: 'Generate architecture blueprint with deployment strategy'
      },
      {
        agent: AgentType.GENESIS,
        task: 'create-frontend-project',
        description: 'Create frontend with deployment configuration'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-backend-code',
        description: 'Generate backend with deployment scripts'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'setup-environment',
        description: 'Setup complete deployment environment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'build-project',
        description: 'Build complete application'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'run-tests',
        description: 'Run comprehensive test suite'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-full-stack',
        description: 'Audit complete application for quality and security'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'deploy-application',
        description: 'Deploy to production environment'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'monitor-process',
        description: 'Monitor production deployment and metrics'
      }
    ]);

    // Phase 5 Workflows
    this.workflows.set('production-deployment', [
      {
        agent: AgentType.PRODUCTION,
        task: 'deploy-production',
        description: 'Deploy application to production with advanced configuration'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'setup-monitoring',
        description: 'Setup comprehensive monitoring and alerting'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'security-scan',
        description: 'Perform comprehensive security scanning'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'compliance-check',
        description: 'Perform compliance checks and generate reports'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'manage-scaling',
        description: 'Setup and manage auto-scaling policies'
      }
    ]);

    this.workflows.set('advanced-deployment-strategies', [
      {
        agent: AgentType.PRODUCTION,
        task: 'blue-green-deploy',
        description: 'Perform blue-green deployment for zero downtime'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'canary-deploy',
        description: 'Perform canary deployment for gradual rollout'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'rolling-deploy',
        description: 'Perform rolling deployment with health checks'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'setup-monitoring',
        description: 'Setup monitoring for deployment strategies'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'optimize-performance',
        description: 'Optimize performance after deployment'
      }
    ]);

    this.workflows.set('security-hardening', [
      {
        agent: AgentType.PRODUCTION,
        task: 'security-scan',
        description: 'Perform comprehensive security vulnerability scan'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'compliance-check',
        description: 'Perform compliance checks against security frameworks'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-code',
        description: 'Audit code for security vulnerabilities'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'setup-monitoring',
        description: 'Setup security monitoring and alerting'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'disaster-recovery',
        description: 'Setup disaster recovery procedures'
      }
    ]);

    this.workflows.set('performance-optimization-production', [
      {
        agent: AgentType.PRODUCTION,
        task: 'optimize-performance',
        description: 'Analyze and optimize production performance'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'manage-scaling',
        description: 'Setup auto-scaling based on performance analysis'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'setup-monitoring',
        description: 'Setup performance monitoring and alerting'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'analyze-code',
        description: 'Analyze code for performance bottlenecks'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'deploy-production',
        description: 'Deploy optimized application to production'
      }
    ]);

    this.workflows.set('complete-production-pipeline', [
      {
        agent: AgentType.PROMETHEUS,
        task: 'create-project',
        description: 'Create production-ready project with pipeline'
      },
      {
        agent: AgentType.ARCHITECTUS,
        task: 'generate-blueprint',
        description: 'Generate production architecture blueprint'
      },
      {
        agent: AgentType.GENESIS,
        task: 'create-frontend-project',
        description: 'Create frontend with production configuration'
      },
      {
        agent: AgentType.SCRIBA,
        task: 'generate-backend-code',
        description: 'Generate backend with production deployment scripts'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'setup-environment',
        description: 'Setup production environment and dependencies'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'build-project',
        description: 'Build production-ready application'
      },
      {
        agent: AgentType.EXECUTOR,
        task: 'run-tests',
        description: 'Run comprehensive production tests'
      },
      {
        agent: AgentType.AUDITOR,
        task: 'audit-full-stack',
        description: 'Audit complete application for production readiness'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'security-scan',
        description: 'Perform production security scanning'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'compliance-check',
        description: 'Perform production compliance checks'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'deploy-production',
        description: 'Deploy to production with advanced configuration'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'setup-monitoring',
        description: 'Setup comprehensive production monitoring'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'manage-scaling',
        description: 'Setup production auto-scaling policies'
      },
      {
        agent: AgentType.PRODUCTION,
        task: 'disaster-recovery',
        description: 'Setup production disaster recovery procedures'
      }
    ]);
  }

  // Real Agent Communication System
  public async sendMessage(to: AgentType, message: AgentMessage): Promise<Result<any>> {
    try {
      const queue = this.messageQueue.get(to) || [];
      queue.push(message);
      this.messageQueue.set(to, queue);
      
      console.log(`Message sent to ${to}:`, message);
      return { success: true, data: message };
    } catch (error) {
      return { success: false, error: `Failed to send message: ${error}` };
    }
  }

  public async receiveMessages(agent: AgentType): Promise<AgentMessage[]> {
    const queue = this.messageQueue.get(agent) || [];
    this.messageQueue.set(agent, []);
    return queue;
  }

  public async broadcastMessage(message: AgentMessage): Promise<void> {
    for (const agentType of Object.values(AgentType)) {
      await this.sendMessage(agentType, message);
    }
  }

  // File System Operations
  public async createFile(filePath: string, content: string): Promise<Result<void>> {
    return await this.fileSystem.createFile(filePath, content);
  }

  public async createDirectory(dirPath: string): Promise<Result<void>> {
    return await this.fileSystem.createDirectory(dirPath);
  }

  public async modifyFile(filePath: string, content: string): Promise<Result<void>> {
    return await this.fileSystem.modifyFile(filePath, content);
  }

  public async deleteFile(filePath: string): Promise<Result<void>> {
    return await this.fileSystem.deleteFile(filePath);
  }

  public async readFile(filePath: string): Promise<Result<string>> {
    return await this.fileSystem.readFile(filePath);
  }

  // Enhanced Workflow Execution with Real File Operations
  public async executeWorkflow(workflowName: string, initialData: any, progressCallback?: (step: WorkflowStep, result: Result<any>) => void): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      return { success: false, error: `Workflow '${workflowName}' not found` };
    }

    const steps: Array<{ step: WorkflowStep; result: Result<any> }> = [];
    let currentData = initialData;

    for (const step of workflow) {
      const agent = this.agents.get(step.agent);
      if (!agent) {
        return { success: false, error: `Agent '${step.agent}' not found` };
      }

      const task: Task = {
        id: `task_${Date.now()}`,
        type: step.task,
        description: step.description,
        data: currentData,
        agentType: step.agent,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await (agent as any).processTask(task);
      steps.push({ step, result });

      if (progressCallback) {
        progressCallback(step, result);
      }

      if (!result.success) {
        return { 
          success: false, 
          error: `Step '${step.task}' failed: ${result.error}`,
          steps 
        };
      }

      currentData = result.data;
    }

    return { success: true, data: currentData, steps };
  }

  // Public API Methods
  public async generateProjectFromRequirements(requirements: string, outputPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('blueprint-to-code', { requirements, outputPath }, (step, result) => {
      console.log(`📝 ${step.description}`);
      console.log(`🤖 Agent: ${step.agent}`);
      console.log(`✅ Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (step.agent === AgentType.ARCHITECTUS && result.success) {
        const blueprint = result.data;
        console.log(`🏗️  Blueprint ID: ${blueprint?.id || 'N/A'}`);
        console.log(`🔗 API Endpoints: ${blueprint?.apiContracts?.length || 0}`);
        console.log(`💾 Database Tables: ${blueprint?.databaseSchema?.tables?.length || 0}`);
      } else if (step.agent === AgentType.SCRIBA && result.success) {
        console.log(`📄 Files Generated: ${result.data?.files?.length || 0}`);
      } else if (step.agent === AgentType.AUDITOR && result.success) {
        const audit = result.data;
        console.log(`📊 Quality Score: ${audit?.qualityScore || 'N/A'}`);
        console.log(`⚠️  Issues Found: ${audit?.issues?.length || 0}`);
      }
    });

    return result;
  }

  public async analyzeCode(code: string, filePath?: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('code-analysis', { code, filePath }, (step, result) => {
      console.log(`📝 ${step.description}`);
      console.log(`🤖 Agent: ${step.agent}`);
      console.log(`✅ Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (step.agent === AgentType.AUDITOR && result.success) {
        const audit = result.data;
        console.log(`📊 Quality Score: ${audit?.qualityScore || 'N/A'}`);
        console.log(`🔍 Functions Found: ${audit?.functions?.length || 0}`);
        console.log(`⚠️  Issues: ${audit?.issues?.length || 0}`);
      }
    });

    return result;
  }

  // Phase 2 Methods
  public async createAndManageProject(projectName: string, description: string, requirements: string): Promise<Result<any>> {
    return await this.executeWorkflow('project-management', { projectName, description, requirements });
  }

  public async analyzeProject(projectPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('multi-file-analysis', { projectPath });
  }

  public async generateCompleteProject(projectName: string, description: string, requirements: string, outputPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('complete-project-generation', { projectName, description, requirements, outputPath });
  }

  // Phase 3 Methods
  public async generateFrontendProject(projectName: string, requirements: string, framework: string = 'react'): Promise<Result<any>> {
    return await this.executeWorkflow('frontend-generation', { projectName, requirements, framework });
  }

  public async designUIComponent(componentType: string, requirements: string, framework: string = 'react'): Promise<Result<any>> {
    return await this.executeWorkflow('ui-component-design', { componentType, requirements, framework });
  }

  public async generateFullStackApp(projectName: string, description: string, requirements: string, outputPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('full-stack-generation', { projectName, description, requirements, outputPath });
  }

  public async generateResponsiveLayout(layoutType: string, components: any[], breakpoints: any): Promise<Result<any>> {
    return await this.executeWorkflow('ui-component-design', { layoutType, components, breakpoints });
  }

  public async setupStateManagement(type: string, stores: any[]): Promise<Result<any>> {
    return await this.executeWorkflow('frontend-generation', { stateManagementType: type, stores });
  }

  // Phase 4 Methods
  public async executeCommand(command: string, args: string[] = [], cwd: string = process.cwd(), env: Record<string, string> = {}, timeout: number = 30000): Promise<Result<any>> {
    return await this.executeWorkflow('deployment-automation', { command, args, cwd, env, timeout });
  }

  public async deployApplication(deploymentConfig: any, applicationPath: string, environment: string = 'production'): Promise<Result<any>> {
    return await this.executeWorkflow('deployment-automation', { deploymentConfig, applicationPath, environment });
  }

  public async buildProject(buildConfig: any, projectPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('deployment-automation', { buildConfig, projectPath });
  }

  public async setupEnvironment(environmentConfig: any, projectPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('deployment-automation', { environmentConfig, projectPath });
  }

  public async runCICDPipeline(projectName: string, description: string, requirements: string): Promise<Result<any>> {
    return await this.executeWorkflow('ci-cd-pipeline', { projectName, description, requirements });
  }

  public async optimizePerformance(optimizationConfig: any, projectPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('performance-optimization', { optimizationConfig, projectPath });
  }

  public async automateCompleteProject(projectName: string, description: string, requirements: string, outputPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('complete-automation', { projectName, description, requirements, outputPath });
  }

  public async monitorProcess(processId: string, metrics: string[] = ['cpu', 'memory', 'disk']): Promise<Result<any>> {
    return await this.executeWorkflow('performance-optimization', { processId, metrics });
  }

  public async runTests(testConfig: any, projectPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('deployment-automation', { testConfig, projectPath });
  }

  // Phase 5 Methods
  public async deployToProduction(productionConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('production-deployment', { 
      productionConfig, 
      applicationPath,
      monitoringConfig: productionConfig?.monitoring,
      scalingConfig: productionConfig?.scaling
    });
    
    // Return the data from the first step (deploy-production) instead of the last step
    if (result.success && result.steps && result.steps.length > 0) {
      return result.steps[0].result;
    }
    return result;
  }

  public async performSecurityScan(scanConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('security-hardening', { 
      scanConfig, 
      applicationPath,
      monitoringConfig: { enabled: true, metrics: ['security'] }
    });
    
    // Return the data from the first step (security-scan) instead of the last step
    if (result.success && result.steps && result.steps.length > 0) {
      return result.steps[0].result;
    }
    return result;
  }

  public async performComplianceCheck(complianceConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('security-hardening', { 
      complianceConfig, 
      applicationPath,
      monitoringConfig: { enabled: true, metrics: ['compliance'] }
    });
    
    // Return the data from the second step (compliance-check) instead of the last step
    if (result.success && result.steps && result.steps.length > 1) {
      return result.steps[1].result;
    }
    return result;
  }

  public async setupProductionMonitoring(monitoringConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('production-deployment', { 
      monitoringConfig, 
      applicationPath,
      productionConfig: { environment: 'production', deploymentStrategy: 'rolling' }
    });
    
    // Return the data from the second step (setup-monitoring) instead of the last step
    if (result.success && result.steps && result.steps.length > 1) {
      return result.steps[1].result;
    }
    return result;
  }

  public async manageProductionScaling(scalingConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('production-deployment', { 
      scalingConfig, 
      applicationPath,
      productionConfig: { environment: 'production', deploymentStrategy: 'rolling' }
    });
    
    // Return the data from the last step (manage-scaling) instead of the last step
    if (result.success && result.steps && result.steps.length > 0) {
      return result.steps[result.steps.length - 1].result;
    }
    return result;
  }

  public async performBlueGreenDeployment(deploymentConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('advanced-deployment-strategies', { 
      deploymentConfig, 
      applicationPath,
      monitoringConfig: { enabled: true, metrics: ['deployment'] }
    });
    
    // Return the data from the first step (blue-green-deploy) instead of the last step
    if (result.success && result.steps && result.steps.length > 0) {
      return result.steps[0].result;
    }
    return result;
  }

  public async performCanaryDeployment(deploymentConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('advanced-deployment-strategies', { 
      deploymentConfig, 
      applicationPath,
      monitoringConfig: { enabled: true, metrics: ['deployment'] }
    });
    
    // Return the data from the second step (canary-deploy) instead of the last step
    if (result.success && result.steps && result.steps.length > 1) {
      return result.steps[1].result;
    }
    return result;
  }

  public async performRollingDeployment(deploymentConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('advanced-deployment-strategies', { 
      deploymentConfig, 
      applicationPath,
      monitoringConfig: { enabled: true, metrics: ['deployment'] }
    });
    
    // Return the data from the third step (rolling-deploy) instead of the last step
    if (result.success && result.steps && result.steps.length > 2) {
      return result.steps[2].result;
    }
    return result;
  }

  public async optimizeProductionPerformance(optimizationConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('performance-optimization-production', { 
      optimizationConfig, 
      applicationPath,
      scalingConfig: optimizationConfig?.scaling,
      monitoringConfig: { enabled: true, metrics: ['performance'] }
    });
    
    // Return the data from the first step (optimize-performance) instead of the last step
    if (result.success && result.steps && result.steps.length > 0) {
      return result.steps[0].result;
    }
    return result;
  }

  public async performDisasterRecovery(recoveryConfig: any, applicationPath: string): Promise<Result<any>> {
    const result = await this.executeWorkflow('security-hardening', { 
      recoveryConfig, 
      applicationPath,
      monitoringConfig: { enabled: true, metrics: ['recovery'] }
    });
    
    // Return the data from the last step (disaster-recovery) instead of the last step
    if (result.success && result.steps && result.steps.length > 0) {
      return result.steps[result.steps.length - 1].result;
    }
    return result;
  }

  public async runCompleteProductionPipeline(projectName: string, description: string, requirements: string, outputPath: string): Promise<Result<any>> {
    return await this.executeWorkflow('complete-production-pipeline', { projectName, description, requirements, outputPath });
  }

  // Utility Methods
  public getAvailableWorkflows(): string[] {
    return Array.from(this.workflows.keys());
  }

  public getWorkflowSteps(workflowName: string): WorkflowStep[] {
    return this.workflows.get(workflowName) || [];
  }

  private prepareNextTask(currentStep: WorkflowStep, previousResult: any): Task {
    return {
      id: `task_${Date.now()}`,
      type: currentStep.task,
      description: currentStep.description,
      data: previousResult,
      agentType: currentStep.agent,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// File System Operations Class
class FileSystemOperations {
  public async createFile(filePath: string, content: string): Promise<Result<void>> {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ File created: ${filePath}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to create file ${filePath}: ${error}` };
    }
  }

  public async createDirectory(dirPath: string): Promise<Result<void>> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`✅ Directory created: ${dirPath}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to create directory ${dirPath}: ${error}` };
    }
  }

  public async modifyFile(filePath: string, content: string): Promise<Result<void>> {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ File modified: ${filePath}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to modify file ${filePath}: ${error}` };
    }
  }

  public async deleteFile(filePath: string): Promise<Result<void>> {
    try {
      await fs.unlink(filePath);
      console.log(`✅ File deleted: ${filePath}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete file ${filePath}: ${error}` };
    }
  }

  public async readFile(filePath: string): Promise<Result<string>> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: `Failed to read file ${filePath}: ${error}` };
    }
  }

  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async listFiles(dirPath: string): Promise<Result<string[]>> {
    try {
      const files = await fs.readdir(dirPath);
      return { success: true, data: files };
    } catch (error) {
      return { success: false, error: `Failed to list files in ${dirPath}: ${error}` };
    }
  }
} 