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

/** 执行过程步骤（chat_progress）；extra 为排查信息 JSON */
export interface ChatProgressVo {
  id: number;
  traceId: string;
  taskId: string | null;
  stepId: string;
  parentStepId: string | null;
  seq: number;
  stage: 'ROUTE' | 'PLAN' | 'NODE' | 'ROUND' | 'MODEL' | 'TOOL' | 'VERIFY';
  status: 'RUNNING' | 'DONE' | 'FAILED';
  title: string;
  detail: string | null;
  nodeId: string | null;
  round: number | null;
  errorCode: string | null;
  extra: string | null;
  startedAtMs: number;
  elapsedMs: number | null;
}

/** 选中轮次的执行过程；error 表示加载失败 */
export type ProgressDetail = ChatProgressVo[] | 'error';
