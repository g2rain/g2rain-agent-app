/**
 * 会话详情的读取模型。任务、消息等运行时类型由执行追踪模块提供。
 */
import type { ChatMessageVo, TaskGraphNodeVo, TaskInstanceVo, TaskResumeRecordVo } from '@/views/task_trace';

export type { ChatMessageVo, TaskGraphNodeVo, TaskInstanceVo, TaskResumeRecordVo };

/** 会话（chat_conversation） */
export interface ChatConversationVo {
  id: number;
  conversationId: string;
  userId: number;
  title: string | null;
  activeTaskId: string | null;
  sessionShared: string | null;
  lastMessageTime: string | null;
  createTime: string;
}

/** 选中任务的按需明细；error 表示加载失败 */
export type TaskDetail = { task: TaskInstanceVo | null; nodes: TaskGraphNodeVo[] } | 'error';
