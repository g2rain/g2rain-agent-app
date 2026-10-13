/**
 * 模型用量记录相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 模型用量记录接口
 */
export interface ModelUsageRecord extends BaseVo {
  organId: number;
  profileId: number;
  catalogId: number;
  protocol: string;
  provider: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ModelUsageRecordPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  profileId?: number;
  catalogId?: number;
  protocol?: string;
  provider?: string;
  modelName?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/**
 * 模型用量记录查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ModelUsageRecordQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  profileId?: number;
  catalogId?: number;
  protocol?: string;
  provider?: string;
  modelName?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

