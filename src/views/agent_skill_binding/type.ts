/**
 * 数字员工相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 数字员工接口
 */
export interface AgentSkillBinding extends BaseVo {
  organId: number;
  agentId: number;
  skillId: number;
  enabledFlag: number;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface AgentSkillBindingPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  agentId?: number;
  skillId?: number;
  enabledFlag?: number;
  description?: string;
}

/**
 * 数字员工查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface AgentSkillBindingQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  agentId?: number;
  skillId?: number;
  enabledFlag?: number;
  description?: string;
}

