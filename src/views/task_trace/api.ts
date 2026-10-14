/**
 * 执行追踪 API（g2rain-agent-runtime，只读）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type {
  ChatMessageVo,
  TaskCheckpointVo,
  TaskGraphEdgeVo,
  TaskGraphNodeVo,
  TaskInstanceVo,
  TaskNodePayloadVo,
  TaskResumeRecordVo,
  ToolCallRecordVo,
  TraceBundle,
} from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

const base = Gateway.HARNESS;

async function list<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const res = await getHttpClient('default').get<T[]>(`${base}${path}/list`, params);
  return res.data ?? [];
}

export class TaskTraceApi {
  /**
   * 一次取齐任务追踪所需数据；任务不存在时返回 null。
   */
  static async load(taskId: string): Promise<TraceBundle | null> {
    const query = { taskId };
    const [tasks, nodes, edges, checkpoints, resumes, calls, messages] = await Promise.all([
      list<TaskInstanceVo>('/task_instance', query),
      list<TaskGraphNodeVo>('/task_graph_node', query),
      list<TaskGraphEdgeVo>('/task_graph_edge', query),
      list<TaskCheckpointVo>('/task_checkpoint', query),
      list<TaskResumeRecordVo>('/task_resume_record', query),
      list<ToolCallRecordVo>('/tool_call_record', query),
      list<ChatMessageVo>('/chat_message', query),
    ]);
    const task = tasks[0];
    return task ? { task, nodes, edges, checkpoints, resumes, calls, messages } : null;
  }

  /** 智能体名称；查不到时返回空串 */
  static async agentName(agentId: number): Promise<string> {
    const res = await getHttpClient('default').get<{ agentName?: string }>(
      `${Gateway.STUDIO}/agent_profile/${agentId}/resolve`,
    );
    return res.data?.agentName ?? '';
  }

  /** 按需加载超长报文 */
  static async payload(payloadId: string): Promise<TaskNodePayloadVo | null> {
    const rows = await list<TaskNodePayloadVo>('/task_node_payload', { payloadId });
    return rows[0] ?? null;
  }
}
