/**
 * 模型用量明细。
 */

export interface ModelUsageVo {
  id: number;
  profileId: number;
  catalogId: number;
  modelName: string;
  provider: string;
  protocol: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createTime: string;
}

export interface ModelUsageQuery {
  profileId?: number;
  createTime?: [string, string];
}

export interface ModelUsageStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  callCount: number;
}

export interface ModelUsageOption {
  id: number;
  label?: string;
  modelName?: string;
}
