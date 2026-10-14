/**
 * 把会话消息整理成「轮」：一条用户消息加它引出的回复为一轮，任务挂在触发它的轮次下。
 *
 * @example
 * buildTurns(messages, tasks); // [{ user, replies, tasks, time }, ...]
 */
import { MessageRole, ResumeAction } from '@runtime/console';
import type { ChatMessageVo, TaskInstanceVo, TaskResumeRecordVo } from './type';

export interface Turn {
  key: string;
  /** 本轮开始时间（毫秒） */
  time: number;
  user: ChatMessageVo | null;
  replies: ChatMessageVo[];
  tasks: TaskInstanceVo[];
}

export function buildTurns(messages: readonly ChatMessageVo[], tasks: readonly TaskInstanceVo[]): Turn[] {
  const turns: Turn[] = [];
  for (const message of [...messages].sort((a, b) => a.createdAtMs - b.createdAtMs)) {
    const current = turns[turns.length - 1];
    if (message.role === MessageRole.USER || !current) {
      turns.push({
        key: message.messageId,
        time: message.createdAtMs,
        user: message.role === MessageRole.USER ? message : null,
        replies: message.role === MessageRole.USER ? [] : [message],
        tasks: [],
      });
    } else {
      current.replies.push(message);
    }
  }
  for (const task of tasks) {
    const turn =
      turns.find((t) => t.user?.messageId === task.sourceMessageId) ??
      turns.find((t) => [t.user, ...t.replies].some((m) => m?.taskId === task.taskId));
    turn?.tasks.push(task);
  }
  return turns;
}

/** 确认动作的展示语义 */
export type ApprovalOutcome = 'confirmed' | 'rejected' | 'replied' | 'canceled';

const OUTCOME_BY_ACTION: Record<string, ApprovalOutcome> = {
  [ResumeAction.CONFIRM]: 'confirmed',
  [ResumeAction.REJECT]: 'rejected',
  [ResumeAction.REPLY]: 'replied',
  [ResumeAction.CANCEL]: 'canceled',
};

export function approvalOutcome(resume: TaskResumeRecordVo): ApprovalOutcome {
  return OUTCOME_BY_ACTION[resume.resumeAction] ?? 'replied';
}
