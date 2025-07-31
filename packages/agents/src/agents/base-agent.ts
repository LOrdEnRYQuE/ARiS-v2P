import { Agent, AgentType, Task, Result, AgentMessage, MessageType } from '@aris/shared';

export abstract class BaseAgent implements Agent {
  public id: string;
  public type: AgentType;
  public name: string;
  public description: string;
  public capabilities: string[];
  public isActive: boolean;

  constructor(
    id: string,
    type: AgentType,
    name: string,
    description: string,
    capabilities: string[]
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.isActive = false;
  }

  /**
   * Initialize the agent
   */
  public async initialize(): Promise<Result<void>> {
    try {
      this.isActive = true;
      console.log(`Agent ${this.name} (${this.type}) initialized`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to initialize agent ${this.name}: ${error}` 
      };
    }
  }

  /**
   * Deactivate the agent
   */
  public async deactivate(): Promise<Result<void>> {
    try {
      this.isActive = false;
      console.log(`Agent ${this.name} (${this.type}) deactivated`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to deactivate agent ${this.name}: ${error}` 
      };
    }
  }

  /**
   * Process a task
   */
  public abstract processTask(task: Task): Promise<Result<any>>;

  /**
   * Send a message to another agent
   */
  protected async sendMessage(
    to: AgentType,
    type: MessageType,
    content: any,
    correlationId?: string
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: this.generateMessageId(),
      from: this.type,
      to,
      type,
      content,
      timestamp: new Date(),
      correlationId
    };

    // TODO: Implement actual message sending via LSP
    console.log(`Agent ${this.name} sending message to ${to}:`, message);
    return message;
  }

  /**
   * Receive a message from another agent
   */
  public async receiveMessage(message: AgentMessage): Promise<Result<any>> {
    try {
      console.log(`Agent ${this.name} received message:`, message);
      
      // Handle different message types
      switch (message.type) {
        case MessageType.TASK_REQUEST:
          return await this.handleTaskRequest(message);
        case MessageType.BLUEPRINT_REQUEST:
          return await this.handleBlueprintRequest(message);
        case MessageType.CODE_GENERATION_REQUEST:
          return await this.handleCodeGenerationRequest(message);
        case MessageType.AUDIT_REQUEST:
          return await this.handleAuditRequest(message);
        case MessageType.EXECUTION_REQUEST:
          return await this.handleExecutionRequest(message);
        default:
          return { 
            success: false, 
            error: `Unknown message type: ${message.type}` 
          };
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to process message: ${error}` 
      };
    }
  }

  /**
   * Handle task request messages
   */
  protected async handleTaskRequest(message: AgentMessage): Promise<Result<any>> {
    // Default implementation - override in specific agents
    return { 
      success: false, 
      error: 'Task request handling not implemented' 
    };
  }

  /**
   * Handle blueprint request messages
   */
  protected async handleBlueprintRequest(message: AgentMessage): Promise<Result<any>> {
    // Default implementation - override in specific agents
    return { 
      success: false, 
      error: 'Blueprint request handling not implemented' 
    };
  }

  /**
   * Handle code generation request messages
   */
  protected async handleCodeGenerationRequest(message: AgentMessage): Promise<Result<any>> {
    // Default implementation - override in specific agents
    return { 
      success: false, 
      error: 'Code generation request handling not implemented' 
    };
  }

  /**
   * Handle audit request messages
   */
  protected async handleAuditRequest(message: AgentMessage): Promise<Result<any>> {
    // Default implementation - override in specific agents
    return { 
      success: false, 
      error: 'Audit request handling not implemented' 
    };
  }

  /**
   * Handle execution request messages
   */
  protected async handleExecutionRequest(message: AgentMessage): Promise<Result<any>> {
    // Default implementation - override in specific agents
    return { 
      success: false, 
      error: 'Execution request handling not implemented' 
    };
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get agent status
   */
  public getStatus(): { isActive: boolean; capabilities: string[] } {
    return {
      isActive: this.isActive,
      capabilities: this.capabilities
    };
  }
} 