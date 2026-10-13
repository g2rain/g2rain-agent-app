/**
 * 任务图步骤表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 任务图步骤表接口
 */
export interface TaskGraphNode extends BaseVo {
  organId: number;
  taskId: string;
  nodeId: string;
  title: string;
  objective: string;
  skillKey: string;
  target: string;
  targetClaimed: number;
  delegateDepth: number;
  status: string;
  result: string;
  inputs: string;
  outputs: string;
  state: string;
  errorCode: string;
  errorMessage: string;
  startedTime: string;
  finishedTime: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface TaskGraphNodePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  taskId?: string;
  nodeId?: string;
  title?: string;
  objective?: string;
  skillKey?: string;
  target?: string;
  targetClaimed?: number;
  delegateDepth?: number;
  status?: string;
  result?: string;
  inputs?: string;
  outputs?: string;
  state?: string;
  errorCode?: string;
  errorMessage?: string;
  startedTime?: string;
  finishedTime?: string;
}

/**
 * 任务图步骤表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface TaskGraphNodeQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  taskId?: string;
  nodeId?: string;
  title?: string;
  objective?: string;
  skillKey?: string;
  target?: string;
  targetClaimed?: number;
  delegateDepth?: number;
  status?: string;
  result?: string;
  inputs?: string;
  outputs?: string;
  state?: string;
  errorCode?: string;
  errorMessage?: string;
  startedTime?: string;
  finishedTime?: string;
}

