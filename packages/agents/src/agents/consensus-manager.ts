import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, AgentMessage, MessageType } from '@aris/shared';

export interface ConsensusRequest {
  id: string;
  blueprint: any;
  participants: AgentType[];
  deadline: Date;
  requiredApprovals: number;
}

export interface ConsensusResponse {
  agentType: AgentType;
  approved: boolean;
  feedback: string[];
  suggestions: string[];
  confidence: number;
}

export interface ConsensusResult {
  approved: boolean;
  responses: ConsensusResponse[];
  finalBlueprint: any;
  feedback: string[];
}

export class ConsensusManager extends BaseAgent {
  private activeConsensus: Map<string, ConsensusRequest> = new Map();
  private consensusResponses: Map<string, ConsensusResponse[]> = new Map();

  constructor() {
    super(
      'consensus-001',
      AgentType.AUDITOR, // Reusing AUDITOR type for now, could be extended
      'Consensus Manager',
      'Manages hierarchical agent consensus for blueprint approval',
      [
        'consensus-management',
        'blueprint-validation',
        'agent-coordination',
        'feedback-aggregation',
        'decision-making'
      ]
    );
  }

  /**
   * Initiate consensus process for a blueprint
   */
  public async initiateConsensus(request: ConsensusRequest): Promise<Result<ConsensusResult>> {
    try {
      console.log(`Initiating consensus for blueprint: ${request.id}`);
      
      this.activeConsensus.set(request.id, request);
      this.consensusResponses.set(request.id, []);
      
      // Send consensus requests to all participants
      const consensusPromises = request.participants.map(agentType =>
        this.sendConsensusRequest(request.id, agentType, request.blueprint)
      );
      
      // Wait for all responses or timeout
      const responses = await Promise.allSettled(consensusPromises);
      const validResponses = responses
        .filter((r): r is PromiseFulfilledResult<ConsensusResponse> => r.status === 'fulfilled')
        .map(r => r.value);
      
      this.consensusResponses.set(request.id, validResponses);
      
      // Analyze consensus results
      const result = this.analyzeConsensus(request, validResponses);
      
      // Cleanup
      this.activeConsensus.delete(request.id);
      this.consensusResponses.delete(request.id);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Consensus failed: ${error}`
      };
    }
  }

  /**
   * Send consensus request to a specific agent
   */
  private async sendConsensusRequest(
    consensusId: string,
    agentType: AgentType,
    blueprint: any
  ): Promise<ConsensusResponse> {
    const message: AgentMessage = {
      id: `consensus-${consensusId}-${Date.now()}`,
      from: AgentType.AUDITOR,
      to: agentType,
      type: MessageType.BLUEPRINT_REQUEST,
      content: {
        consensusId,
        blueprint,
        requestType: 'consensus-review'
      },
      timestamp: new Date()
    };

    // Simulate agent response (in real implementation, this would be async)
    return await this.simulateAgentResponse(agentType, blueprint);
  }

  /**
   * Simulate agent response for consensus (placeholder for real agent communication)
   */
  private async simulateAgentResponse(agentType: AgentType, blueprint: any): Promise<ConsensusResponse> {
    // Simulate agent responses based on agent type
    const responses: Record<AgentType, { approved: boolean; feedback: string[]; suggestions: string[]; confidence: number }> = {
      [AgentType.SCRIBA_FRONTEND]: {
        approved: true,
        feedback: ['Frontend architecture looks good', 'Component structure is well organized'],
        suggestions: ['Add loading states', 'Implement error boundaries'],
        confidence: 0.85
      },
      [AgentType.SCRIBA_BACKEND]: {
        approved: true,
        feedback: ['Backend structure is solid', 'API design follows best practices'],
        suggestions: ['Add input validation', 'Implement proper error handling'],
        confidence: 0.88
      },
      [AgentType.SCRIBA]: {
        approved: true,
        feedback: ['Code generation approach is good', 'Multi-language support is comprehensive'],
        suggestions: ['Add code templates', 'Implement code formatting'],
        confidence: 0.87
      },
      [AgentType.ARCHITECTUS]: {
        approved: true,
        feedback: ['Architecture is well designed', 'Scalability considerations are good'],
        suggestions: ['Consider microservices for future scaling', 'Add monitoring infrastructure'],
        confidence: 0.92
      },
      [AgentType.AUDITOR]: {
        approved: true,
        feedback: ['Code quality standards met', 'Security practices followed'],
        suggestions: ['Add input validation', 'Implement proper error handling'],
        confidence: 0.88
      },
      [AgentType.DISPATCHER]: {
        approved: true,
        feedback: ['Workflow orchestration looks good'],
        suggestions: ['Add retry mechanisms', 'Implement circuit breakers'],
        confidence: 0.85
      },
      [AgentType.EXECUTOR]: {
        approved: true,
        feedback: ['Deployment strategy is solid'],
        suggestions: ['Add health checks', 'Implement rollback procedures'],
        confidence: 0.87
      },
      [AgentType.GENESIS]: {
        approved: true,
        feedback: ['UI/UX design is well thought out'],
        suggestions: ['Add accessibility features', 'Implement responsive design'],
        confidence: 0.86
      },
      [AgentType.PROMETHEUS]: {
        approved: true,
        feedback: ['Project management approach is good'],
        suggestions: ['Add progress tracking', 'Implement milestone monitoring'],
        confidence: 0.84
      },
      [AgentType.PRODUCTION]: {
        approved: true,
        feedback: ['Production readiness is good'],
        suggestions: ['Add monitoring', 'Implement logging'],
        confidence: 0.89
      },
      [AgentType.UX_MAESTRO]: {
        approved: true,
        feedback: ['Design system is well structured'],
        suggestions: ['Add dark mode support', 'Implement design tokens'],
        confidence: 0.83
      }
    };

    const response = responses[agentType] || {
      approved: true,
      feedback: ['Blueprint reviewed'],
      suggestions: [],
      confidence: 0.8
    };

    return {
      agentType,
      ...response
    };
  }

  /**
   * Analyze consensus results and make final decision
   */
  private analyzeConsensus(request: ConsensusRequest, responses: ConsensusResponse[]): ConsensusResult {
    const approvals = responses.filter(r => r.approved).length;
    const requiredApprovals = request.requiredApprovals || Math.ceil(request.participants.length * 0.7);
    
    const approved = approvals >= requiredApprovals;
    
    // Aggregate all feedback and suggestions
    const allFeedback = responses.flatMap(r => r.feedback);
    const allSuggestions = responses.flatMap(r => r.suggestions);
    
    // Calculate average confidence
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    // Apply suggestions to blueprint if consensus is approved
    let finalBlueprint = request.blueprint;
    if (approved && allSuggestions.length > 0) {
      finalBlueprint = this.applySuggestionsToBlueprint(request.blueprint, allSuggestions);
    }
    
    return {
      approved,
      responses,
      finalBlueprint,
      feedback: allFeedback
    };
  }

  /**
   * Apply agent suggestions to the blueprint
   */
  private applySuggestionsToBlueprint(blueprint: any, suggestions: string[]): any {
    const updatedBlueprint = { ...blueprint };
    
    suggestions.forEach(suggestion => {
      if (suggestion.includes('profile_image_url')) {
        // Add profile_image_url field to user endpoint
        if (updatedBlueprint.apiContracts) {
          const userEndpoint = updatedBlueprint.apiContracts.find((api: any) => 
            api.path.includes('/user') && api.method === 'GET'
          );
          if (userEndpoint && userEndpoint.responseBody) {
            userEndpoint.responseBody.properties = {
              ...userEndpoint.responseBody.properties,
              profile_image_url: { type: 'string', description: 'User profile image URL' }
            };
          }
        }
      }
      
      if (suggestion.includes('rate limiting')) {
        // Add rate limiting configuration
        if (!updatedBlueprint.security) {
          updatedBlueprint.security = {};
        }
        updatedBlueprint.security.rateLimiting = {
          enabled: true,
          requestsPerMinute: 100
        };
      }
      
      if (suggestion.includes('caching')) {
        // Add caching configuration
        if (!updatedBlueprint.performance) {
          updatedBlueprint.performance = {};
        }
        updatedBlueprint.performance.caching = {
          enabled: true,
          ttl: 300 // 5 minutes
        };
      }
    });
    
    return updatedBlueprint;
  }

  /**
   * Process consensus-related tasks
   */
  public async processTask(task: Task): Promise<Result<any>> {
    try {
      switch (task.type) {
        case 'initiate-consensus':
          return await this.initiateConsensus(task.data as ConsensusRequest);
        
        case 'review-blueprint':
          return await this.reviewBlueprintForConsensus(task.data);
        
        case 'validate-consensus':
          return await this.validateConsensusResult(task.data);
        
        default:
          return {
            success: false,
            error: `Unknown task type: ${task.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Consensus manager failed to process task: ${error}`
      };
    }
  }

  /**
   * Review blueprint for consensus
   */
  private async reviewBlueprintForConsensus(data: any): Promise<Result<any>> {
    const { blueprint, participants } = data;
    
    const consensusRequest: ConsensusRequest = {
      id: `consensus-${Date.now()}`,
      blueprint,
      participants: participants || [AgentType.SCRIBA_FRONTEND, AgentType.SCRIBA_BACKEND, AgentType.AUDITOR],
      deadline: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      requiredApprovals: Math.ceil((participants?.length || 3) * 0.7)
    };
    
    return await this.initiateConsensus(consensusRequest);
  }

  /**
   * Validate consensus result
   */
  private async validateConsensusResult(data: any): Promise<Result<any>> {
    const { consensusId } = data;
    const consensus = this.activeConsensus.get(consensusId);
    const responses = this.consensusResponses.get(consensusId);
    
    if (!consensus || !responses) {
      return {
        success: false,
        error: `Consensus ${consensusId} not found`
      };
    }
    
    const result = this.analyzeConsensus(consensus, responses);
    
    return {
      success: true,
      data: result
    };
  }

  /**
   * Handle consensus-related messages
   */
  protected async handleBlueprintRequest(message: AgentMessage): Promise<Result<any>> {
    const blueprint = message.content;
    
    if (!blueprint) {
      return { success: false, error: 'No blueprint provided' };
    }

    const response = await this.simulateAgentResponse(message.to, blueprint);
    return {
      success: true,
      data: response
    };
  }

  /**
   * Get consensus statistics
   */
  public getConsensusStats(): { active: number; completed: number; successRate: number } {
    const active = this.activeConsensus.size;
    const completed = this.consensusResponses.size;
    const successRate = completed > 0 ? 0.85 : 0; // Placeholder
    
    return { active, completed, successRate };
  }
} 