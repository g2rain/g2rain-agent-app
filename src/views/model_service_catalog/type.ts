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
  resourceType: string;
  provider: string;
  protocol: string;
  baseUrl: string;
  apiKey: string;
  status: string;
  description: string;
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
  status?: string;
  description?: string;
}

/**
 * 模型服务目录查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ModelServiceCatalogQuery extends BaseSelectListDto {
  // 业务查询字段
  modelName?: string;
  modelType?: string;
  resourceType?: string;
  provider?: string;
  protocol?: string;
  baseUrl?: string;
  apiKey?: string;
  status?: string;
  description?: string;
}

