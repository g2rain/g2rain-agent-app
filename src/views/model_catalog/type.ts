/**
 * 模型目录（model_service_catalog）。
 */

export interface ModelCatalogVo {
  id: number;
  modelName: string;
  modelType: string;
  resourceType: string;
  provider: string;
  protocol: string;
  baseUrl: string;
  apiKey?: string | null;
  status: string;
  description: string | null;
  updateTime: string;
  /** 被引用机构数（待后端；Mock 用 profile 数近似） */
  refCount?: number;
  /** 私有模型所属机构（待后端） */
  organName?: string | null;
}

export interface ModelCatalogQuery {
  modelName?: string;
  modelType?: string;
  resourceType?: string;
  provider?: string;
  status?: string;
}

export type ModelCatalogPayload = Partial<Omit<ModelCatalogVo, 'refCount' | 'organName' | 'updateTime'>> & {
  id?: number;
};
