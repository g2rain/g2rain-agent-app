/**
 * 模型服务配置相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 模型服务配置接口
 */
export interface ModelServiceProfile extends BaseVo {
  organId: number;
  catalogId: number;
  temperature: string;
  topP: string;
  maxTokens: number;
  timeoutMs: number;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ModelServiceProfilePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  catalogId?: number;
  temperature?: string;
  topP?: string;
  maxTokens?: number;
  timeoutMs?: number;
  status?: string;
  description?: string;
}

/**
 * 模型服务配置查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ModelServiceProfileQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  catalogId?: number;
  temperature?: string;
  topP?: string;
  maxTokens?: number;
  timeoutMs?: number;
  status?: string;
  description?: string;
}

