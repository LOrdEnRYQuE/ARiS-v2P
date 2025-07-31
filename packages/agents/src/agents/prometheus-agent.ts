import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, AgentMessage, MessageType, TaskPriority } from '@aris/shared';
import { OpenAIService, LLMConfig } from '@aris/llm';

export interface ConsultativeWorkflow {
  id: string;
  clientVision: string;
  currentPhase: WorkflowPhase;
  phases: WorkflowPhase[];
  agentAssignments: AgentAssignment[];
  consensusDecisions: ConsensusDecision[];
  timeline: WorkflowTimeline;
  qualityGates: QualityGate[];
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  agents: string[];
  tasks: WorkflowTask[];
  deliverables: string[];
  dependencies: string[];
  estimatedDuration: string;
  actualDuration?: string;
}

export interface WorkflowTask {
  id: string;
  name: string;
  description: string;
  assignedAgent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: string;
  dependencies: string[];
  result?: any;
}

export interface AgentAssignment {
  agentId: string;
  agentType: AgentType;
  role: string;
  responsibilities: string[];
  currentTasks: string[];
  availability: 'available' | 'busy' | 'unavailable';
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };
}

export interface ConsensusDecision {
  id: string;
  topic: string;
  description: string;
  participants: string[];
  options: DecisionOption[];
  selectedOption: string;
  rationale: string;
  timestamp: Date;
}

export interface DecisionOption {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  impact: 'high' | 'medium' | 'low';
  votes: string[];
}

export interface WorkflowTimeline {
  startDate: Date;
  endDate: Date;
  phases: TimelinePhase[];
  milestones: Milestone[];
  criticalPath: string[];
}

export interface TimelinePhase {
  phaseId: string;
  startDate: Date;
  endDate: Date;
  dependencies: string[];
  resources: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'achieved' | 'delayed';
  deliverables: string[];
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  criteria: QualityCriteria[];
  status: 'pending' | 'passed' | 'failed';
  evaluator: string;
  timestamp?: Date;
}

export interface QualityCriteria {
  id: string;
  name: string;
  description: string;
  threshold: number;
  actualValue?: number;
  status: 'pending' | 'passed' | 'failed';
}

export class PrometheusAgent extends BaseAgent {
  private activeWorkflows: Map<string, ConsultativeWorkflow> = new Map();
  private agentRegistry: Map<string, AgentAssignment> = new Map();
  private llmService?: OpenAIService;

  /**
   * Helper method to make LLM requests with proper error handling
   */
  private async makeLLMRequest(prompt: string, taskType: string = 'analysis'): Promise<any> {
    if (!this.llmService) {
      throw new Error('LLM service not initialized');
    }

    const response = await this.llmService.processTask({
      id: `${taskType}-${Date.now()}`,
      type: taskType,
      description: `LLM request for ${taskType}`,
      data: { prompt },
      priority: TaskPriority.HIGH
    });

    if (!response.success) {
      throw new Error(response.error || `Failed to process ${taskType} request`);
    }

    return JSON.parse(response.data);
  }

  constructor() {
    super(
      'prometheus-agent',
      AgentType.PROMETHEUS,
      'Prometheus',
      'Project Management and Workflow Orchestration Specialist',
      [
        'workflow_orchestration',
        'agent_coordination',
        'consensus_facilitation',
        'quality_gate_management',
        'resource_optimization',
        'timeline_management',
        'risk_assessment',
        'performance_monitoring',
        'task_delegation',
        'consultative_workflow'
      ]
    );
  }

  /**
   * Initialize the LLM service
   */
  public async initializeLLM(config: LLMConfig): Promise<void> {
    this.llmService = new OpenAIService(config);
  }

  public async processTask(task: Task): Promise<Result<any>> {
    try {
      console.log(`Prometheus processing task: ${task.type}`);

      switch (task.type) {
        case 'orchestrate-consultative-workflow':
          return await this.orchestrateConsultativeWorkflow(task);
        case 'coordinate-agents':
          return await this.coordinateAgents(task);
        case 'facilitate-consensus':
          return await this.facilitateConsensus(task);
        case 'manage-quality-gates':
          return await this.manageQualityGates(task);
        case 'optimize-resources':
          return await this.optimizeResources(task);
        case 'manage-timeline':
          return await this.manageTimeline(task);
        case 'assess-risks':
          return await this.assessRisks(task);
        case 'monitor-performance':
          return await this.monitorPerformance(task);
        case 'delegate-tasks':
          return await this.delegateTasks(task);
        case 'facilitate-consensus':
          return await this.facilitateConsensus(task);
        default:
          return { success: false, error: `Unknown task type: ${task.type}` };
      }
    } catch (error) {
      return { success: false, error: `Prometheus agent error: ${error}` };
    }
  }

