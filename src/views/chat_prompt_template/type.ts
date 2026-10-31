/**
 * 问题模板相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 问题模板接口
 */
export interface ChatPromptTemplate extends BaseVo {
  organId: number;
  organName?: string;
  promptText: string;
  sortOrder: number;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface ChatPromptTemplatePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  promptText?: string;
  sortOrder?: number;
  status?: string;
  description?: string;
}

/**
 * 问题模板查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface ChatPromptTemplateQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  status?: string;
}

