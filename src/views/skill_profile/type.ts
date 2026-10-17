/**
 * 定义表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 定义表接口
 */
export interface SkillProfile extends BaseVo {
  organId: number;
  agentId: number;
  skillKey: string;
  skillName: string;
  resourceType: string;
  semanticDesc: string;
  skillManual: string;
  skillContract: string;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface SkillProfilePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  agentId?: number;
  skillKey?: string;
  skillName?: string;
  resourceType?: string;
  semanticDesc?: string;
  skillManual?: string;
  skillContract?: string;
  status?: string;
  description?: string;
}

/**
 * 定义表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface SkillProfileQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  agentId?: number;
  skillKey?: string;
  skillName?: string;
  resourceType?: string;
  semanticDesc?: string;
  skillManual?: string;
  skillContract?: string;
  status?: string;
  description?: string;
}

