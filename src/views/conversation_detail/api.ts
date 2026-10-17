/**
 * 会话详情 API：聚合各生成器 list / page 接口。
 */
import { ChatConversationApi } from '@/views/chat_conversation/api';
import { ChatMessageApi } from '@/views/chat_message/api';
import { TaskInstanceApi } from '@/views/task_instance/api';
import { TaskResumeRecordApi } from '@/views/task_resume_record/api';
import { TaskGraphNodeApi } from '@/views/task_graph_node/api';
import type {
  ChatConversationVo,
  ChatMessageVo,
  ConversationBundle,
  TaskGraphNodeVo,
  TaskInstanceVo,
  TaskResumeRecordVo,
} from './type';

export class ConversationDetailApi {
  /** 分页拉取会话消息 */
  static async pageMessages(
    conversationId: string,
    pageNum: number,
    pageSize: number,
  ): Promise<{ records: ChatMessageVo[]; total: number }> {
    const messagePage = await ChatMessageApi.page({
      conversationId,
      pageNum,
      pageSize,
      sorts: ['createdAtMs,asc'],
    } as Parameters<typeof ChatMessageApi.page>[0]);
    return {
      records: (messagePage?.records ?? []) as ChatMessageVo[],
      total: messagePage?.total ?? 0,
    };
  }

  /**
   * 会话、当前页消息、全部任务及各任务的恢复记录；会话不存在时返回 null。
   */
  static async load(
    conversationId: string,
    pageNum = 1,
    pageSize = 20,
  ): Promise<ConversationBundle | null> {
    const query = { conversationId };
    const [conversations, messagePage, tasks] = await Promise.all([
      ChatConversationApi.list(query) as Promise<ChatConversationVo[]>,
      this.pageMessages(conversationId, pageNum, pageSize),
      TaskInstanceApi.list(query) as Promise<TaskInstanceVo[]>,
    ]);
    const conversation = conversations[0];
    if (!conversation) return null;
    const groups = await Promise.all(
      tasks.map((task) =>
        TaskResumeRecordApi.list({ taskId: task.taskId }) as Promise<TaskResumeRecordVo[]>,
      ),
    );
    const resumes = Object.fromEntries(tasks.map((task, index) => [task.taskId, groups[index]]));
    return {
      conversation,
      messages: messagePage.records,
      messageTotal: messagePage.total,
      tasks,
      resumes,
    };
  }

  /** 任务步骤，选中任务时按需加载 */
  static nodes(taskId: string): Promise<TaskGraphNodeVo[]> {
    return TaskGraphNodeApi.list({ taskId }) as Promise<TaskGraphNodeVo[]>;
  }
}
