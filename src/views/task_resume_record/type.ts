/**
 * 任务恢复动作审计表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 任务恢复动作审计表接口
 */
export interface TaskResumeRecord extends BaseVo {
  organId: number;
  taskId: string;
  nodeId: string;
  resumeId: string;
  checkpointId: string;
  messageId: string;
  resumeAction: string;
  payload: string;
  actedAt: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface TaskResumeRecordPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  taskId?: string;
  nodeId?: string;
  resumeId?: string;
  checkpointId?: string;
  messageId?: string;
  resumeAction?: string;
  payload?: string;
  actedAt?: string;
}

/**
 * 任务恢复动作审计表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface TaskResumeRecordQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  taskId?: string;
  nodeId?: string;
  resumeId?: string;
  checkpointId?: string;
  messageId?: string;
  resumeAction?: string;
  payload?: string;
  actedAt?: string;
}

