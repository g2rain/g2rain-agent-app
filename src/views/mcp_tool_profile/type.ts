/**
 * 暴露档案表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 暴露档案表接口
 */
export interface McpToolProfile extends BaseVo {
  organId: number;
  name: string;
  title: string;
  resourceType: string;
  serviceCode: string;
  sourceId: number;
  method: string;
  path: string;
  openapiOperation: string;
  inputSchema: string;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface McpToolProfilePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  name?: string;
  title?: string;
  resourceType?: string;
  serviceCode?: string;
  sourceId?: number;
  method?: string;
  path?: string;
  openapiOperation?: string;
  inputSchema?: string;
  status?: string;
  description?: string;
}

/**
 * 暴露档案表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface McpToolProfileQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  name?: string;
  title?: string;
  resourceType?: string;
  serviceCode?: string;
  sourceId?: number;
  method?: string;
  path?: string;
  openapiOperation?: string;
  inputSchema?: string;
  status?: string;
  description?: string;
}