  private async orchestrateConsultativeWorkflow(task: Task): Promise<Result<ConsultativeWorkflow>> {
    const { clientVision, businessGoals, constraints } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const workflow = await this.createConsultativeWorkflow(clientVision, businessGoals, constraints);
      this.activeWorkflows.set(workflow.id, workflow);
      
      // Initialize agent assignments
      await this.initializeAgentAssignments(workflow);
      
      // Start the first phase
      await this.startWorkflowPhase(workflow.id, workflow.phases[0].id);
      
      return { success: true, data: workflow };
    } catch (error) {
      return { success: false, error: `Failed to orchestrate workflow: ${error}` };
    }
  }

  private async coordinateAgents(task: Task): Promise<Result<any>> {
    const { workflowId, phaseId } = task.data || {};

    if (!workflowId) {
      return { success: false, error: 'Workflow ID not provided' };
    }

    try {
      const workflow = this.activeWorkflows.get(workflowId);
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }

      const coordination = await this.coordinateAgentActivities(workflow, phaseId);
      return { success: true, data: coordination };
    } catch (error) {
      return { success: false, error: `Failed to coordinate agents: ${error}` };
    }
  }

  private async facilitateConsensus(task: Task): Promise<Result<ConsensusDecision>> {
    const { topic, participants, options, workflowId } = task.data || {};

    if (!topic || !participants || !options) {
      return { success: false, error: 'Consensus topic, participants, and options required' };
    }

    try {
      const consensus = await this.facilitateHierarchicalConsensus(topic, participants, options, workflowId);
      return { success: true, data: consensus };
    } catch (error) {
      return { success: false, error: `Failed to facilitate consensus: ${error}` };
    }
  }

  private async manageQualityGates(task: Task): Promise<Result<QualityGate[]>> {
    const { workflowId, phaseId } = task.data || {};

    if (!workflowId) {
      return { success: false, error: 'Workflow ID not provided' };
    }

    try {
      const qualityGates = await this.manageQualityGateProcess(workflowId, phaseId);
      return { success: true, data: qualityGates };
    } catch (error) {
      return { success: false, error: `Failed to manage quality gates: ${error}` };
    }
  }

  private async optimizeResources(task: Task): Promise<Result<any>> {
    const { workflowId } = task.data || {};

    if (!workflowId) {
      return { success: false, error: 'Workflow ID not provided' };
    }

    try {
      const optimization = await this.optimizeResourceAllocation(workflowId);
      return { success: true, data: optimization };
    } catch (error) {
      return { success: false, error: `Failed to optimize resources: ${error}` };
    }
  }

  private async manageTimeline(task: Task): Promise<Result<WorkflowTimeline>> {
    const { workflowId } = task.data || {};

    if (!workflowId) {
      return { success: false, error: 'Workflow ID not provided' };
    }

    try {
      const timeline = await this.manageWorkflowTimeline(workflowId);
      return { success: true, data: timeline };
    } catch (error) {
      return { success: false, error: `Failed to manage timeline: ${error}` };
    }
  }

  private async assessRisks(task: Task): Promise<Result<any>> {
    const { workflowId } = task.data || {};

    if (!workflowId) {
      return { success: false, error: 'Workflow ID not provided' };
    }

    try {
      const riskAssessment = await this.assessWorkflowRisks(workflowId);
      return { success: true, data: riskAssessment };
    } catch (error) {
      return { success: false, error: `Failed to assess risks: ${error}` };
    }
  }

  private async monitorPerformance(task: Task): Promise<Result<any>> {
    const { workflowId } = task.data || {};

    if (!workflowId) {
      return { success: false, error: 'Workflow ID not provided' };
    }

    try {
      const performance = await this.monitorWorkflowPerformance(workflowId);
      return { success: true, data: performance };
    } catch (error) {
      return { success: false, error: `Failed to monitor performance: ${error}` };
    }
  }

  private async delegateTasks(task: Task): Promise<Result<any>> {
    const { workflowId, phaseId, tasks } = task.data || {};

    if (!workflowId || !tasks) {
      return { success: false, error: 'Workflow ID and tasks required' };
    }

    try {
      const delegation = await this.delegateWorkflowTasks(workflowId, phaseId, tasks);
      return { success: true, data: delegation };
    } catch (error) {
      return { success: false, error: `Failed to delegate tasks: ${error}` };
    }
  }

  // Workflow Orchestration Methods
  private async createConsultativeWorkflow(
    clientVision: string, 
    businessGoals?: any, 
    constraints?: any
  ): Promise<ConsultativeWorkflow> {
    const prompt = `Create a consultative workflow for this project:
    
    Vision: ${clientVision}
    Business Goals: ${JSON.stringify(businessGoals || {})}
    Constraints: ${JSON.stringify(constraints || {})}
    
    Design a comprehensive workflow including:
    - Workflow phases and stages
    - Agent assignments and roles
    - Timeline and milestones
    - Quality gates and checkpoints
    - Risk management strategies
    
    Return as a ConsultativeWorkflow JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'workflow-creation');
  }

  private async initializeAgentAssignments(workflow: ConsultativeWorkflow): Promise<void> {
    const prompt = `Initialize agent assignments for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    
    Assign agents to appropriate roles and responsibilities.
    Consider agent capabilities and workflow requirements.
    
    Return as an array of AgentAssignment objects.`;
    
    const assignments = await this.makeLLMRequest(prompt, 'agent-assignment');
    
    // Initialize agent registry
    assignments.forEach((assignment: AgentAssignment) => {
      this.agentRegistry.set(assignment.agentId, assignment);
    });
  }

  private async startWorkflowPhase(workflowId: string, phaseId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const phase = workflow.phases.find(p => p.id === phaseId);
    if (!phase) {
      throw new Error(`Phase ${phaseId} not found in workflow ${workflowId}`);
    }

    phase.status = 'in_progress';
    console.log(`Started phase ${phaseId} in workflow ${workflowId}`);
  }

  private async coordinateAgentActivities(
    workflow: ConsultativeWorkflow, 
    phaseId?: string
  ): Promise<any> {
    const prompt = `Coordinate agent activities for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    Phase ID: ${phaseId || 'all'}
    
    Coordinate agent activities and ensure proper collaboration.
    Manage task dependencies and resource allocation.
    
    Return as coordination result object.`;
    
    return await this.makeLLMRequest(prompt, 'agent-coordination');
  }

  private async facilitateHierarchicalConsensus(
    topic: string, 
    participants: string[], 
    options: DecisionOption[], 
    workflowId?: string
  ): Promise<ConsensusDecision> {
    const prompt = `Facilitate hierarchical consensus for this topic:
    
    Topic: ${topic}
    Participants: ${JSON.stringify(participants)}
    Options: ${JSON.stringify(options)}
    Workflow ID: ${workflowId || 'none'}
    
    Facilitate consensus building among participants.
    Consider hierarchical decision-making process.
    
    Return as a ConsensusDecision object.`;
    
    return await this.makeLLMRequest(prompt, 'consensus-facilitation');
  }

  private async manageQualityGateProcess(
    workflowId: string, 
    phaseId?: string
  ): Promise<QualityGate[]> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const prompt = `Manage quality gate process for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    Phase ID: ${phaseId || 'all'}
    
    Evaluate quality gates and ensure standards are met.
    Manage quality criteria and thresholds.
    
    Return as an array of QualityGate objects.`;
    
    return await this.makeLLMRequest(prompt, 'quality-gate-management');
  }

  private async optimizeResourceAllocation(workflowId: string): Promise<any> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const prompt = `Optimize resource allocation for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    
    Optimize resource allocation to maximize efficiency.
    Consider agent availability and task requirements.
    
    Return as resource optimization result.`;
    
    return await this.makeLLMRequest(prompt, 'resource-optimization');
  }

  private async manageWorkflowTimeline(workflowId: string): Promise<WorkflowTimeline> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const prompt = `Manage workflow timeline for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    
    Manage timeline and ensure milestones are met.
    Adjust timeline based on progress and constraints.
    
    Return as a WorkflowTimeline object.`;
    
    return await this.makeLLMRequest(prompt, 'timeline-management');
  }

  private async assessWorkflowRisks(workflowId: string): Promise<any> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const prompt = `Assess risks for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    
    Assess potential risks and mitigation strategies.
    Consider technical, timeline, and resource risks.
    
    Return as risk assessment result.`;
    
    return await this.makeLLMRequest(prompt, 'risk-assessment');
  }

  private async monitorWorkflowPerformance(workflowId: string): Promise<any> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const prompt = `Monitor performance for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    
    Monitor workflow performance and agent productivity.
    Track metrics and identify improvement opportunities.
    
    Return as performance monitoring result.`;
    
    return await this.makeLLMRequest(prompt, 'performance-monitoring');
  }

  private async delegateWorkflowTasks(
    workflowId: string, 
    phaseId?: string, 
    tasks?: WorkflowTask[]
  ): Promise<any> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const prompt = `Delegate tasks for this workflow:
    
    Workflow: ${JSON.stringify(workflow)}
    Phase ID: ${phaseId || 'all'}
    Tasks: ${JSON.stringify(tasks || [])}
    
    Delegate tasks to appropriate agents.
    Consider agent capabilities and availability.
    
    Return as task delegation result.`;
    
    return await this.makeLLMRequest(prompt, 'task-delegation');
  }

  private async delegateTaskToAgent(task: WorkflowTask): Promise<void> {
    const prompt = `Delegate this task to an appropriate agent:
    
    Task: ${JSON.stringify(task)}
    
    Select the best agent for this task.
    Consider agent capabilities and current workload.
    
    Return as agent assignment result.`;
    
    const result = await this.makeLLMRequest(prompt, 'task-assignment');
    console.log(`Delegated task ${task.id} to agent: ${result.agentId}`);
  }
} 