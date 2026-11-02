/**
 * 数字员工画像表相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * 数字员工画像表接口
 */
export interface AgentProfile extends BaseVo {
  organId: number;
  organName?: string;
  agentCode: string;
  agentName: string;
  resourceType: string;
  identityDesc: string;
  missionDesc: string;
  boundaryDesc: string;
  styleDesc: string;
  principleDesc: string;
  status: string;
  description: string;
}

/**
 * 用于创建 / 更新时提交的负载（不包含审计字段）
 */
export interface AgentProfilePayload {
  id?: number; // 更新时传入 ID，新增时不传
  organId?: number | null;
  agentCode?: string;
  agentName?: string;
  resourceType?: string;
  identityDesc?: string;
  missionDesc?: string;
  boundaryDesc?: string;
  styleDesc?: string;
  principleDesc?: string;
  description?: string;
}

/**
 * 数字员工画像表查询条件
 * 用于分页查询时的业务查询参数
 * 包含业务查询字段和基础查询字段（BaseSelectListDto）
 */
export interface AgentProfileQuery extends BaseSelectListDto {
  // 业务查询字段
  organId?: number;
  agentCode?: string;
  agentName?: string;
  resourceType?: string;
  identityDesc?: string;
  missionDesc?: string;
  boundaryDesc?: string;
  styleDesc?: string;
  principleDesc?: string;
  status?: string;
  description?: string;
}

