/**
 * 智能体会话绑定表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 智能体会话绑定表接口
 */
export interface AgentSessionBinding extends BaseVo {
  organId: number;
  agentId: number;
  sessionType: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface AgentSessionBindingPayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number;
  agentId?: number;
  sessionType?: string;
}

/**
 * 智能体会话绑定表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface AgentSessionBindingQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  agentId?: number;
  sessionType?: string;
}

/**
 * 访问授权提交负载（全量）
 */
export interface AgentSessionAssignPayload {
  agentId: number;
  sessionTypes: string[];
}
