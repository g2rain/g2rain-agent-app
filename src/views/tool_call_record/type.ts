/**
 * 工具调用记录表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 工具调用记录表接口
 */
export interface ToolCallRecord extends BaseVo {
  organId: number;
  taskId: string;
  nodeId: string;
  callId: string;
  toolName: string;
  sideEffect: string;
  request: string;
  argsHash: string;
  idempotencyKey: string;
  round: number;
  response: string;
  resultSummary: string;
  entities: string;
  payloadId: string;
  callStatus: string;
  businessOk: number;
  emptyResult: number;
  failureKind: string;
  errorCode: string;
  errorMessage: string;
  durationMs: number;
  traceId: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ToolCallRecordPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  taskId?: string;
  nodeId?: string;
  callId?: string;
  toolName?: string;
  sideEffect?: string;
  request?: string;
  argsHash?: string;
  idempotencyKey?: string;
  round?: number;
  response?: string;
  resultSummary?: string;
  entities?: string;
  payloadId?: string;
  callStatus?: string;
  businessOk?: number;
  emptyResult?: number;
  failureKind?: string;
  errorCode?: string;
  errorMessage?: string;
  durationMs?: number;
  traceId?: string;
}

/**
 * 工具调用记录表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ToolCallRecordQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  taskId?: string;
  nodeId?: string;
  callId?: string;
  toolName?: string;
  sideEffect?: string;
  request?: string;
  argsHash?: string;
  idempotencyKey?: string;
  round?: number;
  response?: string;
  resultSummary?: string;
  entities?: string;
  payloadId?: string;
  callStatus?: string;
  businessOk?: number;
  emptyResult?: number;
  failureKind?: string;
  errorCode?: string;
  errorMessage?: string;
  durationMs?: number;
  traceId?: string;
}

