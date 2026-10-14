/**
 * 控制台使用的业务枚举，取值与后端表结构保持一致（区分大小写）。
 */

/** 任务状态（task_instance.status） */
export enum TaskStatus {
  RUNNING = 'RUNNING',
  SUSPENDED = 'SUSPENDED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

/** 节点状态（task_graph_node.status） */
export enum NodeStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  WAITING_DELEGATE = 'WAITING_DELEGATE',
  SUSPENDED = 'SUSPENDED',
  DONE = 'DONE',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
}

/** 工具调用状态（tool_call_record.call_status） */
export enum CallStatus {
  STARTED = 'STARTED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_PRE_CALL = 'UNKNOWN_PRE_CALL',
}

/** 工具副作用（tool_call_record.side_effect） */
export enum SideEffect {
  NONE = 'NONE',
  WRITE = 'WRITE',
}

/** 边类型（task_graph_edge.edge_type） */
export enum EdgeType {
  NORMAL = 'NORMAL',
  DELEGATE = 'DELEGATE',
}

/** 检查点类型（task_checkpoint.type） */
export enum CheckpointType {
  FOLLOW_UP = 'FOLLOW_UP',
  APPROVAL = 'APPROVAL',
  VERIFY = 'VERIFY',
}

/** 恢复动作（task_resume_record.resume_action） */
export enum ResumeAction {
  REPLY = 'REPLY',
  CONFIRM = 'CONFIRM',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
}

/** 消息角色（chat_message.role） */
export enum MessageRole {
  USER = 'USER',
  AGENT = 'AGENT',
}

/** 记录启停状态（各配置表 status） */
export enum RecordStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** 资源来源（各配置表 resource_type） */
export enum ResourceType {
  MARKET = 'MARKET',
  CUSTOM = 'CUSTOM',
  PLATFORM = 'PLATFORM',
  BUILT_IN = 'BUILT_IN',
  EXTENSION = 'EXTENSION',
  CUSTOMER = 'CUSTOMER',
}

/** 模型类型（model_service_catalog.model_type） */
export enum ModelType {
  LLM = 'LLM',
  VECTOR = 'VECTOR',
  RERANK = 'RERANK',
}

/** 模型协议（model_service_catalog.protocol） */
export enum ModelProtocol {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GEMINI = 'GEMINI',
}

/** 任务、节点已结束（不再变化）的状态 */
export const TERMINAL_TASK_STATUSES: ReadonlySet<string> = new Set([
  TaskStatus.SUCCEEDED,
  TaskStatus.FAILED,
  TaskStatus.CANCELED,
]);
