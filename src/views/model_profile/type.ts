/**
 * 模型配置（profile + 联表目录字段）。
 */

export interface ModelProfileVo {
  id: number;
  catalogId: number;
  temperature: string | null;
  topP: string | null;
  maxTokens: number | null;
  timeoutMs: number;
  status: string;
  description: string | null;
  updateTime: string;
  modelName: string;
  modelType: string;
  resourceType: string;
  provider: string;
  protocol: string;
  baseUrl: string;
  apiKey?: string | null;
}

export interface ModelProfileQuery {
  modelName?: string;
  modelType?: string;
  resourceType?: string;
  status?: string;
}

export interface ModelProfilePayload {
  id?: number;
  catalogId?: number;
  temperature?: string | null;
  topP?: string | null;
  maxTokens?: number | null;
  timeoutMs?: number;
  status?: string;
  description?: string | null;
  /** 接入私有时携带的目录字段（同事务待后端） */
  catalog?: {
    modelName?: string;
    modelType?: string;
    resourceType?: string;
    provider?: string;
    protocol?: string;
    baseUrl?: string;
    apiKey?: string;
    description?: string | null;
    status?: string;
  };
}

export interface ModelOption {
  id: number;
  label?: string;
  modelName?: string;
}

/** 广场模型候选（目录精简字段） */
export interface MarketCatalogOption {
  id: number;
  modelName: string;
  modelType: string;
  provider: string;
  protocol: string;
  status: string;
  description: string | null;
}
