/**
 * 模型配置（model_service_profile）类型
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/** 列表/明细（联表目录字段） */
export interface ModelServiceProfile extends BaseVo {
  organId?: number;
  organName?: string;
  catalogId: number;
  displayName?: string;
  selectable?: boolean;
  defaultFlag?: boolean;
  modelName?: string;
  modelType?: string;
  resourceType?: string;
  provider?: string;
  protocol?: string;
  baseUrl?: string;
  apiKeyConfigured?: boolean;
  temperature?: number | string | null;
  topP?: number | string | null;
  maxTokens?: number | null;
  timeoutMs?: number | null;
  status: string;
  description?: string | null;
}

/** 保存负载 */
export interface ModelServiceProfilePayload {
  id?: number;
  organId?: number;
  catalogId?: number;
  displayName?: string;
  selectable?: boolean;
  modelName?: string;
  modelType?: string;
  provider?: string;
  protocol?: string;
  baseUrl?: string;
  apiKey?: string;
  temperature?: number | string;
  topP?: number | string;
  maxTokens?: number;
  timeoutMs?: number;
  description?: string;
}

/** 查询条件 */
export interface ModelServiceProfileQuery extends BaseSelectListDto {
  organId?: number;
  modelName?: string;
  modelType?: string;
  resourceType?: string;
  status?: string;
  provider?: string;
}

/** 模型广场候选 */
export interface MarketCatalogOption {
  id: number;
  modelName: string;
  modelType: string;
  provider: string;
  protocol: string;
  status?: string;
}
