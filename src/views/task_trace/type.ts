/**
 * 执行追踪的读取模型。JSON 列（state、request、response 等）保持字符串，由 trace.ts 统一解析。
 */

/** 任务实例（task_instance） */
export interface TaskInstanceVo {
  id: number;
  conversationId: string;
  taskId: string;
  agentId: number | null;
  goalSummary: string | null;
  request: string | null;
  shared: string | null;
  prior: string | null;
  taskRecord: string | null;
  sourceMessageId: string | null;
  status: string;
  currentNodeId: string | null;
  finalMessage: string | null;
  startedTime: string | null;
  suspendedTime: string | null;
  finishedTime: string | null;
  traceId: string | null;
}

/** 任务图节点（task_graph_node） */
export interface TaskGraphNodeVo {
  id: number;
  taskId: string;
  nodeId: string;
  title: string | null;
  objective: string | null;
  skillKey: string | null;
  target: string | null;
  targetClaimed: number | boolean | null;
  delegateDepth: number;
  status: string;
  result: string | null;
  inputs: string | null;
  outputs: string | null;
  state: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startedTime: string | null;
  finishedTime: string | null;
}

/** 任务图边（task_graph_edge） */
export interface TaskGraphEdgeVo {
  id: number;
  taskId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeType: string;
}

/** 检查点（task_checkpoint）；恢复后会被逻辑删除，历史以恢复记录为准 */
export interface TaskCheckpointVo {
  id: number;
  taskId: string;
  nodeId: string | null;
  checkpointId: string;
  type: string;
  question: string | null;
  expectedFields: string | null;
  allowedActions: string | null;
  suggestions: string | null;
  pendingAction: string | null;
}

/** 恢复动作（task_resume_record） */
export interface TaskResumeRecordVo {
  id: number;
  taskId: string;
  nodeId: string | null;
  resumeId: string;
  checkpointId: string | null;
  messageId: string | null;
  resumeAction: string;
  payload: string | null;
  actedAt: string | null;
}

/** 工具调用（tool_call_record） */
export interface ToolCallRecordVo {
  id: number;
  taskId: string;
  nodeId: string;
  callId: string;
  toolName: string;
  sideEffect: string;
  request: string | null;
  round: number | null;
  response: string | null;
  resultSummary: string | null;
  entities: string | null;
  payloadId: string | null;
  callStatus: string;
  businessOk: number | null;
  emptyResult: number;
  failureKind: string;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number | null;
  traceId: string | null;
  createTime: string;
}

/** 超长报文（task_node_payload） */
export interface TaskNodePayloadVo {
  id: number;
  payloadId: string;
  taskId: string;
  nodeId: string;
  payloadType: string;
  payloadData: string;
  toolName: string | null;
}

/** 对话消息（chat_message） */
export interface ChatMessageVo {
  id: number;
  conversationId: string;
  taskId: string | null;
  nodeId: string | null;
  round: number | null;
  messageId: string;
  role: string;
  messageType: string;
  content: string;
  createdAtMs: number;
  /** 本轮追踪号；最终回复据此关联执行过程 */
  traceId: string | null;
  /** 本轮耗时；仅最终回复 */
  elapsedMs: number | null;
}

/** 一次任务追踪所需的全部原始数据 */
export interface TraceBundle {
  task: TaskInstanceVo;
  nodes: TaskGraphNodeVo[];
  edges: TaskGraphEdgeVo[];
  checkpoints: TaskCheckpointVo[];
  resumes: TaskResumeRecordVo[];
  calls: ToolCallRecordVo[];
  messages: ChatMessageVo[];
}
