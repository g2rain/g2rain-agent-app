/**
 * 用量统计（model_usage_record）类型
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

export interface ModelUsageRecord extends BaseVo {
  organId?: number;
  profileId: number;
  catalogId?: number;
  protocol?: string;
  provider?: string;
  modelName?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ModelUsageRecordQuery extends BaseSelectListDto {
  organId?: number;
  profileId?: number;
  modelName?: string;
  provider?: string;
}

export interface ModelUsageProfileOption {
  id: number;
  label?: string;
  modelName?: string;
}
