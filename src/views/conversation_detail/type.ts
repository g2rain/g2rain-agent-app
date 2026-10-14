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

/** 会话详情首屏数据 */
export interface ConversationBundle {
  conversation: ChatConversationVo;
  messages: ChatMessageVo[];
  tasks: TaskInstanceVo[];
  /** 各任务的恢复记录，按 taskId 分组 */
  resumes: Record<string, TaskResumeRecordVo[]>;
}
