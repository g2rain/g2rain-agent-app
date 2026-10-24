/**
 * 会话详情 API：直接调用 runtime 接口，不依赖生成器页面模块。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type {
  ChatConversationVo,
  ChatMessageVo,
  ChatProgressVo,
  TaskGraphNodeVo,
  TaskInstanceVo,
  TaskResumeRecordVo,
} from './type';

const base = Gateway.HARNESS;
const http = () => getHttpClient('default');

/** 一个消息窗口内任务数的上限（两页消息里的用户消息数远小于此值） */
const TASK_LIMIT = 200;

export class ConversationDetailApi {
  /** 会话；不存在时返回 null */
  static async conversation(conversationId: string): Promise<ChatConversationVo | null> {
    const res = await http().get<ChatConversationVo[]>(`${base}/chat_conversation/list`, { conversationId });
    return res.data?.[0] ?? null;
  }

  /** 按时间正序分页取消息；id 作为第二排序键，保证同一毫秒内的顺序稳定 */
  static async messages(conversationId: string, pageNum: number, pageSize: number): Promise<PageData<ChatMessageVo>> {
    const res = await http().get<PageData<ChatMessageVo>>(`${base}/chat_message/page`, {
      conversationId,
      pageNum,
      pageSize,
      sorts: ['createdAtMs,asc', 'id,asc'],
    });
    return res.data;
  }

  /** 由这些用户消息触发的任务（摘要列，不含大字段） */
  static async tasks(conversationId: string, sourceMessageIds: string[]): Promise<TaskInstanceVo[]> {
    if (sourceMessageIds.length === 0) return [];
    const res = await http().get<PageData<TaskInstanceVo>>(`${base}/task_instance/page`, {
      conversationId,
      sourceMessageIds,
      pageNum: 1,
      pageSize: TASK_LIMIT,
    });
    return res.data?.records ?? [];
  }

  /** 这些任务的恢复记录 */
  static async resumes(taskIds: string[]): Promise<TaskResumeRecordVo[]> {
    if (taskIds.length === 0) return [];
    const res = await http().get<TaskResumeRecordVo[]>(`${base}/task_resume_record/list`, { taskIds });
    return res.data ?? [];
  }

  /** 任务详情（含 record 等大字段），选中任务时按需加载 */
  static async task(taskId: string): Promise<TaskInstanceVo | null> {
    const res = await http().get<TaskInstanceVo | null>(`${base}/task_instance/by_task/${encodeURIComponent(taskId)}`);
    return res.data ?? null;
  }

  /** 一轮的执行过程（含排查信息），选中时按需加载 */
  static async progress(traceId: string): Promise<ChatProgressVo[]> {
    const res = await http().get<ChatProgressVo[]>(`${base}/chat_progress/list`, { traceId, sorts: ['seq,asc'] });
    return res.data ?? [];
  }

  /** 任务步骤，选中任务时按需加载 */
  static async nodes(taskId: string): Promise<TaskGraphNodeVo[]> {
    const res = await http().get<TaskGraphNodeVo[]>(`${base}/task_graph_node/list`, { taskId });
    return res.data ?? [];
  }
}
