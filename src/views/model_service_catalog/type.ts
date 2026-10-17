/**
 * 模型服务目录相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 模型服务目录接口
 */
export interface ModelServiceCatalog extends BaseVo {
  modelName: string;
  modelType: string;
  resourceType?: string;
  provider: string;
  protocol: string;
  baseUrl: string;
  /** 是否已配置访问密钥（不回传明文） */
  apiKeyConfigured?: boolean;
  status: string;
  description?: string | null;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ModelServiceCatalogPayload {
  id?: number; // 更新时传入 ID，新增时不传
  modelName?: string;
  modelType?: string;
  resourceType?: string;
  provider?: string;
  protocol?: string;
  baseUrl?: string;
  apiKey?: string;
  description?: string;
}

/**
 * 模型服务目录查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ModelServiceCatalogQuery extends BaseSelectListDto {
  // 业务查询字段（不含 apiKey / baseUrl / description；resourceType 由后端固定 MARKET）
  modelName?: string;
  modelType?: string;
  provider?: string;
  protocol?: string;
  status?: string;
}

