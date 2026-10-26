/**
 * 外部服务表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 外部服务表接口
 */
export interface McpExternalService extends BaseVo {
  organId?: number;
  name: string;
  endpoint: string;
  resourceType: string;
  status: string;
  description: string | null;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface McpExternalServicePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  name?: string;
  endpoint?: string;
  resourceType?: string;
  description?: string;
}

/**
 * 外部服务表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface McpExternalServiceQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  name?: string;
  endpoint?: string;
  resourceType?: string;
  status?: string;
  description?: string;
}

