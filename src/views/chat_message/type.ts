/**
 * 聊天消息表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 聊天消息表接口
 */
export interface ChatMessage extends BaseVo {
  organId: number;
  conversationId: string;
  taskId: string;
  nodeId: string;
  round: number;
  messageId: string;
  channel: string;
  model: string;
  role: string;
  messageType: string;
  content: string;
  traceId: string;
  createdAtMs: number;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ChatMessagePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  conversationId?: string;
  taskId?: string;
  nodeId?: string;
  round?: number;
  messageId?: string;
  channel?: string;
  model?: string;
  role?: string;
  messageType?: string;
  content?: string;
  traceId?: string;
  createdAtMs?: number;
}

/**
 * 聊天消息表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ChatMessageQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  conversationId?: string;
  taskId?: string;
  nodeId?: string;
  round?: number;
  messageId?: string;
  channel?: string;
  model?: string;
  role?: string;
  messageType?: string;
  content?: string;
  traceId?: string;
  createdAtMs?: number;
}

