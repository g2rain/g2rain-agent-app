/**
 * 会话详情 API（g2rain-agent-runtime，只读）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type {
  ChatConversationVo,
  ChatMessageVo,
  ConversationBundle,
  TaskGraphNodeVo,
  TaskInstanceVo,
  TaskResumeRecordVo,
} from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

async function list<T>(table: string, params: Record<string, string>): Promise<T[]> {
  const res = await getHttpClient('default').get<T[]>(`${Gateway.HARNESS}/${table}/list`, params);
  return res.data ?? [];
}

export class ConversationDetailApi {
  /**
   * 会话、全部消息、全部任务及各任务的恢复记录；会话不存在时返回 null。
   * 恢复记录按任务逐个查询（后端暂无按会话聚合的接口），任务数通常在十个以内。
   */
  static async load(conversationId: string): Promise<ConversationBundle | null> {
    const query = { conversationId };
    const [conversations, messages, tasks] = await Promise.all([
      list<ChatConversationVo>('chat_conversation', query),
      list<ChatMessageVo>('chat_message', query),
      list<TaskInstanceVo>('task_instance', query),
    ]);
    const conversation = conversations[0];
    if (!conversation) return null;
    const groups = await Promise.all(
      tasks.map((task) => list<TaskResumeRecordVo>('task_resume_record', { taskId: task.taskId })),
    );
    const resumes = Object.fromEntries(tasks.map((task, index) => [task.taskId, groups[index]]));
    return { conversation, messages, tasks, resumes };
  }

  /** 任务步骤，选中任务时按需加载 */
  static nodes(taskId: string): Promise<TaskGraphNodeVo[]> {
    return list<TaskGraphNodeVo>('task_graph_node', { taskId });
  }
}
