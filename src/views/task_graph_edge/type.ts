/**
 * 任务图依赖边表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 任务图依赖边表接口
 */
export interface TaskGraphEdge extends BaseVo {
  organId: number;
  taskId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeType: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface TaskGraphEdgePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  taskId?: string;
  fromNodeId?: string;
  toNodeId?: string;
  edgeType?: string;
}

/**
 * 任务图依赖边表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface TaskGraphEdgeQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  taskId?: string;
  fromNodeId?: string;
  toNodeId?: string;
  edgeType?: string;
}

