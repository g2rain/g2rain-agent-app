/**
 * 执行追踪 API：直接调用 runtime 与 studio 接口，不依赖生成器页面模块。
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

const base = Gateway.HARNESS;
const http = () => getHttpClient('default');

async function list<T>(resource: string, params: Record<string, unknown>): Promise<T[]> {
  const res = await http().get<T[]>(`${base}/${resource}/list`, params);
  return res.data ?? [];
}

export class TaskTraceApi {
  /** 一次取齐任务追踪所需数据；任务不存在时返回 null */
  static async load(taskId: string): Promise<TraceBundle | null> {
    const query = { taskId };
    const [task, nodes, edges, checkpoints, resumes, calls, messages] = await Promise.all([
      TaskTraceApi.task(taskId),
      list<TaskGraphNodeVo>('task_graph_node', query),
      list<TaskGraphEdgeVo>('task_graph_edge', query),
      list<TaskCheckpointVo>('task_checkpoint', query),
      list<TaskResumeRecordVo>('task_resume_record', query),
      list<ToolCallRecordVo>('tool_call_record', query),
      list<ChatMessageVo>('chat_message', query),
    ]);
    return task ? { task, nodes, edges, checkpoints, resumes, calls, messages } : null;
  }

  /** 任务详情（含大字段）；不存在时返回 null */
  static async task(taskId: string): Promise<TaskInstanceVo | null> {
    const res = await http().get<TaskInstanceVo | null>(`${base}/task_instance/by_task/${encodeURIComponent(taskId)}`);
    return res.data ?? null;
  }

  /** 智能体名称；查不到时返回空串 */
  static async agentName(agentId: number): Promise<string> {
    const res = await http().get<string | null>(`${Gateway.STUDIO}/agent_profile/${agentId}/name`);
    return res.data ?? '';
  }

  /** 按需加载超长报文 */
  static async payload(payloadId: string): Promise<TaskNodePayloadVo | null> {
    const rows = await list<TaskNodePayloadVo>('task_node_payload', { payloadId });
    return rows[0] ?? null;
  }
}
