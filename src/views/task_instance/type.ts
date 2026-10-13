/**
 * 任务实例表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 任务实例表接口
 */
export interface TaskInstance extends BaseVo {
  organId: number;
  conversationId: string;
  taskId: string;
  agentId: number;
  goalSummary: string;
  request: string;
  skillVersions: string;
  shared: string;
  prior: string;
  record: string;
  sourceMessageId: string;
  status: string;
  currentNodeId: string;
  finalMessage: string;
  startedTime: string;
  suspendedTime: string;
  finishedTime: string;
  traceId: string;
  stateVersion: number;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface TaskInstancePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  conversationId?: string;
  taskId?: string;
  agentId?: number;
  goalSummary?: string;
  request?: string;
  skillVersions?: string;
  shared?: string;
  prior?: string;
  record?: string;
  sourceMessageId?: string;
  status?: string;
  currentNodeId?: string;
  finalMessage?: string;
  startedTime?: string;
  suspendedTime?: string;
  finishedTime?: string;
  traceId?: string;
  stateVersion?: number;
}

/**
 * 任务实例表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface TaskInstanceQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  conversationId?: string;
  taskId?: string;
  agentId?: number;
  goalSummary?: string;
  request?: string;
  skillVersions?: string;
  shared?: string;
  prior?: string;
  record?: string;
  sourceMessageId?: string;
  status?: string;
  currentNodeId?: string;
  finalMessage?: string;
  startedTime?: string;
  suspendedTime?: string;
  finishedTime?: string;
  traceId?: string;
  stateVersion?: number;
}

