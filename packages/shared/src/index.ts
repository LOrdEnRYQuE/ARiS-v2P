// Agent Types
export enum AgentType {
  DISPATCHER = 'dispatcher',
  ARCHITECTUS = 'architectus',
  SCRIBA = 'scriba',
  SCRIBA_BACKEND = 'scriba_backend',
  SCRIBA_FRONTEND = 'scriba_frontend',
  AUDITOR = 'auditor',
  PROMETHEUS = 'prometheus',
  GENESIS = 'genesis',
  EXECUTOR = 'executor',
  PRODUCTION = 'production',
  UX_MAESTRO = 'ux_maestro'
}

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  isActive: boolean;
}

// Workflow Types
export interface WorkflowStep {
  agent: AgentType;
  task: string;
  description: string;
  config?: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  data?: any;
  error?: string;
  steps?: Array<{ step: WorkflowStep; result: Result<any> }>;
}

// Enhanced Task Types
export interface Task {
  id: string;
  type: string;
  description: string;
  data?: Record<string, any>;
  agentType?: AgentType;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdAt?: Date;
  updatedAt?: Date;
  dependencies?: string[];
  result?: any;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  blueprint: Blueprint;
  tasks: Task[];
  agents: Agent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Blueprint {
  id: string;
  projectId: string;
  fileStructure: FileStructure;
  apiContracts: ApiContract[];
  databaseSchema: DatabaseSchema;
  technologies: Technology[];
  createdAt: Date;
}

export interface FileStructure {
  root: Directory;
}

export interface Directory {
  name: string;
  type: 'directory';
  children: (File | Directory)[];
}

export interface File {
  name: string;
  type: 'file';
  extension: string;
  content?: string;
}

export interface ApiContract {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  requestBody?: any;
  responseBody?: any;
  parameters?: Parameter[];
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface DatabaseSchema {
  tables: Table[];
}

export interface Table {
  name: string;
  columns: Column[];
  indexes?: Index[];
  relationships?: Relationship[];
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: ForeignKey;
}

export interface ForeignKey {
  table: string;
  column: string;
}

export interface Index {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface Technology {
  name: string;
  version: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'testing';
}

// Communication Types
export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType;
  type: MessageType;
  content: any;
  timestamp: Date;
  correlationId?: string;
}

export enum MessageType {
  TASK_REQUEST = 'task_request',
  TASK_RESPONSE = 'task_response',
  BLUEPRINT_REQUEST = 'blueprint_request',
  BLUEPRINT_RESPONSE = 'blueprint_response',
  CODE_GENERATION_REQUEST = 'code_generation_request',
  CODE_GENERATION_RESPONSE = 'code_generation_response',
  AUDIT_REQUEST = 'audit_request',
  AUDIT_RESPONSE = 'audit_response',
  EXECUTION_REQUEST = 'execution_request',
  EXECUTION_RESPONSE = 'execution_response'
}

// Security Types
export interface SecurityContext {
  userId: string;
  permissions: Permission[];
  sessionId: string;
  timestamp: Date;
}

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'execute' | 'delete';
  scope: 'project' | 'workspace' | 'global';
}

// Utility Types
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
} 