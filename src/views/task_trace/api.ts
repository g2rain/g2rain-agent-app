/**
 * 执行追踪 API：聚合各生成器 list 接口。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import { TaskInstanceApi } from '@/views/task_instance/api';
import { TaskGraphNodeApi } from '@/views/task_graph_node/api';
import { TaskGraphEdgeApi } from '@/views/task_graph_edge/api';
import { TaskCheckpointApi } from '@/views/task_checkpoint/api';
import { TaskResumeRecordApi } from '@/views/task_resume_record/api';
import { ToolCallRecordApi } from '@/views/tool_call_record/api';
import { ChatMessageApi } from '@/views/chat_message/api';
import { TaskNodePayloadApi } from '@/views/task_node_payload/api';
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

export class TaskTraceApi {
  /**
   * 一次取齐任务追踪所需数据；任务不存在时返回 null。
   */
  static async load(taskId: string): Promise<TraceBundle | null> {
    const query = { taskId };
    const [task, nodes, edges, checkpoints, resumes, calls, messages] = await Promise.all([
      TaskInstanceApi.getByTaskId(taskId) as Promise<TaskInstanceVo | null>,
      TaskGraphNodeApi.list(query) as Promise<TaskGraphNodeVo[]>,
      TaskGraphEdgeApi.list(query) as Promise<TaskGraphEdgeVo[]>,
      TaskCheckpointApi.list(query) as Promise<TaskCheckpointVo[]>,
      TaskResumeRecordApi.list(query) as Promise<TaskResumeRecordVo[]>,
      ToolCallRecordApi.list(query) as Promise<ToolCallRecordVo[]>,
      ChatMessageApi.list(query) as Promise<ChatMessageVo[]>,
    ]);
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
    const rows = (await TaskNodePayloadApi.list({ payloadId })) as TaskNodePayloadVo[];
    return rows[0] ?? null;
  }
}
