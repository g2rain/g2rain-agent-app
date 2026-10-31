/**
 * 聊天会话表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 聊天会话表接口
 */
export interface ChatConversation extends BaseVo {
  organId: number;
  organName?: string;
  conversationId: string;
  userId: number;
  title: string;
  activeTaskId: string;
  /** 当前任务状态（查询时回填） */
  activeTaskStatus: string | null;
  sessionShared: string;
  stateVersion: number;
  lastMessageTime: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ChatConversationPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  conversationId?: string;
  userId?: number;
  title?: string;
  activeTaskId?: string;
  sessionShared?: string;
  stateVersion?: number;
  lastMessageTime?: string;
}

/**
 * 聊天会话表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ChatConversationQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  conversationId?: string;
  userId?: number;
  title?: string;
  activeTaskId?: string;
  sessionShared?: string;
  stateVersion?: number;
  lastMessageTime?: string;
}

