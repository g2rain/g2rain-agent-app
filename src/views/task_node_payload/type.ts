/**
 * 大报文溢出表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 大报文溢出表接口
 */
export interface TaskNodePayload extends BaseVo {
  organId: number;
  payloadId: string;
  taskId: string;
  nodeId: string;
  payloadType: string;
  payloadData: string;
  toolName: string;
  traceId: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface TaskNodePayloadPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  payloadId?: string;
  taskId?: string;
  nodeId?: string;
  payloadType?: string;
  payloadData?: string;
  toolName?: string;
  traceId?: string;
}

/**
 * 大报文溢出表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface TaskNodePayloadQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  payloadId?: string;
  taskId?: string;
  nodeId?: string;
  payloadType?: string;
  payloadData?: string;
  toolName?: string;
  traceId?: string;
}

